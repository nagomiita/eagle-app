const { contextBridge, ipcRenderer } = require('electron');

// セキュアなAPI公開
contextBridge.exposeInMainWorld('electronAPI', {
  // 将来的に追加する機能用のプレースホルダー
  isElectron: () => true,

  // 将来的な拡張機能
  // selectFolder: () => ipcRenderer.invoke('select-folder'),
  // saveFile: (data) => ipcRenderer.invoke('save-file', data),
  // openExternal: (url) => ipcRenderer.invoke('open-external', url),
});

// プロセス情報を公開（環境検出用）
contextBridge.exposeInMainWorld('process', {
  type: 'renderer'
});
