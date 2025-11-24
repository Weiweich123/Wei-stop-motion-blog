require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');
const User = require('../models/User');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function updateEmail() {
  try {
    if (mongoose.connection.readyState === 0) {
      console.log('連接到 MongoDB...');
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ 已連接!\n');
    }

    const users = await User.find({}, { username: 1, email: 1, displayName: 1 });

    console.log('📝 現有帳號列表:\n');
    users.forEach((user, index) => {
      console.log(`${index + 1}. Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   顯示名稱: ${user.displayName || '(未設定)'}`);
      console.log(`   ID: ${user._id}\n`);
    });

    const choice = await question('請輸入要更新的帳號編號 (或按 Enter 結束): ');

    if (!choice.trim()) {
      console.log('已取消。');
      rl.close();
      await mongoose.disconnect();
      process.exit(0);
    }

    const index = parseInt(choice) - 1;
    if (index < 0 || index >= users.length) {
      console.log('❌ 無效的編號!');
      rl.close();
      await mongoose.disconnect();
      process.exit(1);
    }

    const selectedUser = users[index];
    console.log(`\n正在更新: ${selectedUser.username}`);
    console.log(`目前 Email: ${selectedUser.email}`);

    const newEmail = await question('請輸入新的 Email: ');

    if (!newEmail.trim()) {
      console.log('❌ Email 不能為空!');
      rl.close();
      await mongoose.disconnect();
      process.exit(1);
    }

    // 驗證 email 格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      console.log('❌ Email 格式不正確!');
      rl.close();
      await mongoose.disconnect();
      process.exit(1);
    }

    // 檢查新的 email 是否已存在
    const existingUser = await User.findOne({ email: newEmail.trim() });
    if (existingUser && existingUser._id.toString() !== selectedUser._id.toString()) {
      console.log('❌ 這個 Email 已經被使用!');
      rl.close();
      await mongoose.disconnect();
      process.exit(1);
    }

    await User.findByIdAndUpdate(selectedUser._id, {
      email: newEmail.trim()
    });

    console.log(`\n✅ 已更新 Email 為: ${newEmail.trim()}`);

    const continueUpdate = await question('\n是否要繼續更新其他帳號? (y/n): ');

    if (continueUpdate.toLowerCase() === 'y') {
      console.log();
      await updateEmail();
    } else {
      console.log('\n完成!');
      rl.close();
      await mongoose.disconnect();
      process.exit(0);
    }

  } catch (err) {
    console.error('❌ 錯誤:', err);
    rl.close();
    await mongoose.disconnect();
    process.exit(1);
  }
}

console.log('='.repeat(50));
console.log('  更新使用者 Email 工具');
console.log('='.repeat(50));
console.log();

updateEmail();
