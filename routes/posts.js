const express = require('express');
const multer = require('multer');
const path = require('path');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const upload = multer({ storage });

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ ok: false, error: 'Not authenticated' });
  next();
}

async function requireAdmin(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ ok: false, error: '請先登入' });
  const user = await User.findById(req.session.userId);
  if (!user || !user.isAdmin) return res.status(403).json({ ok: false, error: '只有管理員可以發文' });
  next();
}

router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'username displayName').sort({ createdAt: -1 });

    // 取得每篇文章的留言數
    const postsWithCommentCount = await Promise.all(posts.map(async (post) => {
      const commentCount = await Comment.countDocuments({ post: post._id });
      return { ...post.toObject(), commentCount };
    }));

    res.json({ ok: true, posts: postsWithCommentCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Get popular posts
router.get('/popular/top', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const posts = await Post.find()
      .populate('author', 'username displayName')
      .sort({ views: -1 })
      .limit(limit)
      .select('title views createdAt author');
    res.json({ ok: true, posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

router.post('/create', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    if (!title || !content) return res.status(400).json({ ok: false, error: 'Missing fields' });
    const post = new Post({
      title,
      content,
      tags: tags ? tags.split(/[,，﹐、]/).map(t => t.trim()).filter(Boolean) : [],
      author: req.session.userId,
      image: req.file ? `/uploads/${req.file.filename}` : undefined
    });
    await post.save();
    res.json({ ok: true, post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Get single post with details
router.get('/:id', async (req, res) => {
  try {
    // 使用 findByIdAndUpdate 原子操作增加瀏覽數
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'username displayName');

    if (!post) return res.status(404).json({ ok: false, error: '文章不存在' });

    res.json({ ok: true, post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Get comments for a post
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate('author', 'username displayName')
      .populate('replyToUser', 'username displayName')
      .sort({ createdAt: 1 }); // 改為由舊到新，方便顯示對話脈絡
    res.json({ ok: true, comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Add comment to a post
router.post('/:id/comments', requireAuth, async (req, res) => {
  try {
    const { content, parentCommentId, replyToUserId } = req.body;
    if (!content) return res.status(400).json({ ok: false, error: '留言內容不能為空' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ ok: false, error: '文章不存在' });

    const commentData = {
      content,
      author: req.session.userId,
      post: req.params.id
    };

    // 如果是回覆留言
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ ok: false, error: '要回覆的留言不存在' });
      }
      commentData.parentComment = parentCommentId;
    }

    // 記錄回覆對象
    if (replyToUserId) {
      commentData.replyToUser = replyToUserId;
    }

    const comment = await Comment.create(commentData);
    await comment.populate('author', 'username displayName');
    await comment.populate('replyToUser', 'username displayName');

    res.json({ ok: true, comment, message: '留言成功!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Edit post (admin only)
router.put('/:id', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, content, tags, removeImage } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ ok: false, error: '文章不存在' });

    // Check if user is the author or admin
    const user = await User.findById(req.session.userId);
    if (!user.isAdmin && post.author.toString() !== req.session.userId) {
      return res.status(403).json({ ok: false, error: '無權編輯此文章' });
    }

    if (title) post.title = title;
    if (content) post.content = content;
    if (tags !== undefined) {
      post.tags = tags.split(/[,，﹐、]/).map(t => t.trim()).filter(Boolean);
    }

    // 處理圖片：如果要刪除圖片，設為 null；如果有新圖片，更新
    if (removeImage === 'true' || removeImage === true) {
      post.image = null;
    } else if (req.file) {
      post.image = `/uploads/${req.file.filename}`;
    }

    await post.save();
    await post.populate('author', 'username');
    res.json({ ok: true, post, message: '文章更新成功!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Delete post (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ ok: false, error: '文章不存在' });

    // Check if user is the author or admin
    const user = await User.findById(req.session.userId);
    if (!user.isAdmin && post.author.toString() !== req.session.userId) {
      return res.status(403).json({ ok: false, error: '無權刪除此文章' });
    }

    // Delete associated comments
    await Comment.deleteMany({ post: req.params.id });

    // Delete the post
    await Post.findByIdAndDelete(req.params.id);

    res.json({ ok: true, message: '文章已刪除!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Edit comment
router.put('/:postId/comments/:commentId', requireAuth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ ok: false, error: '留言內容不能為空' });
    }

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ ok: false, error: '留言不存在' });

    // 只有留言作者可以編輯（管理員也不能編輯別人的留言）
    if (comment.author.toString() !== req.session.userId) {
      return res.status(403).json({ ok: false, error: '只有留言作者可以編輯' });
    }

    comment.content = content.trim();
    comment.isEdited = true;
    comment.updatedAt = new Date();
    await comment.save();
    await comment.populate('author', 'username displayName');

    res.json({ ok: true, comment, message: '留言已更新!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Delete comment
router.delete('/:postId/comments/:commentId', requireAuth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ ok: false, error: '留言不存在' });

    // 只有留言作者或管理員可以刪除
    const user = await User.findById(req.session.userId);
    if (comment.author.toString() !== req.session.userId && !user.isAdmin) {
      return res.status(403).json({ ok: false, error: '無權刪除此留言' });
    }

    // 刪除此留言的所有回覆
    await Comment.deleteMany({ parentComment: req.params.commentId });
    // 刪除留言本身
    await Comment.findByIdAndDelete(req.params.commentId);

    res.json({ ok: true, message: '留言已刪除!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

module.exports = router;
