const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const net = require('net');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
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
  constructor(getWin) {
    this.getWin = getWin;
    this.socket = null;
    this.bufferSB = null; // subnegotiation buffer
    this.columns = 80;
    this.rows = 25;
    this.logging = false;
    this.logStream = null;
  }

  connect(host, port) {
    if (this.socket) this.disconnect();
    this.socket = new net.Socket();
    this.socket.setKeepAlive(true, 15000);

    this.socket.on('connect', () => {
      const win = this.getWin();
      if (win) win.webContents.send('term:status', { type: 'connected', host, port });
      // Immediately advertise WILL NAWS/TTYPE when server sends DOs
    });

    this.socket.on('data', (data) => {
      const rendered = this._processTelnet(data);
      if (rendered && rendered.length) {
        const str = rendered.toString('binary');
        const win = this.getWin();
        if (win) win.webContents.send('term:data', str);
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
    });

    this.socket.connect(port, host);
  }

  disconnect() {
    try { if (this.socket) this.socket.destroy(); } catch {}
    this.socket = null;
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

const telnet = new TelnetClient(() => mainWindow);

ipcMain.handle('connect', async (_e, { host, port }) => {
  telnet.connect(host, port);
});

ipcMain.handle('disconnect', async () => {
  telnet.disconnect();
});

ipcMain.handle('write', async (_e, data) => {
  telnet.write(data);
});

ipcMain.handle('resize', async (_e, { cols, rows }) => {
  telnet.setSize(cols, rows);
});

ipcMain.handle('setLogging', async (_e, enabled) => {
  telnet.setLogging(enabled);
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

ipcMain.handle('savePhonebookEntry', async (_e, { action, index, entry }) => {
  const appPathFile = path.join(app.getAppPath(), 'data', 'phonebook.json');
  const cwdFile = path.join(process.cwd(), 'data', 'phonebook.json');
  
  // Try to read from cwd first, then app path
  let entries = [];
  let file = cwdFile;
  
  try {
    entries = JSON.parse(fs.readFileSync(cwdFile, 'utf8'));
    file = cwdFile;
  } catch {
    try {
      entries = JSON.parse(fs.readFileSync(appPathFile, 'utf8'));
      file = appPathFile;
    } catch {
      // Start fresh
      entries = [];
      file = cwdFile;
    }
  }
  
  console.log('Phonebook action:', action, 'index:', index, 'file:', file);
  
  if (action === 'add') entries.push(entry);
  else if (action === 'edit' && index >= 0) entries[index] = entry;
  else if (action === 'delete' && index >= 0) entries.splice(index, 1);
  
  // Ensure directory exists
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(entries, null, 2));
  console.log('Phonebook saved:', entries.length, 'entries');
  return true;
});
