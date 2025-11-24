# Google OAuth 設置指南

## 1. 創建 Google OAuth 應用程式

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 創建新專案或選擇現有專案
3. 在左側選單中,選擇「API 和服務」→「憑證」
4. 點擊「建立憑證」→「OAuth 用戶端 ID」
5. 如果是第一次使用,需要先設置「OAuth 同意畫面」:
   - 選擇「外部」使用者類型
   - 填寫應用程式名稱、使用者支援電子郵件
   - 添加測試使用者(開發階段)

## 2. 設置 OAuth 用戶端 ID

1. 應用程式類型選擇「網頁應用程式」
2. 名稱:填寫你的應用名稱,例如「Stop Motion Blog」
3. 已授權的 JavaScript 來源:
   ```
   http://localhost:3000
   http://localhost:5000
   ```
4. 已授權的重新導向 URI:
   ```
   http://localhost:5000/api/auth/google/callback
   ```
5. 點擊「建立」

## 3. 取得憑證

建立完成後,會顯示:
- 用戶端 ID (Client ID)
- 用戶端密鑰 (Client Secret)

## 4. 設置環境變數

將憑證添加到 `.env` 檔案:

```env
MONGO_URI=mongodb://127.0.0.1:27017/stopmotion_blog
SESSION_SECRET=your_session_secret_here
CLIENT_ORIGIN=http://localhost:3000
GOOGLE_CLIENT_ID=你的_Google_Client_ID
GOOGLE_CLIENT_SECRET=你的_Google_Client_Secret
```

**注意**: 請不要將 `.env` 檔案提交到 Git!

## 5. 測試 Google 登入

1. 啟動後端伺服器:
   ```bash
   npm start
   ```

2. 啟動前端伺服器:
   ```bash
   cd client
   npm run dev
   ```

3. 在瀏覽器中前往登入頁面
4. 點擊「使用 Google 登入」按鈕
5. 選擇 Google 帳號並授權
6. 成功後會自動跳轉回首頁

## 6. 部署時的設置

當你要部署到生產環境時:

1. 在 Google Cloud Console 中添加生產環境的 URL:
   - 已授權的 JavaScript 來源:
     ```
     https://yourdomain.com
     ```
   - 已授權的重新導向 URI:
     ```
     https://yourdomain.com/api/auth/google/callback
     ```

2. 更新環境變數:
   ```env
   CLIENT_ORIGIN=https://yourdomain.com
   ```

## 常見問題

### Q: 點擊 Google 登入後出現 400 錯誤
A: 檢查 redirect_uri 是否正確設置在 Google Console 中

### Q: 登入成功但無法存取資料
A: 確認 session 設置正確,cookie 的 sameSite 和 secure 設置要符合環境

### Q: 測試時只能用特定帳號登入
A: 在開發階段需要在 OAuth 同意畫面中添加「測試使用者」

### Q: 如何讓既有帳號連結 Google 登入?
A: 系統會自動偵測相同 email,並將 Google 帳號連結到既有帳號

## 安全性建議

1. 定期更換 SESSION_SECRET
2. 在生產環境中將 cookie.secure 設為 true
3. 使用環境變數管理敏感資料
4. 定期檢查 Google OAuth 使用情況
5. 限制 OAuth 應用的權限範圍(只請求必要的 scope)
