const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendWsMessage: (msg) => ipcRenderer.invoke('send-ws-message', msg),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getToken: () => ipcRenderer.invoke('get-token'),
  getView: () => ipcRenderer.invoke('get-view'),
  setView: (view) => ipcRenderer.invoke('set-view', view),
  setWindowSize: (width, height) => ipcRenderer.send('set-window-size', { width, height }),
  onMessage: (callback) => ipcRenderer.on('ajouter-message', (event, data) => callback(data)),
  onPing: (callback) => ipcRenderer.on('ping', (event, data) => callback(data)),
  onStats: (callback) => ipcRenderer.on('update-stats', (event, data) => callback(data)),
});