require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('../models/Post');

async function fixTags() {
  try {
    console.log('連接到 MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ 已連接!\n');

    const posts = await Post.find({});
    let fixedCount = 0;

    console.log(`找到 ${posts.length} 篇文章\n`);

    for (const post of posts) {
      let needUpdate = false;
      const newTags = [];

      for (const tag of post.tags) {
        // 檢查標籤中是否包含各種逗號符號
        if (/[,，﹐､]/.test(tag)) {
          console.log(`📝 文章「${post.title}」的標籤需要拆分:`);
          console.log(`   原標籤: "${tag}"`);

          // 用各種逗號符號拆分
          const splitTags = tag.split(/[,，﹐､]/).map(t => t.trim()).filter(Boolean);
          console.log(`   拆分後: ${JSON.stringify(splitTags)}\n`);

          newTags.push(...splitTags);
          needUpdate = true;
        } else {
          newTags.push(tag);
        }
      }      if (needUpdate) {
        post.tags = newTags;
        await post.save();
        fixedCount++;
        console.log(`✅ 已更新「${post.title}」的標籤\n`);
      }
    }

    if (fixedCount === 0) {
      console.log('✨ 所有文章的標籤都已正確分割,無需修復');
    } else {
      console.log(`\n✅ 完成! 共修復了 ${fixedCount} 篇文章的標籤`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ 錯誤:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

console.log('='.repeat(50));
console.log('  修復文章標籤工具');
console.log('  (將包含逗號的標籤拆分為獨立標籤)');
console.log('='.repeat(50));
console.log();

fixTags();
