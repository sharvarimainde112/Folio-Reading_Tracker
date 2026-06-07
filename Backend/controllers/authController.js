const User = require('../models/User');
const jwt  = require('jsonwebtoken');

// ─── HELPER: GENERATE JWT TOKEN ───────────────────────────────────────────────
const sendTokenCookie = (res, userId) => {
    const token = jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
    return token;
};

// ─── SIGNUP ───────────────────────────────────────────────────────────────────
const signup = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'An account with this email already exists' });
        }

        const newUser = await User.create({ name, email, password });
        const token   = sendTokenCookie(res, newUser._id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id:    newUser._id,
                name:  newUser.name,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error('Signup error:', error.message);
        res.status(500).json({ message: 'Server error during signup' });
    }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = sendTokenCookie(res, user._id);

        res.status(200).json({
            success: true,
            token,
            user: {
                id:    user._id,
                name:  user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
const logout = async (req, res) => {
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// ─── GET ME ───────────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            success: true,
            user: {
                id:    user._id,
                name:  user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('GetMe error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { signup, login, logout, getMe };