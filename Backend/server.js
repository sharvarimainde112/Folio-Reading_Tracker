const path   = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') }); // ← always finds Backend/.env

const express      = require('express');
const cors         = require('cors');
const cookieParser = require('cookie-parser');
const connectDB    = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(cors({
    origin:      process.env.CLIENT_ORIGIN,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// ─── ROUTES ──────────────────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/authRoutes'));
app.use('/api/shelves',  require('./routes/shelfRoutes'));
app.use('/api/stats',    require('./routes/statsRoutes'));
app.use('/api/books',    require('./routes/bookRoutes'));
app.use('/api/ai-coach', require('./routes/aiCoachRoutes'));

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({ message: '📚 Folio API is running' });
});

// ─── START SERVER ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Folio server running on http://localhost:${PORT}`);
});