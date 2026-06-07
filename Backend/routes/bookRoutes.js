const express = require('express');
const router  = express.Router();
const { searchBooks, getFeaturedBooks } = require('../controllers/bookController');
const { protect } = require('../middleware/authMiddleware');

// All book routes are private
router.use(protect);

router.get('/search',   searchBooks);     // GET /api/books/search?q=harry+potter
router.get('/featured', getFeaturedBooks); // GET /api/books/featured

module.exports = router;