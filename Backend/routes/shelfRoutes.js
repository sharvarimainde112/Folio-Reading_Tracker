const express = require('express');
const router = express.Router();
const { getShelves, addBook, updateBook, deleteBook } = require('../controllers/shelfController');
const { protect } = require('../middleware/authMiddleware');

// All shelf routes are private — user must be logged in
router.use(protect);

router.get('/',     getShelves);   // GET    /api/shelves
router.post('/',    addBook);      // POST   /api/shelves
router.put('/:id',  updateBook);   // PUT    /api/shelves/:bookId
router.delete('/:id', deleteBook); // DELETE /api/shelves/:bookId

module.exports = router;