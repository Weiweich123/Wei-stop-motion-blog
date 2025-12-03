# Stop Motion Blog

完整的部落格 Web 應用程式，包含前端（React + Vite）與後端（Node.js + Express + MongoDB）。支援 Vercel 部署。

## 功能

### 使用者系統
- **註冊/登入**：Email + 密碼，密碼使用 bcrypt 加密
- **Google OAuth 登入**：支援 Google 帳號快速登入
- **顯示名稱**：使用者可設定自訂顯示名稱
- **Session 管理**：express-session + connect-mongo

### 文章系統
- **發表文章**：標題、內容、縮圖、標籤（僅管理員）
- **編輯/刪除文章**：管理員可編輯或刪除自己的文章
- **標籤篩選**：首頁可依標籤篩選文章
- **留言數顯示**：文章列表顯示留言數量

### 討論區
- **發起討論**：所有登入使用者都可以發起討論
- **編輯/刪除討論**：作者可編輯或刪除自己的討論

### 留言系統
- **留言功能**：所有登入使用者可以留言
- **回覆功能**：可以回覆特定留言，支援巢狀回覆
- **引用顯示**：回覆時顯示被回覆的原始內容
- **編輯/刪除**：使用者可編輯或刪除自己的留言
- **管理員權限**：管理員可刪除任何留言（但不能編輯他人留言）
- **級聯刪除**：刪除留言時自動刪除所有巢狀回覆

### 管理員功能
- **管理員面板**：查看所有使用者
- **權限管理**：升級/降級使用者的管理員權限
- **內容管理**：可刪除任何留言

### UI/UX
- **響應式設計**：支援桌面和行動裝置
- **載入狀態**：頁面載入時顯示 Loading 狀態
- **即時回饋**：操作成功/失敗顯示 Toast 提示
- **URL 可點擊**：留言中的網址自動轉換為可點擊連結

## 快速啟動（本地開發）

### 前置需求

- Node.js 16+ 以及 npm
- MongoDB（本機或 MongoDB Atlas 雲端服務）
- （可選）Google OAuth 憑證

### 1. 安裝後端

```cmd
cd "d:\大學\台科大\114-1\雲端服務應用導論\stop motion blog"
npm install
copy .env.example .env
```

編輯 `.env` 檔案：

```env
MONGO_URI=mongodb://127.0.0.1:27017/stopmotion_blog
SESSION_SECRET=your_secret_key_here
CLIENT_ORIGIN=http://localhost:3000

# Google OAuth（可選）
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
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
- **Email**：`admin@example.com`
- **密碼**：`admin123`

⚠️ 請在登入後立即修改密碼！

### 6. 開啟瀏覽器

在瀏覽器中開啟 `http://localhost:3000`，即可使用部落格應用程式。

## Vercel 部署

本專案已設定好 Vercel 部署配置（`vercel.json`）。

### 部署步驟

1. 將專案推送至 GitHub
2. 在 Vercel 連接 GitHub 專案
3. 設定環境變數：
   - `MONGO_URI`
   - `SESSION_SECRET`
   - `CLIENT_ORIGIN`（設為 Vercel 網域）
   - `GOOGLE_CLIENT_ID`（可選）
   - `GOOGLE_CLIENT_SECRET`（可選）
4. 部署

詳細的 Google OAuth 設定請參考 `GOOGLE_OAUTH_SETUP.md`。

## API 路由

### 認證 API（`/api/auth`）
| 方法 | 路徑 | 說明 | 權限 |
|------|------|------|------|
| POST | `/register` | 註冊新帳號 | 公開 |
| POST | `/login` | 登入 | 公開 |
| POST | `/logout` | 登出 | 需登入 |
| GET | `/profile` | 取得使用者資訊 | 需登入 |
| GET | `/google` | Google OAuth 登入 | 公開 |
| GET | `/google/callback` | Google OAuth 回調 | 公開 |

### 文章 API（`/api/posts`）
| 方法 | 路徑 | 說明 | 權限 |
|------|------|------|------|
| GET | `/` | 取得文章列表（含留言數） | 公開 |
| GET | `/:id` | 取得單篇文章 | 公開 |
| POST | `/create` | 發表新文章 | 管理員 |
| PUT | `/:id` | 編輯文章 | 管理員（作者） |
| DELETE | `/:id` | 刪除文章 | 管理員（作者） |
| GET | `/:id/comments` | 取得文章留言 | 公開 |
| POST | `/:id/comments` | 新增留言/回覆 | 需登入 |
| PUT | `/:postId/comments/:commentId` | 編輯留言 | 作者 |
| DELETE | `/:postId/comments/:commentId` | 刪除留言（含回覆） | 作者/管理員 |

### 討論區 API（`/api/discussions`）
| 方法 | 路徑 | 說明 | 權限 |
|------|------|------|------|
| GET | `/` | 取得討論列表（含留言數） | 公開 |
| GET | `/:id` | 取得單篇討論 | 公開 |
| POST | `/create` | 發起新討論 | 需登入 |
| PUT | `/:id` | 編輯討論 | 作者 |
| DELETE | `/:id` | 刪除討論 | 作者/管理員 |
| GET | `/:id/comments` | 取得討論留言 | 公開 |
| POST | `/:id/comments` | 新增留言/回覆 | 需登入 |
| PUT | `/:discId/comments/:commentId` | 編輯留言 | 作者 |
| DELETE | `/:discId/comments/:commentId` | 刪除留言（含回覆） | 作者/管理員 |

### 管理員 API（`/api/admin`）
| 方法 | 路徑 | 說明 | 權限 |
|------|------|------|------|
| GET | `/users` | 取得所有使用者 | 管理員 |
| POST | `/users/:id/toggle-admin` | 切換管理員權限 | 管理員 |

