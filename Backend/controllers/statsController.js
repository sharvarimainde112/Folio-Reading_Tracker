const Book = require('../models/Book');

// ─── @route   GET /api/stats ───────────────────────────────────────────────────
// @desc    Get reading statistics for the logged-in user
// @access  Private
const getStats = async (req, res) => {
    try {
        const userId  = req.user.id;
        const allBooks = await Book.find({ user: userId });

        // ── SHELF COUNTS ──────────────────────────────────────────────────────
        const totalBooks         = allBooks.length;
        const wantToRead         = allBooks.filter(b => b.status === 'want-to-read').length;
        const currentlyReading   = allBooks.filter(b => b.status === 'reading').length;
        const completed          = allBooks.filter(b => b.status === 'completed').length;

        // ── MONTHLY DATA ──────────────────────────────────────────────────────
        const monthlyData = generateMonthlyChartData(allBooks);

        // ── STREAK ────────────────────────────────────────────────────────────
        const streak = calculateReadingStreak(allBooks);

        // ── AVERAGE RATING (only rated books) ─────────────────────────────────
        const ratedBooks    = allBooks.filter(b => b.status === 'completed' && b.rating > 0);
        const averageRating = ratedBooks.length > 0
            ? (ratedBooks.reduce((sum, b) => sum + b.rating, 0) / ratedBooks.length).toFixed(1)
            : 0;

        // ── BOOKS THIS MONTH ──────────────────────────────────────────────────
        const now         = new Date();
        const thisMonth   = allBooks.filter(b => {
            if (b.status !== 'completed') return false;
            const d = new Date(b.updatedAt);
            return d.getMonth() === now.getMonth() && 
                   d.getFullYear() === now.getFullYear();
        }).length;

        res.status(200).json({
            success: true,
            stats: {
                totalBooks,
                wantToRead,
                currentlyReading,
                completed,
                thisMonth,        // ← added separate thisMonth count
                averageRating,
                streak,
                monthlyData
            }
        });

    } catch (error) {
        console.error('getStats error:', error.message);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
};
// ─── HELPER: MONTHLY CHART DATA ───────────────────────────────────────────────
// Builds the 6-month array your home page chart expects:
// [{ monthLabel: "J", bookCount: 2, monthIndex: 0 }, ...]
function generateMonthlyChartData(books) {
    const today       = new Date();
    const monthLabels = ["J","F","M","A","M","J","J","A","S","O","N","D"];
    const chartData   = [];

    for (let i = 5; i >= 0; i--) {
        const targetDate  = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const targetMonth = targetDate.getMonth();
        const targetYear  = targetDate.getFullYear();

        // Count ALL books with completed status updated in this month
        const bookCount = books.filter(book => {
            if (book.status !== 'completed') return false;
            const d = new Date(book.updatedAt);
            return (
                d.getMonth()    === targetMonth &&
                d.getFullYear() === targetYear
            );
        }).length;

        chartData.push({
            monthLabel: monthLabels[targetMonth],
            bookCount,
            monthIndex: targetMonth
        });
    }

    return chartData;
}

// ─── HELPER: READING STREAK ───────────────────────────────────────────────────
// Counts consecutive days the user has completed at least one book
// Simple version: counts distinct days with completed books in last 30 days
function calculateReadingStreak(books) {
    const completedBooks = books.filter(b => b.status === 'completed');
    if (completedBooks.length === 0) return 0;

    // Get unique dates when books were completed
    const completionDates = completedBooks.map(b => {
        const d = new Date(b.updatedAt);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    });

    const uniqueDates = [...new Set(completionDates)].sort();

    // Count streak from today backwards
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
        const dateKey = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;

        if (uniqueDates.includes(dateKey)) {
            streak++;
        } else if (i > 0) {
            break; // Streak broken
        }
    }

    return streak;
}

module.exports = { getStats };