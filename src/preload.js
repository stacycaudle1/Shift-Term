const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  connect: (host, port, protocol, credentials) => ipcRenderer.invoke('connect', { host, port, protocol, credentials }),
  disconnect: () => ipcRenderer.invoke('disconnect'),
  write: (data) => ipcRenderer.invoke('write', data),
  resize: (cols, rows) => ipcRenderer.invoke('resize', { cols, rows }),
  setLogging: (enabled) => ipcRenderer.invoke('setLogging', enabled),
  readPhonebook: () => ipcRenderer.invoke('readPhonebook'),
  savePhonebookEntry: (data) => ipcRenderer.invoke('savePhonebookEntry', data),
  
  // File transfer APIs (ZMODEM)
  uploadFile: (data) => ipcRenderer.invoke('uploadFile', data),
  downloadFile: (data) => ipcRenderer.invoke('downloadFile', data),
  cancelTransfer: () => ipcRenderer.invoke('cancelTransfer'),
  clearPendingUpload: () => ipcRenderer.invoke('clearPendingUpload'),
  onTransferProgress: (cb) => ipcRenderer.on('transfer:progress', (_e, progress) => cb(progress)),
  onZmodemDetected: (cb) => ipcRenderer.on('zmodem:detected', (_e, info) => cb(info)),
  
  // Debug logging from main process
  onDebugLog: (cb) => ipcRenderer.on('debug:log', (_e, msg) => cb(msg)),
  
  // Data and status events
  onData: (cb) => ipcRenderer.on('term:data', (_e, chunk) => cb(chunk)),
  onStatus: (cb) => ipcRenderer.on('term:status', (_e, status) => cb(status))
});
