# 既有帳號遷移指南

由於新版本添加了 email 和 displayName 欄位,以下是如何更新既有帳號的方法:

## 方式一:透過 MongoDB Shell 更新

1. 打開 MongoDB Shell:
```bash
mongosh
```

2. 選擇資料庫:
```javascript
use stopmotion_blog
```

3. 為所有既有用戶添加 email 欄位 (範例):
```javascript
// 查看所有沒有 email 的用戶
db.users.find({ email: { $exists: false } })

// 為特定用戶添加 email
db.users.updateOne(
  { username: "你的使用者名稱" },
  {
    $set: {
      email: "youremail@example.com",
      displayName: "你的顯示名稱"
    }
  }
)

// 批次更新:為所有沒有 email 的用戶設置預設 email
db.users.updateMany(
  { email: { $exists: false } },
  [
    {
      $set: {
        email: { $concat: ["$username", "@example.com"] },
        displayName: "$username"
      }
    }
  ]
)
```

## 方式二:透過 MongoDB Compass GUI

1. 打開 MongoDB Compass 並連接到你的資料庫
2. 選擇 `stopmotion_blog` 資料庫
3. 選擇 `users` collection
4. 找到你的帳號,點擊編輯按鈕
5. 添加以下欄位:
   - `email`: "youremail@example.com"
   - `displayName`: "你的顯示名稱"
6. 點擊 Update

## 方式三:建立管理腳本

創建一個 Node.js 腳本來批次更新:

```javascript
// scripts/migrateUsers.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);

  // 找出所有沒有 email 的用戶
  const usersWithoutEmail = await User.find({
    email: { $exists: false }
  });

  console.log(`找到 ${usersWithoutEmail.length} 個需要更新的帳號`);

  for (let user of usersWithoutEmail) {
    // 設置預設 email (請手動修改為實際 email)
    user.email = `${user.username}@example.com`;
    user.displayName = user.username;
    await user.save();
    console.log(`已更新 ${user.username}`);
  }

  console.log('遷移完成!');
  process.exit(0);
}

migrate().catch(err => {
  console.error('遷移失敗:', err);
  process.exit(1);
});
```

執行腳本:
```bash
node scripts/migrateUsers.js
```

## 注意事項

1. **重要**:更新後的 email 必須是唯一的,不能重複
2. 如果你想繼續使用舊帳號,必須為它添加 email 欄位
3. 新的登入方式使用 email 而非 username
4. 既有帳號的 username 仍會保留,但主要用於內部識別
5. displayName 用於前端顯示,如果沒有設置會使用 username

## 驗證遷移

更新完成後,可以用以下方式驗證:

```javascript
// 在 MongoDB Shell 中
db.users.find({}, { username: 1, email: 1, displayName: 1 })
```

確認所有用戶都有 email 和 displayName 欄位即可。
