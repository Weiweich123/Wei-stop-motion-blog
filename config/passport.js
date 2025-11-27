const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// 動態設定 callback URL - production 環境使用完整 URL
const getCallbackURL = () => {
  // 優先使用手動設定的 SERVER_URL
  if (process.env.SERVER_URL) {
    const baseUrl = process.env.SERVER_URL.replace(/\/$/, ''); // 移除結尾斜線
    return `${baseUrl}/api/auth/google/callback`;
  }
  // 其次使用 CLIENT_ORIGIN（如果後端和前端同網域）
  if (process.env.NODE_ENV === 'production' && process.env.CLIENT_ORIGIN) {
    const baseUrl = process.env.CLIENT_ORIGIN.replace(/\/$/, ''); // 移除結尾斜線
    return `${baseUrl}/api/auth/google/callback`;
  }
  // 本地開發
  return '/api/auth/google/callback';
};

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: getCallbackURL()
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // 檢查是否已有此 Google 帳號
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
        return done(null, user);
      }

      // 檢查 email 是否已存在
      const email = profile.emails[0].value;
      user = await User.findOne({ email });

      if (user) {
        // 將現有帳號連結到 Google
        user.googleId = profile.id;
        if (!user.displayName) {
          user.displayName = profile.displayName;
        }
        await user.save();
        return done(null, user);
      }

      // 建立新使用者
      user = await User.create({
        googleId: profile.id,
        email: email,
        username: email.split('@')[0],
        displayName: profile.displayName,
        password: 'google_oauth_user' // Google 登入不需要密碼
      });

      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }
));

module.exports = passport;
