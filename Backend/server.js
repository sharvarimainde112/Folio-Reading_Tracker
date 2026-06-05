const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Load environment variables first, before anything else
dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────

// Allow your frontend origin to talk to this backend, with cookies
app.use(cors({
    origin: process.env.CLIENT_ORIGIN,  // e.g. http://127.0.0.1:5500
    credentials: true                    // Required for httpOnly cookies to work
}));

// Parse incoming JSON request bodies (req.body)
app.use(express.json());

// Parse cookies on incoming requests (needed for JWT httpOnly cookie auth)
app.use(cookieParser());

// ─── ROUTES ──────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
//
// app.use('/api/auth',     require('./routes/authRoutes'));
// app.use('/api/shelves',  require('./routes/shelfRoutes'));
// app.use('/api/stats',    require('./routes/statsRoutes'));
// app.use('/api/books',    require('./routes/bookRoutes'));
// app.use('/api/ai-coach', require('./routes/aiCoachRoutes'));

// ─── HEALTH CHECK ────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({ message: '📚 Folio API is running' });
});

// ─── START SERVER ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Folio server running on http://localhost:${PORT}`);
});