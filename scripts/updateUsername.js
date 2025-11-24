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

async function updateUsernames() {
  try {
    // 只在第一次連接
    if (mongoose.connection.readyState === 0) {
      console.log('連接到 MongoDB...');
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ 已連接!\n');
    }

    // 列出所有用戶
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

    const newUsername = await question('請輸入新的 Username: ');

    if (!newUsername.trim()) {
      console.log('❌ Username 不能為空!');
      rl.close();
      await mongoose.disconnect();
      process.exit(1);
    }

    // 檢查新的 username 是否已存在
    const existingUser = await User.findOne({ username: newUsername.trim() });
    if (existingUser && existingUser._id.toString() !== selectedUser._id.toString()) {
      console.log('❌ 這個 Username 已經被使用!');
      rl.close();
      await mongoose.disconnect();
      process.exit(1);
    }

    await User.findByIdAndUpdate(selectedUser._id, {
      username: newUsername.trim()
    });

    console.log(`\n✅ 已更新 Username 為: ${newUsername.trim()}`);

    // 詢問是否繼續
    const continueUpdate = await question('\n是否要繼續更新其他帳號? (y/n): ');

    if (continueUpdate.toLowerCase() === 'y') {
      // 遞迴執行 (不關閉 readline)
      console.log();
      await updateUsernames();
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
console.log('  更新使用者 Username 工具');
console.log('='.repeat(50));
console.log();

updateUsernames();
