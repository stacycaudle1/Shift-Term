console.log('=== Shift-Term app.js loading ===');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM loaded, initializing...');
  
  // Get DOM elements first
  const terminalEl = document.getElementById('terminal');
  const statusEl = document.getElementById('status');
  const inlineStatusEl = document.getElementById('inlineStatus');
  const phonebookEl = document.getElementById('phonebook');
  const disconnectBtn = document.getElementById('disconnectBtn');
  const loggingChk = document.getElementById('loggingChk');
  const hostInput = document.getElementById('hostInput');
  const portInput = document.getElementById('portInput');
  const connectBtn = document.getElementById('connectBtn');
  const addEntryBtn = document.getElementById('addEntryBtn');
  const editEntryBtn = document.getElementById('editEntryBtn');
  const delEntryBtn = document.getElementById('delEntryBtn');
  
  // Modal elements
  const entryModal = document.getElementById('entryModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalName = document.getElementById('modalName');
  const modalHost = document.getElementById('modalHost');
  const modalPort = document.getElementById('modalPort');
  const modalNotes = document.getElementById('modalNotes');
  const modalCancel = document.getElementById('modalCancel');
  const modalSave = document.getElementById('modalSave');

  console.log('Elements found:', {
    terminal: !!terminalEl,
    status: !!statusEl,
    inlineStatus: !!inlineStatusEl,
    phonebook: !!phonebookEl,
    connectBtn: !!connectBtn,
    addEntryBtn: !!addEntryBtn,
    editEntryBtn: !!editEntryBtn,
    delEntryBtn: !!delEntryBtn,
    entryModal: !!entryModal
  });

  // Helper function
  function setStatus(text) {
    console.log('Status:', text);
    if (statusEl) statusEl.textContent = text;
    if (inlineStatusEl) inlineStatusEl.textContent = text;
  }

  setStatus('Initializing...');

  // Initialize terminal
  let term = null;
  let fitAddon = null;
  
  try {
    const xtermModule = await import('../../node_modules/@xterm/xterm/lib/xterm.mjs');
    const fitModule = await import('../../node_modules/@xterm/addon-fit/lib/addon-fit.mjs');
    
    const Terminal = xtermModule.Terminal;
    const FitAddon = fitModule.FitAddon;
    
    console.log('xterm modules loaded:', { Terminal: !!Terminal, FitAddon: !!FitAddon });

    term = new Terminal({
      cols: 80,
      rows: 25,
      cursorBlink: true,
      convertEol: false,
      scrollback: 1000,
      fontFamily: 'Consolas, "Courier New", monospace',
      fontSize: 16,
      letterSpacing: 0,
      lineHeight: 1.0,
      theme: {
        background: '#0b0e12',
        foreground: '#cdd8e3',
        cursor: '#7bdff2',
        black: '#0f1318',
        red: '#ff6b6b',
        green: '#a0e7a0',
        yellow: '#ffe66d',
        blue: '#7bdff2',
        magenta: '#c792ea',
        cyan: '#64dfdf',
        white: '#cdd8e3',
        brightBlack: '#4a5568',
        brightRed: '#ff8a8a',
        brightGreen: '#b8f0b8',
        brightYellow: '#fff089',
        brightBlue: '#9ae7ff',
        brightMagenta: '#daa8f5',
        brightCyan: '#82f0f0',
        brightWhite: '#ffffff'
      }
    });
    fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalEl);
    
    // Terminal is fixed at 80x25 - no auto-fit
    console.log('Terminal sized to:', term.cols, 'x', term.rows);
    
    console.log('Terminal initialized successfully');
    setStatus('Ready - Enter host and click Connect');
  } catch (err) {
    console.error('Terminal init error:', err);
    setStatus('Terminal init failed: ' + err.message);
  }

  // Phonebook state
  let phonebookEntries = [];
  let selectedEntryIndex = -1;

  // Phonebook functions
  async function refreshPhonebook() {
    console.log('Refreshing phonebook...');
    try {
      phonebookEntries = await window.api.readPhonebook();
      // Sort with Shift-Bits BBS always at top
      phonebookEntries.sort((a, b) => {
        const aIsShiftBits = a.host && a.host.toLowerCase().includes('shift-bits');
        const bIsShiftBits = b.host && b.host.toLowerCase().includes('shift-bits');
        if (aIsShiftBits && !bIsShiftBits) return -1;
        if (!aIsShiftBits && bIsShiftBits) return 1;
        return (a.name || '').localeCompare(b.name || '');
      });
      console.log('Phonebook loaded:', phonebookEntries);
      renderPhonebook();
    } catch (err) {
      console.error('Phonebook load error:', err);
    }
  }

  function renderPhonebook() {
    if (!phonebookEl) return;
    phonebookEl.innerHTML = '';
    
    if (!phonebookEntries || !phonebookEntries.length) {
      phonebookEl.innerHTML = '<p style="padding:8px; color:#888;">No entries. Click Add to create one.</p>';
      return;
    }
    
    phonebookEntries.forEach((e, idx) => {
      const btn = document.createElement('button');
      btn.textContent = `${e.name} (${e.host}:${e.port})`;
      if (idx === selectedEntryIndex) {
        btn.style.background = '#2b3a4f';
        btn.style.borderColor = '#7bdff2';
      }
      
      btn.onclick = () => {
        console.log('Phonebook entry clicked:', e.name);
        selectedEntryIndex = idx;
        renderPhonebook();
        hostInput.value = e.host;
        portInput.value = e.port;
      };

      btn.ondblclick = async () => {
        console.log('Phonebook entry double-clicked:', e.name);
        setStatus('Connecting...');
        await window.api.connect(e.host, e.port || 23);
      };
      
      phonebookEl.appendChild(btn);
    });
  }

  // Load phonebook
  await refreshPhonebook();

  // === BUTTON EVENT HANDLERS ===
  
  // Connect button
  if (connectBtn) {
    connectBtn.onclick = async () => {
      console.log('>>> Connect button clicked!');
      const host = hostInput.value.trim();
      const port = parseInt(portInput.value, 10) || 23;
      console.log('Connecting to:', host, port);
      
      if (!host) {
        setStatus('Enter a host to connect');
        alert('Please enter a host address');
        return;
      }
      
      setStatus(`Connecting to ${host}:${port}...`);
      connectBtn.disabled = true;
      
      try {
        await window.api.connect(host, port);
        console.log('Connect API called successfully');
      } catch (error) {
        console.error('Connect error:', error);
        setStatus(`Connect failed: ${error.message}`);
      } finally {
        connectBtn.disabled = false;
      }
    };
    console.log('Connect button handler attached');
  }

  // Modal helper functions
  let modalMode = 'add'; // 'add' or 'edit'
  let editingIndex = -1;
  
  function showModal(mode, entry = null) {
    modalMode = mode;
    if (mode === 'add') {
      modalTitle.textContent = 'Add BBS Entry';
      modalName.value = '';
      modalHost.value = hostInput.value || '';
      modalPort.value = portInput.value || '23';
      modalNotes.value = '';
    } else {
      modalTitle.textContent = 'Edit BBS Entry';
      modalName.value = entry.name || '';
      modalHost.value = entry.host || '';
      modalPort.value = entry.port || 23;
      modalNotes.value = entry.notes || '';
    }
    entryModal.classList.remove('hidden');
    modalName.focus();
  }
  
  function hideModal() {
    entryModal.classList.add('hidden');
  }
  
  // Modal button handlers
  modalCancel.addEventListener('click', () => {
    hideModal();
  });
  
  modalSave.addEventListener('click', async () => {
    const name = modalName.value.trim();
    const host = modalHost.value.trim();
    const port = parseInt(modalPort.value) || 23;
    const notes = modalNotes.value.trim();
    
    if (!name || !host) {
      setStatus('Please fill in name and host');
      return;
    }
    
    const entry = { name, host, port, protocol: 'telnet', notes };
    
    try {
      if (modalMode === 'add') {
        await window.api.savePhonebookEntry({ action: 'add', entry });
        setStatus(`Added ${name}`);
      } else {
        await window.api.savePhonebookEntry({ action: 'edit', index: editingIndex, entry });
        setStatus(`Updated ${name}`);
      }
      await refreshPhonebook();
      hideModal();
    } catch (err) {
      console.error('Save error:', err);
      setStatus('Failed to save entry');
    }
  });
  
  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !entryModal.classList.contains('hidden')) {
      hideModal();
    }
  });

  // Add button
  if (addEntryBtn) {
    addEntryBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('>>> Add button clicked!');
      showModal('add');
    });
    console.log('Add button handler attached');
  } else {
    console.error('Add button NOT FOUND!');
  }

  // Edit button
  if (editEntryBtn) {
    editEntryBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('>>> Edit button clicked!');
      if (selectedEntryIndex < 0) {
        setStatus('Select an entry first');
        return;
      }
      editingIndex = selectedEntryIndex;
      showModal('edit', phonebookEntries[selectedEntryIndex]);
    });
    console.log('Edit button handler attached');
  } else {
    console.error('Edit button NOT FOUND!');
  }

  // Delete button
  if (delEntryBtn) {
    delEntryBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('>>> Delete button clicked!');
      if (selectedEntryIndex < 0) {
        setStatus('Select an entry first');
        return;
      }
      const entryName = phonebookEntries[selectedEntryIndex].name;
      if (!confirm(`Delete ${entryName}?`)) return;
      
      await window.api.savePhonebookEntry({ action: 'delete', index: selectedEntryIndex });
      selectedEntryIndex = -1;
      await refreshPhonebook();
      setStatus(`Deleted ${entryName}`);
    });
    console.log('Delete button handler attached');
  } else {
    console.error('Delete button NOT FOUND!');
  }

  // Disconnect button
  if (disconnectBtn) {
    disconnectBtn.onclick = () => {
      console.log('>>> Disconnect button clicked!');
      window.api.disconnect();
      setStatus('Disconnected');
    };
    console.log('Disconnect button handler attached');
  }

  // Enter key triggers connect
  if (hostInput) {
    hostInput.onkeydown = (e) => {
      if (e.key === 'Enter') connectBtn.click();
    };
  }
  if (portInput) {
    portInput.onkeydown = (e) => {
      if (e.key === 'Enter') connectBtn.click();
    };
  }

  // Logging toggle
  if (loggingChk) {
    loggingChk.onchange = () => {
      window.api.setLogging(loggingChk.checked);
    };
  }

  // Terminal input
  if (term) {
    term.onData((d) => {
      const mapped = d.replace(/\n/g, '\r');
      window.api.write(mapped);
    });
  }

  // Resize handling
  function pushResize() {
    if (fitAddon && term) {
      fitAddon.fit();
      window.api.resize(term.cols, term.rows);
    }
  }
  window.addEventListener('resize', pushResize);
  setTimeout(pushResize, 100);

  // CP437 to Unicode mapping for box-drawing and special characters
  const cp437ToUnicode = [
    // 0x00-0x1F: Control characters - keep control chars as-is for ANSI processing
    '\x00', '\u263A', '\u263B', '\u2665', '\u2666', '\u2663', '\u2660', '\x07',
    '\x08', '\x09', '\x0A', '\u2642', '\u2640', '\x0D', '\u266B', '\u263C',
    '\u25BA', '\u25C4', '\u2195', '\u203C', '\u00B6', '\u00A7', '\u25AC', '\u21A8',
    '\u2191', '\u2193', '\u2192', '\u2190', '\x1C', '\u2194', '\u25B2', '\u25BC',
  ];
  
  // Build full 256-character table
  const cp437Table = new Array(256);
  // 0x00-0x1F: Keep important control chars, map others to symbols
  for (let i = 0; i < 32; i++) cp437Table[i] = cp437ToUnicode[i];
  // 0x1B (ESC) must stay as ESC for ANSI sequences
  cp437Table[0x1B] = '\x1B';
  // 0x20-0x7E: Standard ASCII
  for (let i = 32; i < 127; i++) cp437Table[i] = String.fromCharCode(i);
  // 0x7F: House/delete
  cp437Table[127] = '\u2302';
  // 0x80-0xFF: Extended CP437
  const cp437Extended = 
    '\u00C7\u00FC\u00E9\u00E2\u00E4\u00E0\u00E5\u00E7\u00EA\u00EB\u00E8\u00EF\u00EE\u00EC\u00C4\u00C5' +
    '\u00C9\u00E6\u00C6\u00F4\u00F6\u00F2\u00FB\u00F9\u00FF\u00D6\u00DC\u00A2\u00A3\u00A5\u20A7\u0192' +
    '\u00E1\u00ED\u00F3\u00FA\u00F1\u00D1\u00AA\u00BA\u00BF\u2310\u00AC\u00BD\u00BC\u00A1\u00AB\u00BB' +
    '\u2591\u2592\u2593\u2502\u2524\u2561\u2562\u2556\u2555\u2563\u2551\u2557\u255D\u255C\u255B\u2510' +
    '\u2514\u2534\u252C\u251C\u2500\u253C\u255E\u255F\u255A\u2554\u2569\u2566\u2560\u2550\u256C\u2567' +
    '\u2568\u2564\u2565\u2559\u2558\u2552\u2553\u256B\u256A\u2518\u250C\u2588\u2584\u258C\u2590\u2580' +
    '\u03B1\u00DF\u0393\u03C0\u03A3\u03C3\u00B5\u03C4\u03A6\u0398\u03A9\u03B4\u221E\u03C6\u03B5\u2229' +
    '\u2261\u00B1\u2265\u2264\u2320\u2321\u00F7\u2248\u00B0\u2219\u00B7\u221A\u207F\u00B2\u25A0\u00A0';
  for (let i = 0; i < 128; i++) cp437Table[128 + i] = cp437Extended[i];

  // Convert CP437 binary string to Unicode, preserving ANSI escape sequences
  function cp437ToUtf8(data) {
    let result = '';
    let i = 0;
    while (i < data.length) {
      const code = data.charCodeAt(i);
      
      // Check for ANSI escape sequence (ESC [ ...)
      if (code === 0x1B && i + 1 < data.length) {
        // Pass through the entire escape sequence unchanged
        result += '\x1B';
        i++;
        // Copy until we hit the final letter of the sequence
        while (i < data.length) {
          const c = data.charAt(i);
          result += c;
          i++;
          // ANSI sequences end with a letter (@ through ~ for CSI)
          if (c >= '@' && c <= '~') break;
        }
      } else if (code < 256) {
        result += cp437Table[code];
        i++;
      } else {
        result += data[i];
        i++;
      }
    }
    return result;
  }

  // Incoming data - convert CP437 to Unicode
  window.api.onData((chunk) => {
    if (term) {
      const converted = cp437ToUtf8(chunk);
      term.write(converted);
    }
  });

  // Status updates
  window.api.onStatus((s) => {
    console.log('Status update:', s);
    if (s.type === 'connected') {
      setStatus(`Connected to ${s.host}:${s.port}`);
    } else if (s.type === 'disconnected') {
      setStatus('Disconnected');
    } else if (s.type === 'error') {
      setStatus(`Error: ${s.message}`);
    }
  });

  console.log('=== Shift-Term initialization complete ===');
});