## 技術堆疊

### 後端
- **Node.js + Express** — Web 伺服器
- **MongoDB + Mongoose** — 資料庫
- **bcrypt** — 密碼加密
- **express-session + connect-mongo** — Session 管理
- **Passport.js + passport-google-oauth20** — Google OAuth
- **multer** — 圖片上傳
- **CORS** — 跨域請求

### 前端
- **React 18** — UI 框架
- **React Router v6** — 路由管理
- **Vite** — 開發伺服器與建置工具
- **CSS** — 樣式

### 部署
- **Vercel** — Serverless 部署
- **MongoDB Atlas** — 雲端資料庫

## 專案結構

```
.
├── server.js                 # 後端主檔案
├── package.json              # 後端依賴
├── vercel.json               # Vercel 部署配置
├── .env.example              # 環境變數範例
├── GOOGLE_OAUTH_SETUP.md     # Google OAuth 設定指南
│
├── config/
│   └── passport.js           # Passport.js 配置
│
├── utils/
│   └── db.js                 # MongoDB 連線
│
├── models/
│   ├── User.js               # 使用者模型
│   ├── Post.js               # 文章模型
│   ├── Comment.js            # 文章留言模型（支援回覆）
│   ├── Discussion.js         # 討論模型
│   └── DiscussionComment.js  # 討論留言模型（支援回覆）
│
├── routes/
│   ├── auth.js               # 認證路由（含 Google OAuth）
│   ├── posts.js              # 文章與留言路由
│   ├── discussions.js        # 討論區路由
│   └── admin.js              # 管理員路由
│
├── scripts/
│   ├── createAdmin.js        # 建立管理員帳號
│   ├── resetPassword.js      # 重設密碼
│   ├── updateDisplayName.js  # 更新顯示名稱
│   ├── updateEmail.js        # 更新 Email
│   ├── updateUsername.js     # 更新使用者名稱
│   ├── migrateUsers.js       # 使用者資料遷移
│   ├── checkUsers.js         # 檢查使用者資料
│   ├── checkEnv.js           # 檢查環境變數
│   ├── checkTags.js          # 檢查標籤資料
│   └── fixTags.js            # 修復標籤資料
│
├── uploads/                  # 上傳圖片目錄
│
└── client/                   # 前端專案
    ├── package.json          # 前端依賴
    ├── index.html            # HTML 入口
    ├── vite.config.js        # Vite 設定
    └── src/
        ├── main.jsx          # React 入口
        ├── App.jsx           # 主元件（路由配置）
        ├── api.js            # API 呼叫工具
        ├── index.css         # 全域樣式
        └── components/
            ├── NavBar.jsx         # 導航列
            ├── Sidebar.jsx        # 側邊欄（標籤篩選）
            ├── Home.jsx           # 首頁
            ├── PostList.jsx       # 文章列表元件
            ├── PostDetail.jsx     # 文章詳細頁（含留言/回覆）
            ├── CreatePost.jsx     # 發表文章頁
            ├── EditPost.jsx       # 編輯文章頁
            ├── Discussions.jsx    # 討論區列表
            ├── DiscussionDetail.jsx # 討論詳細頁（含留言/回覆）
            ├── CreateDiscussion.jsx # 發起討論頁
            ├── Login.jsx          # 登入頁
            ├── Register.jsx       # 註冊頁
            ├── Profile.jsx        # 個人頁面
            ├── AdminPanel.jsx     # 管理員面板
            └── Toast.jsx          # 提示訊息元件
```

## 資料模型

### User（使用者）
```javascript
{
  username: String,        // 使用者名稱
  email: String,           // Email（唯一）
  password: String,        // 密碼（bcrypt 加密，Google 登入為空）
  displayName: String,     // 顯示名稱
  googleId: String,        // Google OAuth ID
  isAdmin: Boolean,        // 是否為管理員
  createdAt: Date
}
```

### Comment / DiscussionComment（留言）
```javascript
{
  content: String,         // 留言內容
  author: ObjectId,        // 作者（ref: User）
  post/discussion: ObjectId, // 所屬文章/討論
  parentComment: ObjectId, // 父留言（回覆用，null 表示主留言）
  replyToUser: ObjectId,   // 回覆對象（ref: User）
  isEdited: Boolean,       // 是否已編輯
  createdAt: Date,
  updatedAt: Date
}
```

## 開發指令

### 後端

```cmd
npm run dev     # 開發模式（nodemon 熱重載）
npm start       # 生產模式
```

### 前端

```cmd
cd client
npm start       # 開發模式（Vite HMR）
npm run build   # 建置生產版本
```

### 實用腳本

```cmd
node scripts\createAdmin.js        # 建立管理員
node scripts\resetPassword.js      # 重設使用者密碼
node scripts\checkUsers.js         # 查看所有使用者
node scripts\checkEnv.js           # 檢查環境變數
```

## 權限說明

| 功能 | 訪客 | 登入使用者 | 管理員 |
|------|:----:|:----------:|:------:|
| 瀏覽文章/討論 | ✅ | ✅ | ✅ |
| 發表文章 | ❌ | ❌ | ✅ |
| 發起討論 | ❌ | ✅ | ✅ |
| 留言 | ❌ | ✅ | ✅ |
| 回覆留言 | ❌ | ✅ | ✅ |
| 編輯自己的留言 | ❌ | ✅ | ✅ |
| 刪除自己的留言 | ❌ | ✅ | ✅ |
| 刪除他人的留言 | ❌ | ❌ | ✅ |
| 管理員面板 | ❌ | ❌ | ✅ |

---

如有問題請檢查 MongoDB 連線與 `.env` 設定。
