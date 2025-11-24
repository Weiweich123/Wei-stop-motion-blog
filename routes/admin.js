const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Middleware to check if user is admin
async function requireAdmin(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ ok: false, error: '請先登入' });
  const user = await User.findById(req.session.userId);
  if (!user || !user.isAdmin) return res.status(403).json({ ok: false, error: '需要管理員權限' });
  next();
}

// Get all users (admin only)
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ ok: true, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Toggle admin status (admin only)
router.post('/users/:id/toggle-admin', requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ ok: false, error: '使用者不存在' });

    // Prevent removing own admin status
    if (user._id.toString() === req.session.userId.toString()) {
      return res.status(400).json({ ok: false, error: '不能移除自己的管理員權限' });
    }

    user.isAdmin = !user.isAdmin;
    await user.save();

    res.json({
      ok: true,
      user: { id: user._id, username: user.username, isAdmin: user.isAdmin },
      message: user.isAdmin ? `${user.username} 已升級為管理員` : `${user.username} 的管理員權限已移除`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

module.exports = router;
