require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function checkUsers() {
  try {
    console.log('連接到 MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ 已連接!\n');

    const users = await User.find({});

    console.log('📝 所有帳號資訊:\n');
    users.forEach((user, index) => {
      console.log(`${index + 1}. Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   顯示名稱: ${user.displayName || '(未設定)'}`);
      console.log(`   有密碼: ${user.password ? '是 (長度: ' + user.password.length + ')' : '否 (Google登入)'}`);
      console.log(`   Google ID: ${user.googleId || '無'}`);
      console.log(`   管理員: ${user.isAdmin ? '是' : '否'}`);
      console.log(`   ID: ${user._id}\n`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ 錯誤:', err);
    process.exit(1);
  }
}

console.log('='.repeat(50));
console.log('  檢查所有使用者帳號');
console.log('='.repeat(50));
console.log();

checkUsers();
