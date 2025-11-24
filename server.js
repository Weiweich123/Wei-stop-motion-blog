require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const path = require('path');
const passport = require('./config/passport');

const connectDB = require('./utils/db');

const authRouter = require('./routes/auth');
const postsRouter = require('./routes/posts');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(express.json());

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET || 'change_this_secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.use('/api/admin', adminRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Stop Motion Blog API running' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
