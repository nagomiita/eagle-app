const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;
let nginxProcess;

// 環境変数でサーバーモードも起動するか制御
const ENABLE_SERVER_MODE = process.env.ENABLE_SERVER === 'true';

// バックエンド起動（Electronモード）
function startBackend() {
  const pythonPath = path.join(__dirname, '../backend/venv/Scripts/python.exe');

  backendProcess = spawn(pythonPath, ['-m', 'app.main'], {
    cwd: path.join(__dirname, '../backend'),
    env: { ...process.env, APP_MODE: 'electron' }
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data}`);
  });
}

// nginx起動（サーバーモード）
function startNginx() {
  if (!ENABLE_SERVER_MODE) return;

  const nginxPath = path.join(__dirname, '../nginx/nginx.exe');

  nginxProcess = spawn(nginxPath, [], {
    cwd: path.join(__dirname, '../nginx')
  });

  console.log('nginx started for server mode');
}

// メインウィンドウ作成
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: 'Eagle App'
  });

  // 開発環境判定: dist/index.htmlの存在チェック
  const distPath = path.join(__dirname, '../frontend/dist/index.html');
  const fs = require('fs');
  const isDev = !fs.existsSync(distPath) || process.env.NODE_ENV === 'development';

  if (isDev) {
    // 開発モード: Vite開発サーバー
    console.log('Running in development mode - loading from Vite dev server');
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // 本番モード: ビルド済みファイル
    console.log('Running in production mode - loading from dist');
    mainWindow.loadFile(distPath);
  }

  // メニューバー
  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Server Mode',
          type: 'checkbox',
          checked: ENABLE_SERVER_MODE,
          click: () => {
            // サーバーモードの切り替え（再起動が必要）
            app.relaunch({ args: process.argv.slice(1).concat(['--enable-server']) });
            app.exit(0);
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' }
      ]
    }
  ]);
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// アプリ起動
app.whenReady().then(() => {
  // コマンドライン引数をチェック
  if (process.argv.includes('--enable-server')) {
    process.env.ENABLE_SERVER = 'true';
  }

  startBackend();

  if (ENABLE_SERVER_MODE) {
    startNginx();
  }

  // バックエンドの起動を待つ
  setTimeout(() => {
    createWindow();
  }, 2000);
});

// 終了処理
app.on('window-all-closed', () => {
  if (backendProcess) backendProcess.kill();
  if (nginxProcess) {
    // nginx停止
    const nginxStopPath = path.join(__dirname, '../nginx/nginx.exe');
    spawn(nginxStopPath, ['-s', 'stop']);
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('before-quit', () => {
  if (backendProcess) backendProcess.kill();
  if (nginxProcess) nginxProcess.kill();
});
