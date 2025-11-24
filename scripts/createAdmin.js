// 使用此腳本來建立管理員帳號
// 執行方式: node scripts/createAdmin.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/stopmotion_blog';
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');

    // 檢查是否已有管理員
    const existingAdmin = await User.findOne({ isAdmin: true });
    if (existingAdmin) {
      console.log('已經有管理員帳號:', existingAdmin.username);
      process.exit(0);
    }

    // 建立管理員帳號
    const username = 'admin';
    const password = 'admin123'; // 請在生產環境中使用更強的密碼

    const hash = await bcrypt.hash(password, 10);
    const admin = await User.create({
      username,
      password: hash,
      isAdmin: true
    });

    console.log('✅ 管理員帳號建立成功！');
    console.log('帳號:', username);
    console.log('密碼:', password);
    console.log('請登入後立即修改密碼！');

    process.exit(0);
  } catch (err) {
    console.error('❌ 建立失敗:', err);
    process.exit(1);
  }
};

createAdmin();
