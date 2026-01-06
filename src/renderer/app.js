// ...existing code...
console.log('=== Shift-Term app.js loading ===');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM loaded, initializing...');
  
  // Get DOM elements first
  const terminalEl = document.getElementById('terminal');
  const statusEl = document.getElementById('status');
  const inlineStatusEl = document.getElementById('inlineStatus');
  const importInfoEl = document.getElementById('importInfo');
  const phonebookEl = document.getElementById('phonebook');
  const disconnectBtn = document.getElementById('disconnectBtn');
  const loggingChk = document.getElementById('loggingChk');
  const hostInput = document.getElementById('hostInput');
  const portInput = document.getElementById('portInput');
  const connectBtn = document.getElementById('connectBtn');
  const addEntryBtn = document.getElementById('addEntryBtn');
  const editEntryBtn = document.getElementById('editEntryBtn');
  const delEntryBtn = document.getElementById('delEntryBtn');
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  
  // Section elements for show/hide
  const phonebookSection = document.getElementById('phonebookSection');
  const fileTransferSection = document.getElementById('fileTransferSection');
  const connectionInfo = document.getElementById('connectionInfo');
  
  // File transfer elements
  const transferProtocol = document.getElementById('transferProtocol');
  const uploadBtn = document.getElementById('uploadBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const uploadFileInput = document.getElementById('uploadFileInput');
  const transferStatus = document.getElementById('transferStatus');
  const transferProgress = document.getElementById('transferProgress');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  const cancelTransferBtn = document.getElementById('cancelTransferBtn');
  
  // Modal elements
  const entryModal = document.getElementById('entryModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalName = document.getElementById('modalName');
  const modalHost = document.getElementById('modalHost');
  const modalPort = document.getElementById('modalPort');
  const modalProtocol = document.getElementById('modalProtocol');
  const modalUsername = document.getElementById('modalUsername');
  const modalPassword = document.getElementById('modalPassword');
  const sshCredentials = document.getElementById('sshCredentials');
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
    entryModal: !!entryModal,
    searchInput: !!searchInput,
    clearSearchBtn: !!clearSearchBtn,
    modalProtocol: !!modalProtocol,
    sshCredentials: !!sshCredentials,
    phonebookSection: !!phonebookSection,
    fileTransferSection: !!fileTransferSection,
    uploadBtn: !!uploadBtn,
    downloadBtn: !!downloadBtn
  });

  // Connection state
  let isConnected = false;
  let currentConnection = { host: '', port: 0, protocol: '' };
  let isTransferring = false;

  // Helper function
  function setStatus(text) {
    console.log('Status:', text);
    if (statusEl) statusEl.textContent = text;
    if (inlineStatusEl) inlineStatusEl.textContent = text;
  }

  function setImportInfo(text) {
    if (importInfoEl) importInfoEl.textContent = text;
  }

  // Show/hide sections based on connection state
  function showPhonebook() {
    if (phonebookSection) phonebookSection.classList.remove('hidden');
    if (fileTransferSection) fileTransferSection.classList.add('hidden');
  }

  function showFileTransfer(host, port, protocol) {
    if (phonebookSection) phonebookSection.classList.add('hidden');
    if (fileTransferSection) fileTransferSection.classList.remove('hidden');
    if (connectionInfo) {
      connectionInfo.textContent = `Connected to ${host}:${port} (${protocol.toUpperCase()})`;
    }
    if (transferStatus) transferStatus.textContent = 'ZMODEM ready. Downloads auto-detected, uploads queued then start from BBS.';
  }

  function setTransferStatus(text) {
    if (transferStatus) transferStatus.textContent = text;
  }

  function updateProgress(percent) {
    if (progressFill) progressFill.style.width = `${percent}%`;
    if (progressText) progressText.textContent = `${Math.round(percent)}%`;
  }

  function showProgress() {
    if (transferProgress) transferProgress.classList.remove('hidden');
    updateProgress(0);
  }

  function hideProgress() {
    if (transferProgress) transferProgress.classList.add('hidden');
  }

  // Show last import date if available
  const lastImportDate = localStorage.getItem('bbsLastImportDate');
  if (lastImportDate) {
    // Try to get current number of entries
    const phonebook = await window.api.readPhonebook();
    setStatus('Ready - Enter host and click Connect');
    setImportInfo(`Imported ${phonebook.length} BBS entries. Last Import date: ${lastImportDate}`);
  } else {
    setStatus('Initializing...');
    setImportInfo('');
  }

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
      scrollback: 0,
      fontFamily: 'ShiftTermCP437, Consolas, "Courier New", monospace',
      fontSize: 16,
      letterSpacing: 0,
      lineHeight: 1.0,
      theme: {
        background: '#000000',
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
    
    // Fixed 80x25 terminal - no dynamic fitting
    // Send size to server for NAWS
    window.api.resize({ cols: 80, rows: 25 });
    
    console.log('Terminal initialized at fixed 80x25');
    setStatus('Ready - Enter host and click Connect');
    // Show default message in terminal on initial load - start from top
    term.reset();
    term.clear();
    term.write('\x1B[2J\x1B[H'); // Clear screen and cursor to home (row 1, col 1)
    term.write('Terminal Ready.... Select A BBS from phonebook to connect.\r\n');
  } catch (err) {
    console.error('Terminal init error:', err);
    setStatus('Terminal init failed: ' + err.message);
  }

  // Phonebook state
  let phonebookEntries = [];
  let selectedEntryIndex = -1;
  let selectedEntryProtocol = 'auto';
  let selectedEntryCredentials = {};
  let searchTerm = '';

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
    
    // Filter entries based on search term
    const filteredEntries = phonebookEntries.map((e, idx) => ({ ...e, originalIndex: idx }))
      .filter(e => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (e.name && e.name.toLowerCase().includes(term)) ||
               (e.host && e.host.toLowerCase().includes(term)) ||
               (e.notes && e.notes.toLowerCase().includes(term));
      });
    
    if (filteredEntries.length === 0 && searchTerm) {
      phonebookEl.innerHTML = '<p style="padding:8px; color:#888;">No matching entries found.</p>';
      return;
    }
    
    filteredEntries.forEach((e) => {
      const idx = e.originalIndex;
      const btn = document.createElement('button');
      btn.textContent = `${e.name} (${e.host}:${e.port})`;
      if (idx === selectedEntryIndex) {
        btn.style.background = '#2b3a4f';
        btn.style.borderColor = '#7bdff2';
      }
      
      btn.onclick = () => {
        console.log('Phonebook entry clicked:', e.name);
        selectedEntryIndex = idx;
        selectedEntryProtocol = e.protocol || 'auto';
        selectedEntryCredentials = { username: e.username, password: e.password };
        renderPhonebook();
        hostInput.value = e.host;
        portInput.value = e.port;
      };

      btn.ondblclick = async () => {
        console.log('Phonebook entry double-clicked:', e.name);
        const protocol = e.protocol || 'auto';
        const credentials = { username: e.username, password: e.password };
        setStatus(`Connecting (${protocol})...`);
        await window.api.connect(e.host, e.port || 23, protocol, credentials);
      };
      
      phonebookEl.appendChild(btn);
    });
  }

  // Load phonebook
  await refreshPhonebook();

  // === SEARCH HANDLERS ===
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.trim();
      renderPhonebook();
    });
    
    // Allow pressing Enter to select first matching entry
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && searchTerm) {
        const filteredEntries = phonebookEntries.filter(entry => {
          const term = searchTerm.toLowerCase();
          return (entry.name && entry.name.toLowerCase().includes(term)) ||
                 (entry.host && entry.host.toLowerCase().includes(term)) ||
                 (entry.notes && entry.notes.toLowerCase().includes(term));
        });
        if (filteredEntries.length > 0) {
          const originalIndex = phonebookEntries.indexOf(filteredEntries[0]);
          selectedEntryIndex = originalIndex;
          hostInput.value = filteredEntries[0].host;
          portInput.value = filteredEntries[0].port;
          renderPhonebook();
        }
      }
      if (e.key === 'Escape') {
        searchInput.value = '';
        searchTerm = '';
        renderPhonebook();
      }
    });
    console.log('Search input handler attached');
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchTerm = '';
      renderPhonebook();
      searchInput.focus();
    });
    console.log('Clear search button handler attached');
  }

  // === BUTTON EVENT HANDLERS ===
  
  // Connect button
  if (connectBtn) {
    connectBtn.onclick = async () => {
      console.log('>>> Connect button clicked!');
      const host = hostInput.value.trim();
      const port = parseInt(portInput.value, 10) || 23;
      const protocol = selectedEntryProtocol || 'auto';
      const credentials = selectedEntryCredentials || {};
      console.log('Connecting to:', host, port, 'protocol:', protocol);
      
      if (!host) {
        setStatus('Enter a host to connect');
        alert('Please enter a host address');
        return;
      }
      
      setStatus(`Connecting to ${host}:${port} (${protocol})...`);
      connectBtn.disabled = true;
      
      try {
        await window.api.connect(host, port, protocol, credentials);
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
  
  function updateSSHCredentialsVisibility() {
    if (modalProtocol && sshCredentials) {
      if (modalProtocol.value === 'ssh') {
        sshCredentials.classList.remove('hidden');
      } else {
        sshCredentials.classList.add('hidden');
      }
    }
  }
  
  // Add protocol change listener
  if (modalProtocol) {
    modalProtocol.addEventListener('change', updateSSHCredentialsVisibility);
  }
  
  function showModal(mode, entry = null) {
    modalMode = mode;
    if (mode === 'add') {
      modalTitle.textContent = 'Add BBS Entry';
      modalName.value = '';
      modalHost.value = hostInput.value || '';
      modalPort.value = portInput.value || '23';
      if (modalProtocol) modalProtocol.value = 'auto';
      if (modalUsername) modalUsername.value = '';
      if (modalPassword) modalPassword.value = '';
      modalNotes.value = '';
    } else {
      modalTitle.textContent = 'Edit BBS Entry';
      modalName.value = entry.name || '';
      modalHost.value = entry.host || '';
      modalPort.value = entry.port || 23;
      if (modalProtocol) modalProtocol.value = entry.protocol || 'auto';
      if (modalUsername) modalUsername.value = entry.username || '';
      if (modalPassword) modalPassword.value = entry.password || '';
      modalNotes.value = entry.notes || '';
    }
    updateSSHCredentialsVisibility();
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
    const protocol = modalProtocol ? modalProtocol.value : 'auto';
    const username = modalUsername ? modalUsername.value.trim() : '';
    const password = modalPassword ? modalPassword.value : '';
    const notes = modalNotes.value.trim();
    
    if (!name || !host) {
      setStatus('Please fill in name and host');
      return;
    }
    
    const entry = { name, host, port, protocol, notes };
    
    // Only store credentials if SSH is selected and values provided
    if (protocol === 'ssh') {
      if (username) entry.username = username;
      if (password) entry.password = password;
    }
    
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

    // Import button and file input
    const importEntryBtn = document.getElementById('importEntryBtn');
    const importFileInput = document.getElementById('importFileInput');

    if (importEntryBtn && importFileInput) {
      importEntryBtn.addEventListener('click', () => {
        importFileInput.value = '';
        importFileInput.click();
      });

      importFileInput.addEventListener('change', async (e) => {
        const file = importFileInput.files[0];
        if (!file) {
          setStatus('No file selected');
          return;
        }
        setStatus('Importing BBS list...');
        try {
          const text = await file.text();
          console.log('Import file contents:', text);
          // Improved parsing: look for lines with 'Name' and 'Host:Port' separated by 2+ spaces
          const lines = text.split(/\r?\n/).filter(l => l.trim());
          const imported = [];
          for (const line of lines) {
            // Skip header/footer and lines without a host
            if (/^(\*|=|-|Copyright|Web:|Telnet:|E-mail|EMAIL:|NOTE:|DISTRIBUTION|WHERE TO FIND|All Telnet|If you find|This file|\s*$)/i.test(line)) continue;
            // Match: Name [2+ spaces] Host[:Port]
            const match = line.match(/^(.+?)\s{2,}([\w\.-]+(?:\.[\w\.-]+)*)(?::(\d+))?/);
            if (match) {
              const name = match[1].trim();
              const host = match[2].trim();
              const port = match[3] ? parseInt(match[3], 10) : 23;
              if (name && host) {
                imported.push({ name, host, port, protocol: 'telnet', notes: '' });
              }
            }
          }
          console.log('Parsed imported entries:', imported);
          if (!imported.length) {
            setStatus('No valid BBS entries found in file');
            return;
          }
          // Find Shift-Bits BBS and keep it at the top
          let shiftBitsEntry = phonebookEntries.find(e => e.host && e.host.toLowerCase().includes('shift-bits'));
          // Build new phonebook, preserving notes for matching BBSs
          const mergedImported = imported.map(newEntry => {
            // Try to find old entry with same host and port
            const oldEntry = phonebookEntries.find(e => e.host === newEntry.host && e.port === newEntry.port);
            return oldEntry ? { ...newEntry, notes: oldEntry.notes } : newEntry;
          });
          // Remove Shift-Bits from imported if present
          const filteredImported = mergedImported.filter(e => !(e.host && e.host.toLowerCase().includes('shift-bits')));
          // Compose new phonebook: Shift-Bits at top, then imported
          const newPhonebook = shiftBitsEntry ? [shiftBitsEntry, ...filteredImported] : filteredImported;
          await window.api.savePhonebookEntry({ action: 'replaceAll', entries: newPhonebook });
          // Store last import date in localStorage
          const importDate = new Date().toLocaleString();
          localStorage.setItem('bbsLastImportDate', importDate);
          await refreshPhonebook();
          setStatus('Ready - Enter host and click Connect');
          setImportInfo(`Imported ${filteredImported.length} BBS entries. Last Import date: ${importDate}`);
        } catch (err) {
          console.error('Import error:', err);
          setStatus('Import failed: ' + err.message);
        }
      });
      console.log('Import button and file input handlers attached');
    } else {
      console.error('Import button or file input NOT FOUND!');
    }

  // === FILE TRANSFER HANDLERS (ZMODEM) ===
  
  // Upload button - queue file for ZMODEM upload
  if (uploadBtn && uploadFileInput) {
    uploadBtn.addEventListener('click', () => {
      if (!isConnected) {
        setTransferStatus('Not connected to a BBS');
        return;
      }
      if (isTransferring) {
        setTransferStatus('Transfer already in progress');
        return;
      }
      
      const protocol = transferProtocol ? transferProtocol.value : 'zmodem';
      if (protocol !== 'zmodem') {
        setTransferStatus('Only ZMODEM transfers are supported. Please select ZMODEM.');
        return;
      }
      
      uploadFileInput.value = '';
      uploadFileInput.click();
    });
    
    uploadFileInput.addEventListener('change', async () => {
      const file = uploadFileInput.files[0];
      if (!file) return;
      
      const protocol = transferProtocol ? transferProtocol.value : 'zmodem';
      setTransferStatus(`Queuing file: ${file.name}`);
      
      try {
        // Read file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        const fileData = Array.from(new Uint8Array(arrayBuffer));
        
        const result = await window.api.uploadFile({
          name: file.name,
          data: fileData,
          protocol: protocol
        });
        
        if (result.success) {
          // File queued - user needs to start transfer from BBS
          setTransferStatus(result.message);
          showProgress();
          updateProgress(0);
        } else {
          setTransferStatus(`Error: ${result.error}`);
        }
      } catch (err) {
        console.error('Upload error:', err);
        setTransferStatus(`Upload error: ${err.message}`);
      }
    });
    
    console.log('Upload button handler attached');
  }
  
  // Download button - inform user to start from BBS
  if (downloadBtn) {
    downloadBtn.addEventListener('click', async () => {
      if (!isConnected) {
        setTransferStatus('Not connected to a BBS');
        return;
      }
      if (isTransferring) {
        setTransferStatus('Transfer already in progress');
        return;
      }
      
      const protocol = transferProtocol ? transferProtocol.value : 'zmodem';
      if (protocol !== 'zmodem') {
        setTransferStatus('Only ZMODEM transfers are supported. Please select ZMODEM.');
        return;
      }
      
      try {
        const result = await window.api.downloadFile({ protocol: protocol });
        
        if (result.success) {
          setTransferStatus(result.message);
        } else {
          setTransferStatus(`Error: ${result.error}`);
        }
      } catch (err) {
        console.error('Download error:', err);
        setTransferStatus(`Error: ${err.message}`);
      }
    });
    
    console.log('Download button handler attached');
  }
  
  // Cancel transfer button
  if (cancelTransferBtn) {
    cancelTransferBtn.addEventListener('click', async () => {
      await window.api.cancelTransfer();
      setTransferStatus('Transfer cancelled');
      hideProgress();
      isTransferring = false;
      if (uploadBtn) uploadBtn.disabled = false;
      if (downloadBtn) downloadBtn.disabled = false;
    });
    
    console.log('Cancel transfer button handler attached');
  }
  
  // Debug log listener from main process
  if (window.api.onDebugLog) {
    window.api.onDebugLog((msg) => {
      console.log('[MAIN DEBUG]', msg);
    });
    console.log('Debug log listener attached');
  }
  
  // Transfer progress listener
  window.api.onTransferProgress((progress) => {
    console.log('Transfer progress:', progress);
    
    if (progress.percent !== undefined) {
      updateProgress(progress.percent);
      showProgress();
    }
    
    if (progress.status) {
      setTransferStatus(progress.status);
    }
    
    // Handle transfer states
    if (progress.complete) {
      isTransferring = false;
      if (uploadBtn) uploadBtn.disabled = false;
      if (downloadBtn) downloadBtn.disabled = false;
      // Keep progress bar visible for a moment to show completion
      setTimeout(() => {
        if (!isTransferring) hideProgress();
      }, 2000);
    } else if (progress.waiting || progress.queued) {
      // Waiting for BBS to initiate
      isTransferring = false;
      if (uploadBtn) uploadBtn.disabled = false;
      if (downloadBtn) downloadBtn.disabled = false;
    } else if (progress.direction) {
      // Active transfer
      isTransferring = true;
      if (uploadBtn) uploadBtn.disabled = true;
      if (downloadBtn) downloadBtn.disabled = true;
    }
    
    if (progress.cancelled) {
      isTransferring = false;
      if (uploadBtn) uploadBtn.disabled = false;
      if (downloadBtn) downloadBtn.disabled = false;
      hideProgress();
    }
  });
  
  // ZMODEM detection listener
  window.api.onZmodemDetected((info) => {
    console.log('ZMODEM detected:', info);
    if (info.type === 'send') {
      setTransferStatus('BBS ready to receive file...');
    } else if (info.type === 'receive') {
      setTransferStatus('BBS sending file...');
    }
    showProgress();
    isTransferring = true;
    if (uploadBtn) uploadBtn.disabled = true;
    if (downloadBtn) downloadBtn.disabled = true;
  });

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

  // Keep terminal fixed at 80x25 for BBS compatibility
  // Do NOT use fitAddon.fit() as it changes rows/cols and breaks BBS screen positioning
  function handleResize() {
    // Terminal stays fixed at 80x25 - just notify backend of size
    if (!term) return;
    window.api.resize(80, 25);
    console.log('Terminal fixed at: 80 x 25');
  }
  window.addEventListener('resize', handleResize);
  // Initial size notification
  setTimeout(handleResize, 100);

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
      // Debug: Log raw incoming data (show control chars as hex)
      const rawHex = Array.from(chunk).map(c => {
        const code = c.charCodeAt(0);
        return code < 32 || code > 126 ? `<${code.toString(16)}>` : c;
      }).join('');
      console.log('[BBS RAW]', rawHex);

      // Detect ANSI clear screen (ESCc or ESC[2J) at the START of the chunk
      let chunkToWrite = chunk;
      if (chunk.startsWith('\x1Bc') || chunk.startsWith('\x1B[2J') || chunk.startsWith('\u001Bc') || chunk.startsWith('\u001B[2J')) {
        term.clear();
        // Remove the clear code from the chunk so it doesn't get written again
        if (chunk.startsWith('\x1Bc') || chunk.startsWith('\u001Bc')) {
          chunkToWrite = chunk.slice(2);
        } else if (chunk.startsWith('\x1B[2J') || chunk.startsWith('\u001B[2J')) {
          chunkToWrite = chunk.slice(4);
        }
      }
      const converted = cp437ToUtf8(chunkToWrite);
      // Debug: Log converted output
      console.log('[BBS CONVERTED]', converted);
      term.write(converted);
    }
  });

  // Status updates
  window.api.onStatus((s) => {
    console.log('Status update:', s);
    if (s.type === 'connected') {
      isConnected = true;
      currentConnection = { host: s.host, port: s.port, protocol: s.protocol || 'telnet' };
      
      if (term) {
        // Send fixed terminal size to server
        window.api.resize({ cols: 80, rows: 25 });
        // Full terminal reset and switch to alternate screen buffer
        term.reset();
        term.clear();
        // Enable alternate screen buffer (used by full-screen apps like BBS)
        term.write('\x1B[?1049h'); // Enable alternate screen buffer
        term.write('\x1B[2J\x1B[H'); // Clear screen and move cursor to home (1,1)
      }
      const protocolLabel = s.protocol ? ` (${s.protocol.toUpperCase()})` : '';
      setStatus(`Connected to ${s.host}:${s.port}${protocolLabel}`);
      
      // Show file transfer section, hide phonebook
      showFileTransfer(s.host, s.port, s.protocol || 'telnet');
    } else if (s.type === 'detecting') {
      setStatus(`Detecting protocol for ${s.host}:${s.port}...`);
    } else if (s.type === 'detected') {
      setStatus(`Detected ${s.protocol.toUpperCase()} - reconnecting...`);
    } else if (s.type === 'disconnected') {
      isConnected = false;
      currentConnection = { host: '', port: 0, protocol: '' };
      
      if (term) {
        // Disable alternate screen buffer and reset
        term.write('\x1B[?1049l'); // Disable alternate screen buffer
        term.reset();
        term.clear();
        term.write('\x1B[2J\x1B[H'); // Clear screen and home cursor
        term.write('Terminal Ready.... Select A BBS from phonebook to connect.\r\n');
      }
      setStatus('Disconnected');
      
      // Show phonebook, hide file transfer section
      showPhonebook();
    } else if (s.type === 'error') {
      setStatus(`Error: ${s.message}`);
    }
  });

  console.log('=== Shift-Term initialization complete ===');
});
