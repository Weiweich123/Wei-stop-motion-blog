require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const readline = require('readline');
const User = require('../models/User');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function resetPassword() {
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

    const choice = await question('請輸入要重置密碼的帳號編號 (或按 Enter 結束): ');

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
    console.log(`\n正在為 ${selectedUser.username} (${selectedUser.email}) 重置密碼`);

    const newPassword = await question('請輸入新密碼: ');

    if (!newPassword.trim()) {
      console.log('❌ 密碼不能為空!');
      rl.close();
      await mongoose.disconnect();
      process.exit(1);
    }

    // Hash 新密碼
    const hash = await bcrypt.hash(newPassword.trim(), 10);

    await User.findByIdAndUpdate(selectedUser._id, {
      password: hash
    });

    console.log(`\n✅ 已重置 ${selectedUser.username} 的密碼!`);
    console.log(`   Email: ${selectedUser.email}`);
    console.log(`   新密碼: ${newPassword.trim()}`);

    const continueUpdate = await question('\n是否要繼續重置其他帳號密碼? (y/n): ');

    if (continueUpdate.toLowerCase() === 'y') {
      console.log();
      await resetPassword();
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
console.log('  重置使用者密碼工具');
console.log('='.repeat(50));
console.log();

resetPassword();
