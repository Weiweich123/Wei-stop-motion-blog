require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('../models/Post');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const posts = await Post.find({}, {title: 1, tags: 1});
  console.log('文章標籤狀態:');
  posts.forEach(p => {
    console.log(`\n標題: ${p.title}`);
    console.log(`標籤類型: ${typeof p.tags}`);
    console.log(`標籤是陣列: ${Array.isArray(p.tags)}`);
    console.log(`標籤內容: ${JSON.stringify(p.tags)}`);
  });
  await mongoose.disconnect();
  process.exit(0);
});
