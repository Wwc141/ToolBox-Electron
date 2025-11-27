const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: "全能办公工具箱",
    // 【关键修改】指向你的 ico 图标
    // __dirname 是 electron/ 目录，所以需要 ../ 回到根目录找 public
    icon: path.join(__dirname, '../public/icon.ico'), // 如果你有图标，取消注释
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // 隐藏默认菜单栏
  win.setMenuBarVisibility(false);

  const isDev = !app.isPackaged;
  if (isDev) {
    win.loadURL('http://localhost:5173');
    // win.webContents.openDevTools(); // 开发模式下开启控制台
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
