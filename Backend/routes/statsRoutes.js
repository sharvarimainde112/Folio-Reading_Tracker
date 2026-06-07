const express = require('express');
const router  = express.Router();
const { getStats } = require('../controllers/statsController');
const { protect } = require('../middleware/authMiddleware');

// Private — user must be logged in
router.get('/', protect, getStats); // GET /api/stats

module.exports = router;