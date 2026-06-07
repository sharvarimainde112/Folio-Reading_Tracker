const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema(
    {
        // Which user this book belongs to
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        // Core book data
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true
        },
        author: {
            type: String,
            required: [true, 'Author is required'],
            trim: true
        },
        description: {
            type: String,
            default: ''
        },
        // Matches your frontend: "#4A5B6E", "#607E65" etc.
        thumbnail: {
    type: String,
    default: ''
},
        // Matches your three shelf zones exactly
        status: {
            type: String,
            enum: ['want-to-read', 'reading', 'completed'],
            default: 'want-to-read'
        },
        // 0–100 percentage
        progress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        // Total pages — needed for page number progress tracking
totalPages: {
    type: Number,
    default: 0
},
        // 0–5 stars
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        // Google Books ID — for when we wire Discover later
        googleBooksId: {
            type: String,
            default: ''
        }
    },
    {
        timestamps: true // createdAt used for reading streak calculations
    }
);

module.exports = mongoose.model('Book', BookSchema);