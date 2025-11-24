# 更新日誌 - 2024

## 🎨 設計更新

### UI 風格改進
- ✅ 從繽紛的樂高風格改為**簡約現代設計**
- ✅ 乾淨的白色導航欄,帶有柔和陰影
- ✅ 扁平化按鈕設計,保留流暢的 hover 動畫
- ✅ 柔和的配色方案 (主色:#2563eb, 次要:#64748b)
- ✅ 移除過多的 3D 效果和磚塊紋理
- ✅ 改善整體可讀性和視覺層次

## 🔐 認證系統更新

### Email 登入
- ✅ **登入改用 Email** (原本使用 username)
- ✅ 註冊時需提供 email (必填)
- ✅ username 變為選填,系統會自動生成
- ✅ 後端驗證 email 格式和唯一性

### Google OAuth 登入
- ✅ 整合 Google OAuth 2.0
- ✅ 一鍵使用 Google 帳號登入/註冊
- ✅ 自動連結相同 email 的既有帳號
- ✅ Google 用戶自動設置 displayName

### 相關檔案
- `models/User.js`: 新增 `email`, `displayName`, `googleId` 欄位
- `routes/auth.js`: 登入改用 email, 新增 Google OAuth 路由
- `config/passport.js`: Passport.js 策略設置
- `client/src/components/Login.jsx`: 新增 Google 登入按鈕
- `client/src/components/Register.jsx`: 新增 email 輸入欄位

## 📝 內容管理功能

### 文章編輯
- ✅ 管理員可以**編輯已發布的文章**
- ✅ 可更新標題、內容、標籤、圖片
- ✅ 編輯頁面會預載現有內容
- ✅ 圖片可選擇性更換

### 文章刪除
- ✅ 管理員可以**刪除文章**
- ✅ 刪除前會有確認對話框
- ✅ 自動刪除關聯的留言
- ✅ 刪除後自動跳轉回首頁

### 相關檔案
- `routes/posts.js`: 新增 PUT /:id (編輯) 和 DELETE /:id (刪除)
- `client/src/components/EditPost.jsx`: 文章編輯頁面
- `client/src/components/PostDetail.jsx`: 新增編輯/刪除按鈕

## 👤 個人資料管理

### 顯示名稱
- ✅ 新增 `displayName` 欄位
- ✅ 用於前端顯示,取代 username
- ✅ 使用者可以在個人頁面**編輯顯示名稱**
- ✅ 所有留言和文章作者會顯示 displayName

### 個人頁面更新
- ✅ 顯示 email, displayName, username
- ✅ 內建名稱編輯功能
- ✅ 即時更新,不需重新登入

### 相關檔案
- `routes/auth.js`: 新增 PUT /profile 端點
- `client/src/components/Profile.jsx`: 新增編輯表單

## 📱 社群分享優化

### Facebook 分享預覽
- ✅ 添加 **Open Graph meta tags**
- ✅ 分享文章時會顯示標題、描述、圖片
- ✅ 動態更新 meta tags (在 PostDetail 頁面)
- ✅ 支援 Twitter Card

### Meta Tags
- `og:title`: 文章標題
- `og:description`: 文章內容摘要
- `og:image`: 文章圖片
- `og:url`: 文章網址
- `og:type`: article

### 相關檔案
- `client/index.html`: 基礎 OG tags
- `client/src/components/PostDetail.jsx`: 動態更新 meta tags

## 📦 套件更新

新增的 npm 套件:
```json
{
  "passport": "^0.7.0",
  "passport-google-oauth20": "^2.0.0"
}
```

## 🔧 配置更新

### 環境變數 (.env)
新增:
```env
GOOGLE_CLIENT_ID=你的_Google_Client_ID
GOOGLE_CLIENT_SECRET=你的_Google_Client_Secret
```

### server.js
- 初始化 Passport middleware
- 整合 passport session

## 📋 遷移指南

### 既有帳號處理
如果你有既有的帳號,需要添加 email 欄位才能登入。

**快速修正方式** (MongoDB Shell):
```javascript
use stopmotion_blog
db.users.updateOne(
  { username: "你的使用者名稱" },
  {
    $set: {
      email: "youremail@example.com",
      displayName: "你的顯示名稱"
    }
  }
)
```

詳細步驟請參考 `MIGRATION.md`

## 🚀 如何使用新功能

### 設置 Google OAuth
1. 前往 Google Cloud Console 創建 OAuth 應用
2. 取得 Client ID 和 Client Secret
3. 添加到 `.env` 檔案
4. 詳細步驟請參考 `GOOGLE_OAUTH_SETUP.md`

### 編輯文章
1. 以管理員身份登入
2. 前往文章詳細頁面
3. 點擊「✏️ 編輯文章」按鈕
4. 修改內容後點擊「更新文章」

### 刪除文章
1. 以管理員身份登入
2. 前往文章詳細頁面
3. 點擊「🗑️ 刪除文章」按鈕
4. 確認刪除

### 更改顯示名稱
1. 登入後前往「個人頁面」
2. 點擊「編輯名稱」
3. 輸入新的顯示名稱
4. 點擊「儲存」

## 🐛 已知問題

1. Facebook 分享預覽需要 Facebook 爬蟲重新抓取
   - 可以使用 [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) 強制更新

2. Google OAuth 在開發階段只能用測試使用者登入
   - 需要在 Google Console 添加測試使用者

3. 本地開發的 OG image 無法被 Facebook 抓取
   - 需要部署到公開網址才能正常顯示圖片

## 📸 截圖位置

更新後的介面截圖:
- [ ] 新的登入頁面 (含 Google 登入按鈕)
- [ ] 簡約的首頁設計
- [ ] 文章詳細頁 (含編輯/刪除按鈕)
- [ ] 個人頁面編輯功能

## 下一步計劃

可能的未來功能:
- [ ] 文章草稿功能
- [ ] 圖片裁切和優化
- [ ] 留言編輯/刪除
- [ ] 標籤管理介面
- [ ] 搜尋功能加強
- [ ] 深色模式
- [ ] 多語言支援
