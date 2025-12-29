const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  connect: (host, port) => ipcRenderer.invoke('connect', { host, port }),
  disconnect: () => ipcRenderer.invoke('disconnect'),
  write: (data) => ipcRenderer.invoke('write', data),
  resize: (cols, rows) => ipcRenderer.invoke('resize', { cols, rows }),
  setLogging: (enabled) => ipcRenderer.invoke('setLogging', enabled),
  readPhonebook: () => ipcRenderer.invoke('readPhonebook'),
  savePhonebookEntry: (data) => ipcRenderer.invoke('savePhonebookEntry', data),
  onData: (cb) => ipcRenderer.on('term:data', (_e, chunk) => cb(chunk)),
  onStatus: (cb) => ipcRenderer.on('term:status', (_e, status) => cb(status))
});
