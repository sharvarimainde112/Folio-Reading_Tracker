const Book = require('../models/Book');

// ─── @route   GET /api/shelves ─────────────────────────────────────────────────
// @desc    Get all books for the logged-in user, grouped by shelf status
// @access  Private
const getShelves = async (req, res) => {
    try {
        const allBooks = await Book.find({ user: req.user.id }).sort({ createdAt: -1 });

        // Group into the three shelf zones your frontend expects
        const shelves = {
            'want-to-read': allBooks.filter(b => b.status === 'want-to-read'),
            'reading':       allBooks.filter(b => b.status === 'reading'),
            'completed':     allBooks.filter(b => b.status === 'completed')
        };

        res.status(200).json({ success: true, shelves });

    } catch (error) {
        console.error('getShelves error:', error.message);
        res.status(500).json({ message: 'Server error fetching shelves' });
    }
};

// ─── @route   POST /api/shelves ────────────────────────────────────────────────
// @desc    Add a new book to a shelf
// @access  Private
const addBook = async (req, res) => {
    const { title, author, description, coverColor, status, googleBooksId, totalPages, thumbnail } = req.body;

    if (!title || !author) {
        return res.status(400).json({ message: 'Title and author are required' });
    }

    try {
        // ── DUPLICATE CHECK ───────────────────────────────────────────────────
       const existingBook = googleBooksId 
    ? await Book.findOne({ user: req.user.id, googleBooksId: googleBooksId })
    : await Book.findOne({ user: req.user.id, title: title, author: author });

        if (existingBook) {
            return res.status(409).json({
                message: `This book is already on your ${existingBook.status} shelf`,
                existingStatus: existingBook.status,
                bookId: existingBook._id
            });
        }

        const newBook = await Book.create({
            user:         req.user.id,
            title,
            author,
            description:  description  || '',
            coverColor:   coverColor   || '#607E65',
            thumbnail:     thumbnail     || '', 
            status:       status       || 'want-to-read',
            googleBooksId: googleBooksId || '',
            totalPages:    totalPages    || 0,
            progress:     status === 'completed' ? 100 : 0,
            rating:       0
        });

        res.status(201).json({ success: true, book: newBook });

    } catch (error) {
        console.error('addBook error:', error.message);
        res.status(500).json({ message: 'Server error adding book' });
    }
};

// ─── @route   PUT /api/shelves/:id ────────────────────────────────────────────
// @desc    Update a book's status, progress, or rating
// @access  Private
const updateBook = async (req, res) => {
    try {
        const book = await Book.findOne({ _id: req.params.id, user: req.user.id });

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        const { status, progress, rating, totalPages, currentPage, finished } = req.body;

        if (status     !== undefined) book.status     = status;
        if (rating     !== undefined) book.rating     = rating;
        if (totalPages !== undefined) book.totalPages = totalPages;

        // ── FINISHED BUTTON ───────────────────────────────────────────────────
        if (finished === true) {
            book.status   = 'completed';
            book.progress = 100;
            if (!book.rating) book.rating = 0;
            const updatedBook = await book.save();
            return res.status(200).json({ 
                success: true, 
                book: updatedBook,
                autoCompleted: true 
            });
        }

        // ── PAGE NUMBER PROGRESS ──────────────────────────────────────────────
        if (currentPage !== undefined && book.totalPages > 0) {
            book.progress = Math.min(100, Math.round((currentPage / book.totalPages) * 100));
        } else if (progress !== undefined) {
            book.progress = progress;
        }

        // ── AUTO COMPLETE AT 100% ─────────────────────────────────────────────
        if (book.progress >= 100) {
            book.progress = 100;
            book.status   = 'completed';
        }

        if (status === 'completed') {
            book.progress = 100;
        }

        if (status === 'want-to-read') {
            book.progress = 0;
        }

        const updatedBook = await book.save();
        res.status(200).json({ 
            success: true, 
            book: updatedBook,
            autoCompleted: book.progress === 100 
        });

    } catch (error) {
        console.error('updateBook error:', error.message);
        res.status(500).json({ message: 'Server error updating book' });
    }
};
// ─── @route   DELETE /api/shelves/:id ─────────────────────────────────────────
// @desc    Remove a book from shelves entirely
// @access  Private
const deleteBook = async (req, res) => {
    try {
        const book = await Book.findOne({ _id: req.params.id, user: req.user.id });

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        await book.deleteOne();
        res.status(200).json({ success: true, message: 'Book removed from shelves' });

    } catch (error) {
        console.error('deleteBook error:', error.message);
        res.status(500).json({ message: 'Server error deleting book' });
    }
};

module.exports = { getShelves, addBook, updateBook, deleteBook };