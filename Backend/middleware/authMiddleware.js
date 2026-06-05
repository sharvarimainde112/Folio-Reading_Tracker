const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── PROTECT MIDDLEWARE ───────────────────────────────────────────────────────
// Attach this to any route that requires the user to be logged in.
// It reads the JWT from the httpOnly cookie, verifies it,
// and attaches the decoded user to req.user for the next handler.

const protect = async (req, res, next) => {
    const token = req.cookies.folio_token;

    if (!token) {
        return res.status(401).json({ message: 'Not authorised — please log in' });
    }

    try {
        // Verify token signature and expiry
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user to request (excluding password)
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ message: 'User no longer exists' });
        }

        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message);
        res.status(401).json({ message: 'Token invalid or expired — please log in again' });
    }
};

module.exports = { protect };