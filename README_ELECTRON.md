# Eagle App - Electron ハイブリッド構成 追加ドキュメント

このドキュメントは、Electronハイブリッド構成に関する追加情報を記載しています。

---

## 🎯 動作モード

Eagle Appは3つの動作モードをサポートしています。

### 1. デスクトップモード（Electron）
ホストPC上でネイティブアプリとして動作します。

**特徴:**
- ✅ 高速起動・軽量
- ✅ nginx不要
- ✅ localhostのみでバックエンドにアクセス
- ✅ ネイティブウィンドウ

**起動方法:**
```bash
# 方法1: スクリプトから
scripts\start-desktop.bat

# 方法2: npm コマンドから
cd frontend
npm run electron:start
```

**アクセス:**
- Electronウィンドウが自動的に開きます

---

### 2. サーバーモード（nginx + Web）
LAN内の複数デバイスからWebブラウザでアクセスできます。

**特徴:**
- ✅ LAN内の全デバイスからアクセス可能
- ✅ nginx経由で静的ファイル高速配信
- ✅ スマホ・タブレットからもアクセス可
- ❌ Electronウィンドウなし

**起動方法:**
```bash
scripts\start-server.bat
```

**アクセス:**
- ホストPC: `http://192.168.11.11`
- 他の端末: `http://192.168.11.11`

**停止方法:**
```bash
scripts\stop-server.bat
```

---

### 3. ハイブリッドモード（Electron + nginx）
デスクトップアプリとWebサーバーを同時に起動します。

**特徴:**
- ✅ ホストPC: 高速なElectronアプリ
- ✅ 他の端末: Webブラウザでアクセス
- ✅ 両方のメリットを享受

**起動方法:**
```bash
scripts\start-all.bat
```

**アクセス:**
- ホストPC: Electronウィンドウ
- 他の端末: `http://192.168.11.11`

---

## 📦 Electronセットアップ

### 1. 依存関係のインストール

```bash
cd frontend
npm install
```

以下のパッケージが追加されます:
- `electron` - Electronフレームワーク
- `electron-builder` - インストーラー作成
- `concurrently` - 複数プロセス同時実行
- `wait-on` - プロセス待機

### 2. 初回ビルド

```bash
cd frontend
npm run build
```

### 3. 動作確認

```bash
# 開発モード（Vite + Electron）
npm run electron:dev

# または本番モード
npm run electron:start
```

---

## 🔧 環境変数とモード切り替え

### バックエンドのモード

環境変数 `APP_MODE` で制御:

```bash
# Electronモード（localhost:8000のみ）
set APP_MODE=electron
python -m app.main

# サーバーモード（0.0.0.0:8000 - LAN公開）
set APP_MODE=server
python -m app.main
```

### Electronのサーバーモード

コマンドライン引数 `--enable-server` で制御:

```bash
# ハイブリッドモード（nginx起動含む）
electron ../electron/main.js --enable-server
```

または環境変数:

```bash
set ENABLE_SERVER=true
npm run electron:start
```

---

## 🏗️ プロジェクト構成（Electron追加後）

```
eagle-app/
├── electron/                 # 📂 Electron関連（新規）
│   ├── main.js              # メインプロセス
│   ├── preload.js           # プリロードスクリプト
│   └── package.json         # Electron設定
│
├── scripts/                 # 📂 起動スクリプト（新規）
│   ├── start-desktop.bat    # デスクトップモード起動
│   ├── start-server.bat     # サーバーモード起動
│   ├── start-all.bat        # ハイブリッドモード起動
│   └── stop-server.bat      # サーバー停止
│
├── backend/                 # FastAPI（既存）
│   └── app/
│       └── main.py          # モード切り替え対応に更新
│
├── frontend/                # React（既存）
│   ├── src/
│   │   └── config.ts        # 環境検出機能追加
│   ├── package.json         # Electron依存関係追加
│   └── vite.config.ts       # Electron対応に更新
│
└── README.md
```

---

## 🚀 配布用ビルド

### .exe インストーラーの作成

```bash
cd frontend

# ビルド
npm run electron:build
```

生成される成果物:
```
release/
├── Eagle App Setup 1.0.0.exe    # NSISインストーラー
└── Eagle App 1.0.0.exe          # ポータブル版
```

### ビルド設定のカスタマイズ

`frontend/package.json` の `build` セクションを編集:

```json
{
  "build": {
    "appId": "com.eagle.app",
    "productName": "Eagle App",
    "win": {
      "target": ["nsis", "portable"],
      "icon": "public/icon.ico"
    }
  }
}
```

---

## 🔍 トラブルシューティング（Electron）

### 1. Electronが起動しない

**症状:** `npm run electron:start` でエラー

**解決策:**
```bash
# Node.jsのバージョン確認（18以上推奨）
node --version

# 依存関係の再インストール
cd frontend
rm -rf node_modules
npm install
```

### 2. バックエンドに接続できない

**症状:** Electronウィンドウが開くが画像が表示されない

**確認事項:**
- バックエンドが起動しているか（コンソールログ確認）
- `config.ts` の環境検出が正しく動作しているか

**デバッグ:**
```javascript
// ブラウザのDevToolsで確認（Electron内でF12）
console.log('API_BASE_URL:', API_BASE_URL);
console.log('IS_ELECTRON:', IS_ELECTRON);
```

### 3. nginx が起動しない

**症状:** `start-all.bat` や `start-server.bat` でnginxエラー

**解決策:**
```bash
# nginxのパスを確認
cd nginx
nginx.exe -v

# 既に起動している場合は停止
nginx.exe -s stop

# 再起動
nginx.exe
```

### 4. ホットリロードが動作しない

**症状:** 開発中にコード変更が反映されない

**解決策:**
```bash
# Vite開発サーバーとElectronを同時起動
npm run electron:dev
```

---

## 📝 開発ワークフロー

### 通常の開発

```bash
# ターミナル1: Vite開発サーバー
cd frontend
npm run dev

# ターミナル2: バックエンド
cd backend
python -m app.main

# ブラウザで http://localhost:5173 にアクセス
```

### Electron開発

```bash
# 自動的にVite + Electronを起動
cd frontend
npm run electron:dev
```

### 本番テスト

```bash
# 1. ビルド
cd frontend
npm run build

# 2. Electron本番モードで起動
npm run electron:start
```

---

## 🌐 ネットワーク設定

### ファイアウォール設定

初回起動時にWindowsファイアウォールの許可が求められます:

- **プライベートネットワーク**: ✅ 許可（LAN内アクセス用）
- **パブリックネットワーク**: ❌ 拒否（セキュリティのため）

### ポート使用状況

| ポート | 用途 | モード |
|-------|------|--------|
| 8000 | FastAPI | 全モード |
| 80 | nginx | サーバー・ハイブリッド |
| 5173 | Vite開発サーバー | 開発時のみ |

---

## 📚 参考リンク

- [Electron公式ドキュメント](https://www.electronjs.org/docs)
- [electron-builder](https://www.electron.build/)
- [FastAPI公式ドキュメント](https://fastapi.tiangolo.com/)
- [Vite公式ドキュメント](https://vitejs.dev/)

---

**Eagle App** - デスクトップとWebのハイブリッド画像管理アプリケーション