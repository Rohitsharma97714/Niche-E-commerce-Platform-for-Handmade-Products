require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');
const session = require('express-session');
const passport = require('passport');

// Import route files
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/ProductRoutes');
const adminRoutes = require('./routes/adminRoutes');
const emailOtpRoutes = require('./routes/emailOtpRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const emailRoutes = require('./routes/emailRoutes');

const app = express();

// ✅ Generate server key on startup for JWT token invalidation
global.serverKey = crypto.randomBytes(32).toString('hex');
console.log('Server started with key:', global.serverKey);

// ✅ CORS setup
app.use(cors({
  origin: ["http://localhost:3000", "https://niche-e-commerce-platform-for-handm.vercel.app"], // your frontend origins
  credentials: true
}));

// ✅ Session middleware (needed for Passport)
app.use(session({
  secret: process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex'),
  resave: false,
  saveUninitialized: false, // safer default
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true for HTTPS in production
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true
  }
}));

// ✅ Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// ✅ Passport serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const User = require('./models/User');
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// ✅ Middleware
app.use(express.json());

// ✅ Health check route
app.get('/', (req, res) => res.send('✅ Backend is running!'));

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/otp', emailOtpRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/email', emailRoutes);

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
