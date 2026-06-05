const User = require('../models/User');
const jwt = require('jsonwebtoken');

// ─── HELPER: GENERATE & ATTACH JWT COOKIE ─────────────────────────────────────
// Centralised so both signup and login use identical cookie settings
const sendTokenCookie = (res, userId) => {
    const token = jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    res.cookie('folio_token', token, {
        httpOnly: true,   // JS cannot read this cookie — XSS safe
        secure: false,    // Set to TRUE in production (requires HTTPS)
        sameSite: 'Lax',  // Protects against CSRF
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    });
};

// ─── @route   POST /api/auth/signup ───────────────────────────────────────────
// @desc    Register a new user
// @access  Public
const signup = async (req, res) => {
    const { name, email, password } = req.body;

    // 1. Basic field validation
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // 2. Check if email is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'An account with this email already exists' });
        }

        // 3. Create user — password hashing happens automatically via pre-save hook
        const newUser = await User.create({ name, email, password });

        // 4. Issue JWT as httpOnly cookie
        sendTokenCookie(res, newUser._id);

        // 5. Send back safe user data (never send the password hash)
        res.status(201).json({
            success: true,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error('Signup error:', error.message);
        res.status(500).json({ message: 'Server error during signup' });
    }
};

// ─── @route   POST /api/auth/login ────────────────────────────────────────────
// @desc    Authenticate user and issue token
// @access  Public
const login = async (req, res) => {
    const { email, password } = req.body;

    // 1. Basic field validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        // 2. Find user — explicitly select password (excluded by default)
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // 3. Compare entered password against stored hash
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // 4. Issue JWT as httpOnly cookie
        sendTokenCookie(res, user._id);

        // 5. Send back safe user data
        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// ─── @route   POST /api/auth/logout ───────────────────────────────────────────
// @desc    Clear the auth cookie
// @access  Private
const logout = async (req, res) => {
    res.cookie('folio_token', '', {
        httpOnly: true,
        expires: new Date(0) // Immediately expire the cookie
    });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// ─── @route   GET /api/auth/me ─────────────────────────────────────────────────
// @desc    Get current logged-in user (used to restore session on page load)
// @access  Private
const getMe = async (req, res) => {
    try {
        // req.user is attached by the protect middleware (built next)
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('GetMe error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { signup, login, logout, getMe };