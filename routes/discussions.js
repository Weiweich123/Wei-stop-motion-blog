const express = require('express');
const Discussion = require('../models/Discussion');
const DiscussionComment = require('../models/DiscussionComment');
const User = require('../models/User');

const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ ok: false, error: '請先登入' });
  next();
}

// Get all discussions
router.get('/', async (req, res) => {
  try {
    const discussions = await Discussion.find()
      .populate('author', 'username displayName')
      .sort({ createdAt: -1 });

    // 取得每篇討論的留言數
    const discussionsWithCommentCount = await Promise.all(discussions.map(async (disc) => {
      const commentCount = await DiscussionComment.countDocuments({ discussion: disc._id });
      return { ...disc.toObject(), commentCount };
    }));

    res.json({ ok: true, discussions: discussionsWithCommentCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Create discussion (any logged in user)
router.post('/create', requireAuth, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ ok: false, error: '標題和內容為必填' });
    }

    const discussion = await Discussion.create({
      title: title.trim(),
      content: content.trim(),
      author: req.session.userId
    });

    await discussion.populate('author', 'username displayName');
    res.json({ ok: true, discussion, message: '發文成功!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Get single discussion
router.get('/:id', async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate('author', 'username displayName');

    if (!discussion) {
      return res.status(404).json({ ok: false, error: '討論不存在' });
    }

    res.json({ ok: true, discussion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Edit discussion
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { title, content } = req.body;
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ ok: false, error: '討論不存在' });
    }

    // 只有作者或管理員可以編輯
    const user = await User.findById(req.session.userId);
    if (discussion.author.toString() !== req.session.userId && !user.isAdmin) {
      return res.status(403).json({ ok: false, error: '無權編輯此討論' });
    }

    if (title) discussion.title = title.trim();
    if (content) discussion.content = content.trim();
    discussion.isEdited = true;
    discussion.updatedAt = new Date();
    await discussion.save();
    await discussion.populate('author', 'username displayName');

    res.json({ ok: true, discussion, message: '討論已更新!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Delete discussion
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ ok: false, error: '討論不存在' });
    }

    // 只有作者或管理員可以刪除
    const user = await User.findById(req.session.userId);
    if (discussion.author.toString() !== req.session.userId && !user.isAdmin) {
      return res.status(403).json({ ok: false, error: '無權刪除此討論' });
    }

    // 刪除相關留言
    await DiscussionComment.deleteMany({ discussion: req.params.id });
    await Discussion.findByIdAndDelete(req.params.id);

    res.json({ ok: true, message: '討論已刪除!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Get comments for a discussion
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await DiscussionComment.find({ discussion: req.params.id })
      .populate('author', 'username displayName')
      .sort({ createdAt: -1 });
    res.json({ ok: true, comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Add comment to discussion
router.post('/:id/comments', requireAuth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ ok: false, error: '留言內容不能為空' });
    }

    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ ok: false, error: '討論不存在' });
    }

    const comment = await DiscussionComment.create({
      content: content.trim(),
      author: req.session.userId,
      discussion: req.params.id
    });

    await comment.populate('author', 'username displayName');
    res.json({ ok: true, comment, message: '留言成功!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Edit comment
router.put('/:discId/comments/:commentId', requireAuth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ ok: false, error: '留言內容不能為空' });
    }

    const comment = await DiscussionComment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ ok: false, error: '留言不存在' });
    }

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
router.delete('/:discId/comments/:commentId', requireAuth, async (req, res) => {
  try {
    const comment = await DiscussionComment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ ok: false, error: '留言不存在' });
    }

    // 只有留言作者或管理員可以刪除
    const user = await User.findById(req.session.userId);
    if (comment.author.toString() !== req.session.userId && !user.isAdmin) {
      return res.status(403).json({ ok: false, error: '無權刪除此留言' });
    }

    await DiscussionComment.findByIdAndDelete(req.params.commentId);
    res.json({ ok: true, message: '留言已刪除!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

module.exports = router;
