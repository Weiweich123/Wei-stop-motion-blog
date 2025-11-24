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

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
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
