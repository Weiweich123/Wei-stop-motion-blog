# 🧱 CH峻瑋的停格動畫部落格

一個使用 MERN Stack 打造的現代化部落格系統,專注於樂高停格動畫內容分享。設計風格融合了極簡主義、LEGO 創意與停格動畫的溫暖感。

## ✨ 功能特色

### 核心功能
- 📝 **文章管理** - 完整的 CRUD 功能 (新增/編輯/刪除文章)
- 🎨 **主題分類** - 支援多標籤系統,使用中英文逗號分隔
- 💬 **留言系統** - 文章下方可以留言互動
- 👁️ **瀏覽統計** - 自動追蹤文章瀏覽次數
- 🔥 **熱門文章** - 依照瀏覽數排序的熱門文章列表
- 📤 **社群分享** - 支援分享到 Facebook 和 LINE

### 使用者系統
- 🔐 **Email 登入** - 使用 Email 作為主要登入方式
- 🌐 **Google OAuth** - 支援 Google 帳號快速登入
- 👤 **個人資料** - 可自訂顯示名稱 (displayName)
- 👑 **管理員權限** - 管理員可發表/編輯/刪除文章

### 設計特色
- 🎯 **極簡設計** - 清爽的介面,大量留白
- 🧱 **LEGO 風格** - 使用 LEGO 配色 (紅/黃/藍) 作為點綴
- 📱 **響應式設計** - 完美支援手機、平板、桌面
- 🎭 **Iansui 字型** - 使用優雅的 Iansui 繁體中文字型
- ✨ **流暢動畫** - 細緻的過渡效果與互動回饋

## 🛠️ 技術棧

### 後端
- **Node.js** + **Express.js** - 伺服器框架
- **MongoDB** + **Mongoose** - 資料庫
- **Passport.js** - Google OAuth 認證
- **bcrypt** - 密碼加密
- **express-session** - Session 管理
- **multer** - 圖片上傳處理

### 前端
- **React 18** - UI 框架
- **React Router 6** - 路由管理
- **Vite** - 建置工具
- **CSS Variables** - 主題顏色系統

## 📦 安裝與設定

### 1. 複製專案
```bash
git clone <your-repo-url>
cd "stop motion blog"
```

### 2. 安裝依賴
```bash
# 安裝後端依賴
npm install

# 安裝前端依賴
cd client
npm install
cd ..
```

### 3. 環境變數設定
創建 `.env` 檔案:
```env
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
CLIENT_ORIGIN=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 4. Google OAuth 設定 (選用)
1. 前往 [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. 建立 OAuth 2.0 用戶端 ID
3. 設定授權重新導向 URI: `http://localhost:5000/api/auth/google/callback`
4. 將 Client ID 和 Secret 填入 `.env`

### 5. 啟動應用程式

```bash
# 啟動後端 (port 5000)
npm start

# 啟動前端 (port 3000) - 開新終端機
cd client
npm run dev
```

訪問 `http://localhost:3000` 開始使用!

## 📁 專案結構

```
stop-motion-blog/
├── client/                 # 前端 React 應用
│   ├── src/
│   │   ├── components/    # React 組件
│   │   ├── api.js         # API 請求工具
│   │   ├── App.jsx        # 主應用組件
│   │   └── main.jsx       # 應用入口
│   └── index.html
├── models/                 # MongoDB 資料模型
│   ├── User.js
│   ├── Post.js
│   └── Comment.js
├── routes/                 # Express 路由
│   ├── auth.js            # 認證相關
│   ├── posts.js           # 文章相關
│   └── admin.js           # 管理功能
├── config/
│   └── passport.js        # Passport 設定
├── scripts/               # 工具腳本
│   ├── updateUsername.js  # 更新使用者名稱
│   ├── updateEmail.js     # 更新 Email
│   ├── resetPassword.js   # 重置密碼
│   └── fixTags.js         # 修復標籤格式
├── uploads/               # 上傳的圖片
├── server.js              # 後端伺服器入口
├── .env                   # 環境變數 (不上傳)
└── .gitignore
```

## 🔧 實用工具腳本

### 更新使用者名稱
```bash
node scripts/updateUsername.js
```

### 更新 Email
```bash
node scripts/updateEmail.js
```

### 重置密碼
```bash
node scripts/resetPassword.js
```

### 修復標籤格式
```bash
node scripts/fixTags.js
```

## 🎨 設計系統

### 配色方案
- **主色調**: Ivory (#fdfcfa), Warm White (#f7f5f2), Soft Beige (#f0ede8)
- **LEGO 配色**: Red (#d85140), Yellow (#f4b942), Blue (#5b95c9)
- **文字**: Charcoal (#3a3835), Secondary (#6b6863), Muted (#9b9892)

### 字型
- **主要**: Iansui (繁體中文優化)
- **次要**: Noto Sans TC

## 📝 API 端點

### 認證
- `POST /api/auth/register` - 註冊
- `POST /api/auth/login` - 登入
- `POST /api/auth/logout` - 登出
- `GET /api/auth/google` - Google OAuth 登入
- `GET /api/auth/profile` - 取得個人資料
- `PUT /api/auth/profile` - 更新個人資料

### 文章
- `GET /api/posts` - 取得所有文章
- `GET /api/posts/:id` - 取得單篇文章
- `GET /api/posts/popular/top` - 取得熱門文章
- `POST /api/posts/create` - 建立文章 (需管理員權限)
- `PUT /api/posts/:id` - 更新文章 (需管理員權限)
- `DELETE /api/posts/:id` - 刪除文章 (需管理員權限)

### 留言
- `GET /api/posts/:id/comments` - 取得文章留言
- `POST /api/posts/:id/comments` - 新增留言

## 🚀 部署建議

### MongoDB Atlas
1. 註冊 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 建立 Cluster 並取得連線字串
3. 更新 `.env` 中的 `MONGO_URI`

### Vercel / Railway / Render
- 設定環境變數
- 設定建置指令: `npm install && cd client && npm install && npm run build`
- 設定啟動指令: `npm start`

## 📄 授權

MIT License

## 👨‍💻 作者

CH峻瑋

---

⭐ 如果這個專案對你有幫助,歡迎給個星星!
