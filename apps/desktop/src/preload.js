const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('rtwAPI', {
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  convertLocal: (payload) => ipcRenderer.invoke('rtw:convertLocal', payload),
  platform: process.platform,
  version: '1.1.0'
});
