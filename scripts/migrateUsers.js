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

async function migrate() {
  try {
    console.log('連接到 MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ 已連接!\n');

    // 找出所有沒有 email 的用戶
    const usersWithoutEmail = await User.find({
      email: { $exists: false }
    });

    if (usersWithoutEmail.length === 0) {
      console.log('🎉 所有帳號都已經有 email,不需要遷移!');
      process.exit(0);
    }

    console.log(`找到 ${usersWithoutEmail.length} 個需要更新的帳號:\n`);

    for (let user of usersWithoutEmail) {
      console.log(`📝 使用者: ${user.username}`);
      console.log(`   ID: ${user._id}`);
      console.log(`   建立時間: ${user.createdAt}\n`);
    }

    const choice = await question('你想要如何處理這些帳號?\n1. 為每個帳號手動輸入 email\n2. 自動生成 email (username@example.com)\n3. 取消\n請選擇 (1/2/3): ');

    if (choice === '1') {
      // 手動輸入 email
      for (let user of usersWithoutEmail) {
        console.log(`\n正在處理: ${user.username}`);
        const email = await question(`  請輸入 email: `);
        const displayName = await question(`  請輸入顯示名稱 (按 Enter 使用 ${user.username}): `) || user.username;

        user.email = email.trim();
        user.displayName = displayName.trim();
        await user.save();
        console.log(`  ✅ ${user.username} 已更新!`);
      }
    } else if (choice === '2') {
      // 自動生成
      console.log('\n開始自動更新...\n');
      for (let user of usersWithoutEmail) {
        user.email = `${user.username}@example.com`;
        user.displayName = user.username;
        await user.save();
        console.log(`✅ ${user.username} → ${user.email}`);
      }
    } else {
      console.log('\n已取消遷移。');
      process.exit(0);
    }

    console.log('\n🎉 遷移完成!');
    console.log('\n驗證結果:');
    const allUsers = await User.find({}, { username: 1, email: 1, displayName: 1 });
    console.table(allUsers.map(u => ({
      username: u.username,
      email: u.email,
      displayName: u.displayName
    })));

    process.exit(0);
  } catch (err) {
    console.error('❌ 遷移失敗:', err);
    process.exit(1);
  }
}

console.log('='.repeat(50));
console.log('  Stop Motion Blog - 帳號遷移工具');
console.log('='.repeat(50));
console.log();

migrate();
