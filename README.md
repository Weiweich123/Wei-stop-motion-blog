# Stop Motion Blog

完整的部落格 Web 應用程式，包含前端（React + Vite）與後端（Node.js + Express + MongoDB）。

## 功能

- **使用者系統**：註冊、登入、登出，密碼使用 bcrypt 加密
- **管理員權限**：只有管理員可以發表文章，所有使用者可以留言
- **Session 管理**：express-session + connect-mongo
- **文章系統**：發表新文章（標題、內容、縮圖、標籤）、文章列表、文章詳細頁
- **留言系統**：所有登入使用者都可以在文章下留言
- **標籤功能**：為文章加上標籤分類，並可在首頁依標籤篩選文章
- **即時回饋**：登入/登出/發文/留言等操作都有成功/失敗提示訊息
- **保護路由**：發表文章需管理員權限，留言需登入
- **前端導航**：根據登入狀態與使用者角色顯示不同選項

## 快速啟動（Windows cmd.exe）

### 前置需求

- 安裝 Node.js 16+ 以及 npm
- 安裝 MongoDB（本機或使用 MongoDB Atlas 雲端服務）

### 1. 安裝後端

```cmd
cd "d:\大學\台科大\114-1\雲端服務應用導論\stop motion blog"
npm install
copy .env.example .env
```

編輯 `.env` 檔案，設定 `MONGO_URI` 與 `SESSION_SECRET`：

```
MONGO_URI=mongodb://127.0.0.1:27017/stopmotion_blog
SESSION_SECRET=your_secret_key_here
CLIENT_ORIGIN=http://localhost:3000
```

### 2. 啟動後端伺服器

```cmd
npm run dev
```

後端預設在 `http://localhost:5000` 運行。

### 3. 安裝前端

開新終端視窗：

```cmd
cd "d:\大學\台科大\114-1\雲端服務應用導論\stop motion blog\client"
npm install
```

### 4. 啟動前端

```cmd
npm start
```

前端預設在 `http://localhost:3000` 運行。

### 5. 建立管理員帳號

**重要**：只有管理員可以發表文章。第一次使用需要建立管理員帳號：

```cmd
node scripts\createAdmin.js
```

這會建立一個管理員帳號：
- **帳號**：`admin`
- **密碼**：`admin123`

⚠️ 請在登入後立即修改密碼！

### 6. 開啟瀏覽器

在瀏覽器中開啟 `http://localhost:3000`，即可使用部落格應用程式。

## API 路由

### 認證 API
- `POST /api/auth/register` — 註冊
- `POST /api/auth/login` — 登入
- `POST /api/auth/logout` — 登出
- `GET /api/auth/profile` — 取得使用者資訊（需登入）

### 文章 API
- `GET /api/posts` — 取得文章列表
- `GET /api/posts/:id` — 取得單篇文章詳細資訊
- `POST /api/posts/create` — 發表新文章（需管理員權限）

### 留言 API
- `GET /api/posts/:id/comments` — 取得文章的所有留言
- `POST /api/posts/:id/comments` — 在文章下留言（需登入）

## 技術堆疊

### 後端

- Node.js + Express
- MongoDB + Mongoose
- bcrypt（密碼加密）
- express-session + connect-mongo（Session 管理）
- multer（圖片上傳）
- CORS（跨域請求）

### 前端

- React 18
- React Router v6
- Vite（開發伺服器與建置工具）
- 簡單 CSS 樣式

## 注意事項

- 請確保 MongoDB 正在運行且可連線。
- Session 使用 MongoDB 儲存，確保 `MONGO_URI` 正確設定。
- **只有管理員可以發表文章**，一般使用者只能留言。使用 `node scripts\createAdmin.js` 建立管理員帳號。
- 圖片上傳至 `uploads/` 資料夾，透過 `/uploads` 路徑存取。
- 前端使用 Vite proxy 將 `/api` 和 `/uploads` 請求轉發至後端 `http://localhost:5000`。
- **標籤功能**：發文時可以加上標籤（用逗號分隔），首頁可以點擊標籤篩選相關文章。

## 如何設定誰可以發文？

目前系統設計為**只有管理員可以發文**，所有登入使用者都可以留言。

如果你想要修改權限：

### 方法 1：讓所有使用者都可以發文

編輯 `routes/posts.js`，將：
```javascript
router.post('/create', requireAdmin, upload.single('image'), async (req, res) => {
```
改為：
```javascript
router.post('/create', requireAuth, upload.single('image'), async (req, res) => {
```

並在前端 `client/src/components/NavBar.jsx` 中，將：
```javascript
{user.isAdmin && <Link to="/create" style={{marginRight:12}}>發表文章</Link>}
```
改為：
```javascript
<Link to="/create" style={{marginRight:12}}>發表文章</Link>
```

### 方法 2：手動設定特定使用者為管理員

在 MongoDB 中找到該使用者，將 `isAdmin` 欄位設為 `true`。

或使用 MongoDB shell：
```javascript
db.users.updateOne({ username: "使用者名稱" }, { $set: { isAdmin: true } })
```

## 專案結構

```
.
├── server.js              # 後端主檔案
├── package.json           # 後端依賴
├── .env.example           # 環境變數範例
├── utils/
│   └── db.js              # MongoDB 連線
├── models/
│   ├── User.js            # 使用者模型（含 isAdmin 欄位）
│   ├── Post.js            # 文章模型
│   └── Comment.js         # 留言模型
├── routes/
│   ├── auth.js            # 認證路由
│   └── posts.js           # 文章與留言路由
├── scripts/
│   └── createAdmin.js     # 建立管理員帳號腳本
├── uploads/               # 上傳圖片目錄
└── client/                # 前端專案
    ├── package.json       # 前端依賴
    ├── index.html         # HTML 入口
    ├── vite.config.js     # Vite 設定
    └── src/
        ├── main.jsx       # React 入口
        ├── App.jsx        # 主元件
        ├── api.js         # API 呼叫工具
        ├── index.css      # 全域樣式
        └── components/
            ├── NavBar.jsx      # 導航列
            ├── Home.jsx        # 首頁（含標籤篩選）
            ├── PostDetail.jsx  # 文章詳細頁面（含留言）
            ├── Login.jsx       # 登入頁面
            ├── Register.jsx    # 註冊頁面
            ├── Profile.jsx     # 個人頁面
            ├── CreatePost.jsx  # 發表文章頁面
            └── Toast.jsx       # 提示訊息元件
```

## 開發

後端使用 `nodemon` 進行熱重載：

```cmd
npm run dev
```

前端使用 Vite HMR（Hot Module Replacement）：

```cmd
cd client
npm start
```

## 建置前端

```cmd
cd client
npm run build
```

建置完成後產生 `dist/` 資料夾，可以部署至靜態伺服器或透過後端提供。

---

開發完成！如有問題請檢查 MongoDB 連線與 `.env` 設定。
