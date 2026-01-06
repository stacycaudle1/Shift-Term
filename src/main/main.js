const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const net = require('net');
const { Client: SSHClient } = require('ssh2');
const Zmodem = require('zmodem.js');

let mainWindow;

// === ZMODEM Transfer State ===
let zmodemSession = null;
let zmodemSentry = null;
let pendingUpload = null; // { name, data } for user-initiated uploads

// Helper to send transfer progress to renderer
function sendTransferProgress(percent, status, details = {}) {
  if (mainWindow) {
    mainWindow.webContents.send('transfer:progress', { percent, status, ...details });
  }
}

// Helper to send ZMODEM detection status
function sendZmodemDetected(type) {
  if (mainWindow) {
    mainWindow.webContents.send('zmodem:detected', { type });
  }
}

// Helper to send debug messages to DevTools console
function debugLog(...args) {
  console.log('[MAIN]', ...args);
  if (mainWindow) {
    mainWindow.webContents.send('debug:log', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
  }
}

// Create downloads directory if needed
function getDownloadsDir() {
  const dir = path.join(process.cwd(), 'downloads');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// Handle ZMODEM session when detected
async function handleZmodemSession(zsession, client) {
  try {
    debugLog('handleZmodemSession called, type:', zsession.type, 'pendingUpload:', pendingUpload ? pendingUpload.name : 'null');
    zmodemSession = zsession;
    
    // Register session_end handler for both session types
    zsession.on('session_end', () => {
      debugLog('ZMODEM session ended');
      zmodemSession = null;
      sendTransferProgress(100, 'Transfer complete', { complete: true });
    });
    
    // Check if this is a send session (BBS wants to receive from us)
    if (zsession.type === 'send') {
      debugLog('This is a SEND session - BBS wants to receive a file');
      sendZmodemDetected('send');
      
      if (pendingUpload) {
        debugLog('We have a pending upload:', pendingUpload.name, 'size:', pendingUpload.data.length);
        // We have a file queued for upload
        const { name, data } = pendingUpload;
        pendingUpload = null;
        
        sendTransferProgress(0, `Uploading: ${name}`, { filename: name, direction: 'upload' });
        
        // Start upload asynchronously
        (async () => {
          try {
            const fileData = new Uint8Array(data);
            const xferOffer = {
              name: name,
              size: fileData.length,
              mtime: new Date(),
              files_remaining: 1,
              bytes_remaining: fileData.length
            };
            
            debugLog('Sending offer:', JSON.stringify(xferOffer));
            const xfer = await zsession.send_offer(xferOffer);
            debugLog('Offer result:', xfer ? 'accepted' : 'rejected/null');
            
            if (xfer) {
              // Send file in chunks
              const CHUNK_SIZE = 8192;
              let offset = 0;
              
              debugLog('Starting to send file data, size:', fileData.length);
              while (offset < fileData.length) {
                const chunk = fileData.slice(offset, offset + CHUNK_SIZE);
                await xfer.send(chunk);
                offset += chunk.length;
                const percent = Math.round((offset / fileData.length) * 100);
                sendTransferProgress(percent, `Uploading: ${name}`, { filename: name, sent: offset, size: fileData.length, direction: 'upload' });
              }
              
              debugLog('All data sent, calling xfer.end()');
              await xfer.end();
              sendTransferProgress(100, `Uploaded: ${name}`, { filename: name, direction: 'upload', complete: true });
              debugLog('ZMODEM upload complete:', name);
            } else {
              debugLog('Offer was rejected (xfer is null/undefined)');
              sendTransferProgress(0, 'Upload rejected by receiver', { direction: 'upload', error: 'rejected' });
            }
            
            debugLog('Closing session');
            await zsession.close();
          } catch (err) {
            const errMsg = typeof err === 'string' ? err : (err && err.message ? err.message : String(err));
            debugLog('ZMODEM upload error:', errMsg);
            sendTransferProgress(0, `Upload failed: ${errMsg}`, { error: errMsg, direction: 'upload' });
            try { zsession.abort(); } catch (e) { debugLog('Abort error:', e.message || e); }
          }
        })();
        
        return; // Don't call zsession.start() for send sessions we're managing
      } else {
        // No file queued - notify user to select a file
        debugLog('No pending upload - waiting for user to select file');
        sendTransferProgress(0, 'BBS ready to receive - select a file to upload', { direction: 'upload', waiting: true });
        return;
      }
    }
    
    // This is a RECEIVE session (BBS is sending files to us)
    debugLog('This is a RECEIVE session - BBS wants to send us a file');
    sendZmodemDetected('receive');
    
    // Register offer handler only for receive sessions
    zsession.on('offer', async (xfer) => {
      const filename = xfer.get_details().name;
      const size = xfer.get_details().size;
      debugLog('Received file offer:', filename, 'size:', size);
      
      sendTransferProgress(0, `Receiving: ${filename}`, { filename, size, direction: 'download' });
      
      const chunks = [];
      
      xfer.on('input', (payload) => {
        chunks.push(new Uint8Array(payload));
        const received = chunks.reduce((a, c) => a + c.length, 0);
        const percent = size ? Math.round((received / size) * 100) : 0;
        sendTransferProgress(percent, `Receiving: ${filename}`, { filename, received, size, direction: 'download' });
      });
      
      xfer.accept().then(() => {
        // Save the file
        const fullData = new Uint8Array(chunks.reduce((a, c) => a + c.length, 0));
        let offset = 0;
        for (const chunk of chunks) {
          fullData.set(chunk, offset);
          offset += chunk.length;
        }
        
        const savePath = path.join(getDownloadsDir(), filename);
        fs.writeFileSync(savePath, Buffer.from(fullData));
        
        sendTransferProgress(100, `Downloaded: ${filename}`, { filename, path: savePath, direction: 'download', complete: true });
        debugLog('ZMODEM download complete:', savePath);
      }).catch((err) => {
        sendTransferProgress(0, `Download failed: ${err.message}`, { error: err.message, direction: 'download' });
        debugLog('ZMODEM download error:', err.message || err);
      });
    });
    
    // For receive sessions, start automatically
    debugLog('Starting receive session');
    zsession.start();
  } catch (err) {
    debugLog('handleZmodemSession error:', err.message || err, err.stack);
  }
}

// Store current client reference for ZMODEM callbacks
let currentZmodemClient = null;

// Process data through ZMODEM sentry - returns data to display (or empty if consumed by ZMODEM)
function processZmodemData(data, client) {
  // Update current client reference
  currentZmodemClient = client;
  
  // Convert to proper Buffer if needed
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(data, 'binary');
  
  // Debug: Check for ZMODEM signatures in hex
  const hexData = buf.toString('hex');
  const hasZRINIT = hexData.includes('2a2a184230') || hexData.includes('2a184230');
  const hasZRQINIT = hexData.includes('2a2a184230') && hexData.includes('3030');
  
  // Log all incoming data for debugging
  if (buf.length < 100) {
    debugLog('Data received:', buf.length, 'bytes, hex:', hexData.substring(0, 60));
  }
  
  if (hasZRINIT) debugLog('*** ZRINIT pattern detected in data! ***');
  if (hasZRQINIT) debugLog('*** ZRQINIT pattern detected in data! ***');
  
  // If there's an active ZMODEM session, feed data to it
  if (zmodemSession) {
    try {
      const uint8 = new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
      zmodemSession.consume(uint8);
      debugLog('Fed', buf.length, 'bytes to active ZMODEM session');
    } catch (err) {
      debugLog('ZMODEM session consume error:', err.message || err);
      // Reset on error
      zmodemSession = null;
    }
    return; // Don't send to terminal during active transfer
  }
  
  if (!zmodemSentry) {
    debugLog('Initializing ZMODEM sentry');
    // Initialize ZMODEM sentry for this connection
    zmodemSentry = new Zmodem.Sentry({
      to_terminal: (octets) => {
        // Data that should go to terminal (not ZMODEM)
        debugLog('Sentry to_terminal:', octets.length, 'bytes');
        const termBuf = Buffer.from(octets);
        const win = mainWindow;
        if (win) win.webContents.send('term:data', termBuf.toString('binary'));
      },
      sender: (octets) => {
        // Send data to BBS - use current client reference
        debugLog('Sentry sender:', octets.length, 'bytes to BBS');
        const sendBuf = Buffer.from(octets);
        if (currentZmodemClient && currentZmodemClient.socket) {
          currentZmodemClient.socket.write(sendBuf);
        } else if (currentZmodemClient && currentZmodemClient.stream) {
          currentZmodemClient.stream.write(sendBuf);
        } else {
          console.error('No client available for ZMODEM sender');
        }
      },
      on_detect: (detection) => {
        // ZMODEM session detected!
        debugLog('*** ZMODEM SESSION DETECTED! ***', 'Role:', detection.get_session_role());
        try {
          // confirm() returns the session synchronously (not a Promise)
          const zsession = detection.confirm();
          debugLog('ZMODEM session confirmed, type:', zsession.type);
          handleZmodemSession(zsession, currentZmodemClient);
        } catch (err) {
          debugLog('ZMODEM detection/confirm error:', err.message || err);
        }
      },
      on_retract: () => {
        debugLog('ZMODEM detection retracted');
      }
    });
  }
  
  // Feed data to sentry - it will route appropriately
  try {
    // Create proper Uint8Array from Buffer
    const uint8 = new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
    debugLog('Feeding', uint8.length, 'bytes to ZMODEM sentry');
    zmodemSentry.consume(uint8);
  } catch (err) {
    // If ZMODEM parsing fails, just send to terminal
    debugLog('ZMODEM consume error:', err.message || err);
    const win = mainWindow;
    if (win) win.webContents.send('term:data', buf.toString('binary'));
  }
}

// Reset ZMODEM state (call on disconnect)
function resetZmodemState() {
  zmodemSession = null;
  zmodemSentry = null;
  pendingUpload = null;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    resizable: true,
    maximizable: true,
    minimizable: true,
    title: 'Shift-Term',
    webPreferences: {
      preload: path.join(__dirname, '../preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      devTools: true
    }
  });
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  
  // DevTools available via F12
  // mainWindow.webContents.openDevTools();
  
  // Create simple menu with DevTools option
  const menu = Menu.buildFromTemplate([
    {
      label: 'View',
      submenu: [
        { label: 'Toggle DevTools', accelerator: 'F12', click: () => mainWindow.webContents.toggleDevTools() },
        { label: 'Reload', accelerator: 'Ctrl+R', click: () => mainWindow.webContents.reload() }
      ]
    }
  ]);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Simple Telnet client with minimal negotiation (NAWS + TTYPE)
class TelnetClient {
    // Handle Telnet subnegotiation (currently a no-op)
    _handleSub(opt, data) {
      // No operation; can be extended for TTYPE, NAWS, etc.
    }
  constructor(getWin) {
    this.getWin = getWin;
    this.socket = null;
    this.bufferSB = null; // subnegotiation buffer
    this.columns = 80;
    this.rows = 25;
    this.logging = false;
    this.logStream = null;
    this.protocol = 'telnet';
  }

  connect(host, port) {
    if (this.socket) this.disconnect();
    this.socket = new net.Socket();
    this.socket.setKeepAlive(true, 15000);
    
    // Buffer initial data until status is sent
    let initialBuffer = [];
    let statusSent = false;

    this.socket.on('connect', () => {
      const win = this.getWin();
      if (win) win.webContents.send('term:status', { type: 'connected', host, port, protocol: 'telnet' });
      // Reset ZMODEM state for new connection
      resetZmodemState();
      // Small delay to allow terminal to clear before processing buffered data
      setTimeout(() => {
        statusSent = true;
        if (initialBuffer.length > 0) {
          for (const data of initialBuffer) {
            const rendered = this._processTelnet(data);
            if (rendered && rendered.length) {
              // Route through ZMODEM detector
              processZmodemData(rendered, this);
              if (this.logging && this.logStream) this.logStream.write(rendered);
            }
          }
          initialBuffer = [];
        }
      }, 50);
    });

    this.socket.on('data', (data) => {
      if (!statusSent) {
        initialBuffer.push(data);
        return;
      }
      const rendered = this._processTelnet(data);
      if (rendered && rendered.length) {
        // Route through ZMODEM detector instead of directly to terminal
        processZmodemData(rendered, this);
        if (this.logging && this.logStream) this.logStream.write(rendered);
      }
    });

    this.socket.on('error', (err) => {
      const win = this.getWin();
      if (win) win.webContents.send('term:status', { type: 'error', message: err.message });
    });

    this.socket.on('close', () => {
      const win = this.getWin();
      if (win) win.webContents.send('term:status', { type: 'disconnected' });
      if (this.logStream) { this.logStream.end(); this.logStream = null; }
      resetZmodemState();
    });

    this.socket.connect(port, host);
  }

  disconnect() {
    try { if (this.socket) this.socket.destroy(); } catch {}
    this.socket = null;
    resetZmodemState();
  }

  setSize(cols, rows) {
    this.columns = cols; this.rows = rows;
    this._sendNAWS();
  }

  setLogging(enabled) {
    this.logging = enabled;
    if (enabled && !this.logStream) {
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      const logPath = path.join(process.cwd(), 'logs', `session-${stamp}.bin`);
      fs.mkdirSync(path.dirname(logPath), { recursive: true });
      this.logStream = fs.createWriteStream(logPath);
    } else if (!enabled && this.logStream) {
      this.logStream.end();
      this.logStream = null;
    }
  }

  write(data) {
    if (!this.socket) return;
    const buf = Buffer.from(data, 'binary');
    this.socket.write(buf);
  }

  // Telnet parsing/negotiation
  _processTelnet(buf) {
    const IAC = 255, DO = 253, DONT = 254, WILL = 251, WONT = 252, SB = 250, SE = 240;
    const ECHO = 1, SGA = 3, TTYPE = 24, NAWS = 31;

    let out = Buffer.alloc(0);
    for (let i = 0; i < buf.length; i++) {
      const b = buf[i];
      if (b === IAC) {
        i++;
        const cmd = buf[i];
        if (cmd === IAC) {
          // Escaped 255 in data
          out = Buffer.concat([out, Buffer.from([IAC])]);
        } else if (cmd === DO || cmd === DONT || cmd === WILL || cmd === WONT) {
          i++;
          const opt = buf[i];
          this._respondNegotiation(cmd, opt);
        } else if (cmd === SB) {
          // accumulate until IAC SE
          const start = i + 1;
          const end = this._findSubEnd(buf, start);
          const opt = buf[start];
          const data = buf.slice(start + 1, end - 2); // exclude IAC SE
          this._handleSub(opt, data);
          i = end - 1; // will be incremented by loop
        } else if (cmd === SE) {
          // ignore stray SE
        } else {
          // Other commands: ignore
        }
      } else {
        out = Buffer.concat([out, Buffer.from([b])]);
      }
    }
    return out;
  }

  _findSubEnd(buf, start) {
    const IAC = 255, SE = 240;
    for (let j = start; j < buf.length - 1; j++) {
      if (buf[j] === IAC && buf[j + 1] === SE) return j + 2;
    }
    return buf.length;
  }

  _respondNegotiation(cmd, opt) {
    const IAC = 255, DO = 253, DONT = 254, WILL = 251, WONT = 252;
    const TTYPE = 24, NAWS = 31, ECHO = 1, SGA = 3;
    if (!this.socket) return;
    const send = (arr) => this.socket.write(Buffer.from(arr));

    if (cmd === DO) {
      switch (opt) {
        case NAWS:
          send([IAC, WILL, NAWS]);
          this._sendNAWS();
          break;
        case TTYPE:
          send([IAC, WILL, TTYPE]);
          this._sendTTYPE('ANSI');
          break;
        case SGA:
          send([IAC, WILL, SGA]);
          break;
        case ECHO:
          // Typically client SHOULD NOT echo; decline
          send([IAC, WONT, ECHO]);
          break;
        default:
          send([IAC, WONT, opt]);
      }
    } else if (cmd === WILL) {
      // Accept server SGA/ECHO if desired
      switch (opt) {
        case SGA:
          send([IAC, DO, SGA]);
          break;
        default:
          // DONT other options
          send([IAC, DONT, opt]);
      }
    }
  }

  _sendNAWS() {
    if (!this.socket) return;
    const IAC = 255, SB = 250, SE = 240, NAWS = 31;
    const w = this.columns, h = this.rows;
    const payload = [
      IAC, SB, NAWS,
      (w >> 8) & 0xff, w & 0xff,
      (h >> 8) & 0xff, h & 0xff,
      IAC, SE
    ];
    this.socket.write(Buffer.from(payload));
  }

  _sendTTYPE(name) {
    if (!this.socket) return;
    const IAC = 255, SB = 250, SE = 240, TTYPE = 24;
    const bytes = Buffer.from(name, 'ascii');
    const payload = Buffer.concat([
      Buffer.from([IAC, SB, TTYPE, 0]), // 0 = IS
      bytes,
      Buffer.from([IAC, SE])
    ]);
    this.socket.write(payload);
  }
}

// NOTE: Raw TCP connections removed for security - all connections now use Telnet or SSH

// SSH Client using ssh2 library
class SSHTerminalClient {
  constructor(getWin) {
    this.getWin = getWin;
    this.client = null;
    this.stream = null;
    this.columns = 80;
    this.rows = 25;
    this.logging = false;
    this.logStream = null;
    this.protocol = 'ssh';
  }

  connect(host, port, credentials = {}) {
    if (this.client) this.disconnect();
    
    this.client = new SSHClient();
    const { username = '', password = '', privateKey = null } = credentials;

    this.client.on('ready', () => {
      const win = this.getWin();
      if (win) win.webContents.send('term:status', { type: 'connected', host, port, protocol: 'ssh' });
      
      this.client.shell({ term: 'xterm-256color', cols: this.columns, rows: this.rows }, (err, stream) => {
        if (err) {
          if (win) win.webContents.send('term:status', { type: 'error', message: err.message });
          return;
        }
        
        this.stream = stream;
        
        stream.on('data', (data) => {
          const str = data.toString('binary');
          const win = this.getWin();
          if (win) win.webContents.send('term:data', str);
          if (this.logging && this.logStream) this.logStream.write(data);
        });
        
        stream.on('close', () => {
          const win = this.getWin();
          if (win) win.webContents.send('term:status', { type: 'disconnected' });
          this.disconnect();
        });
      });
    });

    this.client.on('error', (err) => {
      const win = this.getWin();
      if (win) win.webContents.send('term:status', { type: 'error', message: err.message });
    });

    this.client.on('close', () => {
      const win = this.getWin();
      if (win) win.webContents.send('term:status', { type: 'disconnected' });
      if (this.logStream) { this.logStream.end(); this.logStream = null; }
    });

    // Build connection config
    const config = {
      host,
      port,
      username: username || 'guest',
      readyTimeout: 20000,
      keepaliveInterval: 15000
    };

    if (privateKey) {
      config.privateKey = privateKey;
    } else if (password) {
      config.password = password;
    } else {
      // Try keyboard-interactive for BBSes that prompt for login
      config.tryKeyboard = true;
    }

    this.client.connect(config);
  }

  disconnect() {
    try { 
      if (this.stream) this.stream.end();
      if (this.client) this.client.end();
    } catch {}
    this.stream = null;
    this.client = null;
  }

  setSize(cols, rows) {
    this.columns = cols;
    this.rows = rows;
    if (this.stream) {
      this.stream.setWindow(rows, cols, 0, 0);
    }
  }

  setLogging(enabled) {
    this.logging = enabled;
    if (enabled && !this.logStream) {
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      const logPath = path.join(process.cwd(), 'logs', `session-${stamp}.bin`);
      fs.mkdirSync(path.dirname(logPath), { recursive: true });
      this.logStream = fs.createWriteStream(logPath);
    } else if (!enabled && this.logStream) {
      this.logStream.end();
      this.logStream = null;
    }
  }

  write(data) {
    if (!this.stream) return;
    this.stream.write(data);
  }
}

// Auto-detecting client - detects Telnet negotiation and uses Telnet protocol
class AutoDetectClient {
  constructor(getWin) {
    this.getWin = getWin;
    this.actualClient = null;
    this.socket = null;
    this.pendingData = [];
    this.detected = false;
    this.host = null;
    this.port = null;
    this.logging = false;
  }

  connect(host, port) {
    this.host = host;
    this.port = port;
    this.detected = false;
    this.pendingData = [];
    
    if (this.socket) this.disconnect();
    this.socket = new net.Socket();
    this.socket.setKeepAlive(true, 15000);
    this.socket.setTimeout(3000); // 3 second timeout for detection

    this.socket.on('connect', () => {
      const win = this.getWin();
      if (win) win.webContents.send('term:status', { type: 'detecting', host, port });
    });

    this.socket.on('data', (data) => {
      if (!this.detected) {
        // Check for Telnet IAC commands (0xFF followed by negotiation)
        const hasTelnet = this._containsTelnetCommands(data);
        this._finalizeDetection(hasTelnet ? 'telnet' : 'raw', data);
      }
    });

    this.socket.on('timeout', () => {
      if (!this.detected) {
        // No data received - assume raw connection
        this._finalizeDetection('raw', null);
      }
    });

    this.socket.on('error', (err) => {
      const win = this.getWin();
      if (win) win.webContents.send('term:status', { type: 'error', message: err.message });
    });

    this.socket.on('close', () => {
      if (!this.detected) {
        const win = this.getWin();
        if (win) win.webContents.send('term:status', { type: 'disconnected' });
      }
    });

    this.socket.connect(port, host);
  }

  _containsTelnetCommands(data) {
    const IAC = 255;
    for (let i = 0; i < data.length - 1; i++) {
      if (data[i] === IAC) {
        const cmd = data[i + 1];
        // Check for DO, DONT, WILL, WONT, SB (common Telnet commands)
        if (cmd >= 250 && cmd <= 254) {
          return true;
        }
      }
    }
    return false;
  }

  _finalizeDetection(protocol, initialData) {
    this.detected = true;
    this.socket.setTimeout(0); // Clear timeout
    
    // Always use Telnet protocol (raw TCP removed for security)
    const finalProtocol = 'telnet';
    
    const win = this.getWin();
    if (win) win.webContents.send('term:status', { type: 'detected', protocol: finalProtocol, host: this.host, port: this.port });

    // Destroy the detection socket
    const oldSocket = this.socket;
    this.socket = null;
    try { oldSocket.destroy(); } catch {}

    // Create Telnet client and reconnect
    this.actualClient = new TelnetClient(this.getWin);
    
    if (this.logging) {
      this.actualClient.setLogging(true);
    }
    
    this.actualClient.connect(this.host, this.port);
  }

  disconnect() {
    try { if (this.socket) this.socket.destroy(); } catch {}
    this.socket = null;
    if (this.actualClient) {
      this.actualClient.disconnect();
      this.actualClient = null;
    }
  }

  setSize(cols, rows) {
    if (this.actualClient) this.actualClient.setSize(cols, rows);
  }

  setLogging(enabled) {
    this.logging = enabled;
    if (this.actualClient) this.actualClient.setLogging(enabled);
  }

  write(data) {
    if (this.actualClient) this.actualClient.write(data);
  }
}

// Connection manager
let activeClient = null;
const getWindow = () => mainWindow;

function createClient(protocol) {
  switch (protocol) {
    case 'ssh':
      return new SSHTerminalClient(getWindow);
    case 'telnet':
      return new TelnetClient(getWindow);
    case 'auto':
    default:
      return new AutoDetectClient(getWindow);
  }
}

ipcMain.handle('connect', async (_e, { host, port, protocol = 'auto', credentials = {} }) => {
  if (activeClient) activeClient.disconnect();
  activeClient = createClient(protocol);
  
  if (protocol === 'ssh') {
    activeClient.connect(host, port, credentials);
  } else {
    activeClient.connect(host, port);
  }
});

ipcMain.handle('disconnect', async () => {
  if (activeClient) activeClient.disconnect();
});

ipcMain.handle('write', async (_e, data) => {
  if (activeClient) activeClient.write(data);
});

ipcMain.handle('resize', async (_e, { cols, rows }) => {
  if (activeClient) activeClient.setSize(cols, rows);
});

ipcMain.handle('setLogging', async (_e, enabled) => {
  if (activeClient) activeClient.setLogging(enabled);
});

ipcMain.handle('readPhonebook', async () => {
  const appPathFile = path.join(app.getAppPath(), 'data', 'phonebook.json');
  const cwdFile = path.join(process.cwd(), 'data', 'phonebook.json');
  const tryRead = (p) => {
    try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
  };
  const entries = tryRead(appPathFile) || tryRead(cwdFile);
  if (entries && Array.isArray(entries)) return entries;
  // Return default entry if no phonebook found
  return [{ name: 'Shift-Bits BBS', host: 'bbs.shift-bits.com', port: 2003, protocol: 'telnet' }];
});

ipcMain.handle('savePhonebookEntry', async (_e, { action, index, entry, entries: importedEntries }) => {
  const appPathFile = path.join(app.getAppPath(), 'data', 'phonebook.json');
  const cwdFile = path.join(process.cwd(), 'data', 'phonebook.json');
  
  // Try to read from cwd first, then app path
  let phonebookEntries = [];
  let file = cwdFile;
  
  try {
    phonebookEntries = JSON.parse(fs.readFileSync(cwdFile, 'utf8'));
    file = cwdFile;
  } catch {
    try {
      phonebookEntries = JSON.parse(fs.readFileSync(appPathFile, 'utf8'));
      file = appPathFile;
    } catch {
      // Start fresh
      phonebookEntries = [];
      file = cwdFile;
    }
  }
  
  console.log('Phonebook action:', action, 'index:', index, 'file:', file);
  
  if (action === 'add') phonebookEntries.push(entry);
  else if (action === 'edit' && index >= 0) phonebookEntries[index] = entry;
  else if (action === 'delete' && index >= 0) phonebookEntries.splice(index, 1);
  else if (action === 'replaceAll' && Array.isArray(importedEntries)) phonebookEntries = importedEntries;
  
  // Ensure directory exists
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(phonebookEntries, null, 2));
  console.log('Phonebook saved:', phonebookEntries.length, 'entries');
  return true;
});

// === FILE TRANSFER PROTOCOLS (ZMODEM) ===
// ZMODEM is now supported via zmodem.js library.
// - Downloads: Auto-detected when BBS initiates transfer
// - Uploads: Queue file, then start transfer from BBS menu

ipcMain.handle('uploadFile', async (_e, { name, data, protocol }) => {
  console.log(`File transfer requested: ${protocol} upload of ${name}`);
  
  if (protocol !== 'zmodem') {
    return { 
      success: false, 
      error: `Only ZMODEM transfers are currently supported. Please select ZMODEM protocol.`
    };
  }
  
  if (!activeClient) {
    return { success: false, error: 'Not connected to a BBS' };
  }
  
  // Queue the file for upload - it will be sent when BBS initiates ZMODEM receive
  pendingUpload = { name, data };
  
  sendTransferProgress(0, `File queued: ${name}. Start ZMODEM receive from BBS menu.`, { 
    filename: name, 
    direction: 'upload',
    queued: true 
  });
  
  return { 
    success: true, 
    message: `File "${name}" queued for upload. Now select ZMODEM receive from the BBS menu to start the transfer.`
  };
});

ipcMain.handle('downloadFile', async (_e, { protocol }) => {
  console.log(`File transfer requested: ${protocol} download`);
  
  if (protocol !== 'zmodem') {
    return { 
      success: false, 
      error: `Only ZMODEM transfers are currently supported. Please select ZMODEM protocol.`
    };
  }
  
  if (!activeClient) {
    return { success: false, error: 'Not connected to a BBS' };
  }
  
  // Downloads are auto-detected when BBS initiates - just inform the user
  sendTransferProgress(0, 'Ready to receive. Start ZMODEM send from BBS menu.', {
    direction: 'download',
    waiting: true
  });
  
  return { 
    success: true, 
    message: 'Ready to receive files. Select a file to download from the BBS menu - ZMODEM transfer will start automatically.'
  };
});

ipcMain.handle('cancelTransfer', async () => {
  if (zmodemSession) {
    try {
      zmodemSession.abort();
    } catch (e) {
      console.error('Error aborting ZMODEM session:', e);
    }
    zmodemSession = null;
  }
  pendingUpload = null;
  sendTransferProgress(0, 'Transfer cancelled', { cancelled: true });
  return { success: true, message: 'Transfer cancelled' };
});

// Clear pending upload
ipcMain.handle('clearPendingUpload', async () => {
  pendingUpload = null;
  return { success: true };
});
