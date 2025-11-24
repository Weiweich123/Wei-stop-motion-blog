const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // 保留以支援舊帳號
  email: { type: String, unique: true, sparse: true }, // 新增 email 登入
  password: { type: String, required: true },
  displayName: { type: String }, // 顯示名稱
  googleId: { type: String, unique: true, sparse: true }, // Google OAuth
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
