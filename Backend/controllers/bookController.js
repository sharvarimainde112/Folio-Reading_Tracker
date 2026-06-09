const https = require('https');

const GOOGLE_BOOKS_BASE = 'https://www.googleapis.com/books/v1/volumes';

// ─── HELPER: FETCH FROM GOOGLE BOOKS ─────────────────────────────────────────
function fetchJSON(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(e); }
            });
        }).on('error', reject);
    });
}

// ─── FORMAT BOOK HELPER ───────────────────────────────────────────────────────
function formatBook(item) {
    const info = item.volumeInfo;
    return {
        id:            item.id,
        title:         info.title       || 'Unknown Title',
        author:        info.authors     ? info.authors.join(', ') : 'Unknown Author',
        description:   info.description || 'No description available.',
        thumbnail:     book.volumeInfo.imageLinks?.thumbnail?.replace('http://', 'https://'),
        totalPages:    info.pageCount   || 0,
        googleBooksId: item.id
    };
}

// ─── @route   GET /api/books/search?q=query ───────────────────────────────────
const searchBooks = async (req, res) => {
    const query = req.query.q;

    if (!query || query.trim() === '') {
        return res.status(400).json({ message: 'Search query is required' });
    }

    try {
        const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
        const url    = `${GOOGLE_BOOKS_BASE}?q=${encodeURIComponent(query)}&maxResults=12&key=${apiKey}`;
        const data   = await fetchJSON(url);

        if (!data.items || data.items.length === 0) {
            return res.status(200).json({ success: true, books: [] });
        }

        res.status(200).json({ success: true, books: data.items.map(formatBook) });

    } catch (error) {
        console.error('searchBooks error:', error.message);
        res.status(500).json({ message: 'Server error fetching books' });
    }
};

// ─── @route   GET /api/books/featured ─────────────────────────────────────────
const getFeaturedBooks = async (req, res) => {
    try {
        const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
        const url = `${GOOGLE_BOOKS_BASE}?q=subject:fiction&maxResults=12&orderBy=newest&key=${apiKey}`;
        const data   = await fetchJSON(url);

        if (!data.items || data.items.length === 0) {
            return res.status(200).json({ success: true, books: [] });
        }

        res.status(200).json({ success: true, books: data.items.map(formatBook) });

    } catch (error) {
        console.error('getFeaturedBooks error:', error.message);
        res.status(500).json({ message: 'Server error fetching featured books' });
    }
};

module.exports = { searchBooks, getFeaturedBooks };