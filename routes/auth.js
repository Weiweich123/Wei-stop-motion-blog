const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, displayName } = req.body;
    if (!email || !password) return res.status(400).json({ ok: false, error: 'Email 和密碼為必填' });

    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ ok: false, error: 'Email 已被使用' });

    if (username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) return res.status(400).json({ ok: false, error: '使用者名稱已被使用' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: username || email.split('@')[0],
      email,
      password: hash,
      displayName: displayName || username || email.split('@')[0]
    });
    req.session.userId = user._id;
    res.json({ ok: true, user: { id: user._id, username: user.username, email: user.email, displayName: user.displayName, isAdmin: user.isAdmin, createdAt: user.createdAt }, message: '註冊成功！' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ ok: false, error: 'Email 和密碼為必填' });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ ok: false, error: '登入資訊錯誤' });
    if (!user.password) return res.status(400).json({ ok: false, error: '此帳號使用 Google 登入' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ ok: false, error: '登入資訊錯誤' });
    req.session.userId = user._id;
    res.json({ ok: true, user: { id: user._id, username: user.username, email: user.email, displayName: user.displayName, isAdmin: user.isAdmin, createdAt: user.createdAt }, message: '登入成功！' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ ok: false, error: 'Could not logout' });
    res.clearCookie('connect.sid');
    res.json({ ok: true, message: '登出成功！' });
  });
});

router.get('/profile', async (req, res) => {
  try {
    if (!req.session.userId) return res.status(401).json({ ok: false, error: 'Not authenticated' });
    const user = await User.findById(req.session.userId).select('-password');
    if (!user) return res.status(404).json({ ok: false, error: 'User not found' });
    res.json({ ok: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

router.put('/profile', async (req, res) => {
  try {
    if (!req.session.userId) return res.status(401).json({ ok: false, error: 'Not authenticated' });
    const { displayName } = req.body;
    if (!displayName) return res.status(400).json({ ok: false, error: 'Display name is required' });

    const user = await User.findByIdAndUpdate(
      req.session.userId,
      { displayName },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ ok: false, error: 'User not found' });
    res.json({ ok: true, user, message: '名稱更新成功！' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Set session userId for consistency with regular login
    req.session.userId = req.user._id;
    // Redirect to frontend
    res.redirect(process.env.CLIENT_ORIGIN || 'http://localhost:3000');
  }
);

module.exports = router;
