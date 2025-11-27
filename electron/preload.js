const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // 示例: getAppVersion: () => process.versions.app,
});
