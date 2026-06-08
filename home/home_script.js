// ─── DAILY QUOTE ──────────────────────────────────────────────────────────────
const READING_QUOTES = [
    { text: "A reader lives a thousand lives before he dies. The man who never reads lives only one.", author: "George R.R. Martin" },
    { text: "Not all those who wander are lost.", author: "J.R.R. Tolkien" },
    { text: "The reading of all good books is like a conversation with the finest minds of past centuries.", author: "René Descartes" },
    { text: "One must always be careful of books, and what is inside them, for words have the power to change us.", author: "Cassandra Clare" },
    { text: "It is what you read when you don't have to that determines what you will be when you can't help it.", author: "Oscar Wilde" },
    { text: "There is no friend as loyal as a book.", author: "Ernest Hemingway" },
    { text: "Books are a uniquely portable magic.", author: "Stephen King" },
    { text: "In the beginning was the Word. And it was good.", author: "Ursula K. Le Guin" },
    { text: "I have always imagined that Paradise will be a kind of library.", author: "Jorge Luis Borges" },
    { text: "Reading is an exercise in empathy; an exercise in walking in someone else's shoes for a while.", author: "Malorie Blackman" },
    { text: "The more that you read, the more things you will know.", author: "Dr. Seuss" },
    { text: "A book is a dream that you hold in your hands.", author: "Neil Gaiman" },
    { text: "Until I feared I would lose it, I never loved to read. One does not love breathing.", author: "Harper Lee" },
    { text: "Think before you speak. Read before you think.", author: "Fran Lebowitz" },
    { text: "Sleep is good, he said, and books are better.", author: "George R.R. Martin" },
    { text: "The world belongs to those who read.", author: "Rick Holland" },
    { text: "Reading is to the mind what exercise is to the body.", author: "Joseph Addison" },
    { text: "Once you learn to read, you will be forever free.", author: "Frederick Douglass" },
    { text: "A book is a gift you can open again and again.", author: "Garrison Keillor" },
    { text: "We read to know we are not alone.", author: "C.S. Lewis" },
    { text: "The only thing you absolutely have to know is the location of the library.", author: "Albert Einstein" },
    { text: "Today a reader, tomorrow a leader.", author: "Margaret Fuller" },
    { text: "Books are the mirrors of the soul.", author: "Virginia Woolf" },
    { text: "A great book should leave you with many experiences, and slightly exhausted at the end.", author: "William Styron" },
    { text: "Reading gives us someplace to go when we have to stay where we are.", author: "Mason Cooley" },
    { text: "You can never get a cup of tea large enough or a book long enough to suit me.", author: "C.S. Lewis" },
    { text: "Classic — a book which people praise and don't read.", author: "Mark Twain" },
    { text: "If you only read the books that everyone else is reading, you can only think what everyone else is thinking.", author: "Haruki Murakami" },
    { text: "A book must be the axe for the frozen sea within us.", author: "Franz Kafka" },
    { text: "There is no such thing as a child who hates to read; there are only children who have not found the right book.", author: "Frank Serafini" }
];

function loadDailyQuote() {
    const now         = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const dayOfYear   = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24));
    const quoteIndex  = dayOfYear % READING_QUOTES.length;
    const quote       = READING_QUOTES[quoteIndex];

    const textEl   = document.getElementById('dailyQuoteText');
    const authorEl = document.getElementById('dailyQuoteAuthor');

    if (textEl)   textEl.innerText   = `"${quote.text}"`;
    if (authorEl) authorEl.innerText = `— ${quote.author}`;
}

// ─── READING GOAL ─────────────────────────────────────────────────────────────
function initializeReadingGoal(completedCount) {
    const userId    = localStorage.getItem('folio_userId') || 'default';
    const goalKey   = `folio_reading_goal_${userId}`;
    const savedGoal = localStorage.getItem(goalKey);
    const setupEl    = document.getElementById('goalSetup');
    const progressEl = document.getElementById('goalProgress');

    if (savedGoal) {
        setupEl.style.display    = 'none';
        progressEl.style.display = 'block';
        showGoalProgress(parseInt(savedGoal), completedCount);
    } else {
        setupEl.style.display    = 'block';
        progressEl.style.display = 'none';
    }

    // ── SET GOAL ──────────────────────────────────────────────────────────────
    document.getElementById('goalSaveBtn').addEventListener('click', () => {
        const val = parseInt(document.getElementById('goalInput').value);
        if (!val || val < 1) { alert('Please enter a valid goal.'); return; }
        localStorage.setItem(goalKey, val);
        setupEl.style.display    = 'none';
        progressEl.style.display = 'block';
        showGoalProgress(val, completedCount);
    });

    // ── EDIT BUTTON — show edit row ───────────────────────────────────────────
    document.getElementById('goalEditBtn').addEventListener('click', () => {
        const editRow = document.getElementById('goalEditRow');
        editRow.style.display = 'flex';
        document.getElementById('goalUpdateInput').value = 
            localStorage.getItem(goalKey) || '';
        document.getElementById('goalUpdateInput').focus();
    });

    // ── UPDATE GOAL ───────────────────────────────────────────────────────────
    document.getElementById('goalUpdateBtn').addEventListener('click', () => {
        const val = parseInt(document.getElementById('goalUpdateInput').value);
        if (!val || val < 1) { alert('Please enter a valid goal.'); return; }
        localStorage.setItem(goalKey, val);
        document.getElementById('goalEditRow').style.display = 'none';
        document.getElementById('goalEditRow').style.display = 'none';
        showGoalProgress(val, completedCount);
    });

    // ── CANCEL EDIT ───────────────────────────────────────────────────────────
    document.getElementById('goalCancelBtn').addEventListener('click', () => {
        document.getElementById('goalEditRow').style.display = 'none';
    });
}

function showGoalProgress(goal, completed) {
    const percent = Math.min(100, Math.round((completed / goal) * 100));

    document.getElementById('goalBarFill').style.width = `${percent}%`;
    document.getElementById('goalCount').innerText     = `${completed} of ${goal} books`;
    document.getElementById('goalPercent').innerText   = `${percent}%`;

    // Dynamic motivation message
    const motivationEl = document.getElementById('goalMotivation');
    if (motivationEl) {
        if (percent >= 100)      motivationEl.innerText = '🎉 Goal complete! Amazing!';
        else if (percent >= 75)  motivationEl.innerText = '🔥 Almost there, keep going!';
        else if (percent >= 50)  motivationEl.innerText = '💪 Halfway through — great pace!';
        else if (percent >= 25)  motivationEl.innerText = '📖 Good start, keep reading!';
        else                     motivationEl.innerText = '✨ Every page counts!';
    }
}
document.addEventListener("DOMContentLoaded", async () => {

    // ── GREETING ──────────────────────────────────────────────────────────────
    const rawName    = localStorage.getItem('folio_user') || "Reader";
    const activeUser = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    const greetingEl = document.getElementById('greetingText');
    const profileEl  = document.getElementById('profileName');

    if (greetingEl) greetingEl.innerText = `Good ${getTimeOfDay()}, ${activeUser}! ✨`;
    if (profileEl)  profileEl.innerText  = activeUser;

    updateSidebarUserInfo();

    // ── LOAD STATS ────────────────────────────────────────────────────────────
    // initializeReadingGoal is called INSIDE loadDashboardStats
    await loadDashboardStats();

    // ── SEARCH ────────────────────────────────────────────────────────────────
    initializeSearchDropdown();

    // ── DAILY QUOTE ───────────────────────────────────────────────────────────
    loadDailyQuote();
});

// ─── TIME OF DAY ──────────────────────────────────────────────────────────────
function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
}

// ─── LOAD DASHBOARD STATS ────────────────────────────────────────────────────
async function loadDashboardStats() {
    try {
        const response = await apiFetch('/stats');
        if (!response) return;

        const data = await response.json();
        if (!data.success) return;

        const stats = data.stats;

        // ── STAT PILLS ────────────────────────────────────────────────────────
        setElementText('totalBooksCount',       stats.completed);
        setElementText('streakCount',           stats.streak);
        setElementText('currentlyReadingCount', stats.thisMonth);
        setElementText('averageRating',         stats.averageRating > 0 ? `${stats.averageRating} ★` : '— ★');

       

        // ── SHELVES PREVIEW ───────────────────────────────────────────
        const shelvesCountEl = document.querySelector('.counter-sub');
        if (shelvesCountEl) {
            shelvesCountEl.innerText = `${stats.wantToRead} books cataloged`;
        }

        // ── SHELVES PREVIEW ───────────────────────────────────────────
        
        setElementText('wantToReadCount',    `${stats.wantToRead} books`);
        setElementText('homeReadingCount',   stats.currentlyReading);
        setElementText('homeCompletedCount', stats.completed);
        
        // ── CHART ─────────────────────────────────────────────────────────────
        initializeMonthlyReadingChart(stats.monthlyData);


// ── CURRENTLY READING ─────────────────────────────────────────────────
        await loadCurrentlyReading();

        // ── READING GOAL ──────────────────────────────────────────────────────
        initializeReadingGoal(stats.completed);

       

    } catch (error) {
        console.error('Folio dashboard error:', error);
    }
    
}

// ─── LOAD CURRENTLY READING ───────────────────────────────────────────────────
async function loadCurrentlyReading() {
    try {
        const response = await apiFetch('/shelves');
        if (!response) return;

        const data = await response.json();
        if (!data.success) return;

        const readingBooks = data.shelves['reading'] || [];

        if (readingBooks.length === 0) {
            setElementText('currentBookTitleLarge', 'No book in progress');
            setElementText('currentBookAuthorLarge', 'Add a book to Currently Reading');
            setElementText('currentBookPageLabel', '—');
            setElementText('currentBookPercent', '0%');
            document.getElementById('currentBookProgressBar').style.width = '0%';
            return;
        }

        // Show the first currently reading book
        const book = readingBooks[0];

        // Cover
        const coverEl = document.getElementById('currentBookCover');
        if (coverEl && book.thumbnail) {
            coverEl.style.backgroundImage  = `url(${book.thumbnail})`;
            coverEl.style.backgroundSize   = 'cover';
            coverEl.style.backgroundPosition = 'center';
            coverEl.innerHTML = '';
        } else {
            setElementText('currentBookTitle',  book.title);
            setElementText('currentBookAuthor', book.author);
        }

        // Details
        setElementText('currentBookTitleLarge',  book.title);
        setElementText('currentBookAuthorLarge', `by ${book.author}`);
        setElementText('currentBookPercent',     `${book.progress}%`);

        // Page label
        if (book.totalPages > 0) {
            const currentPage = Math.round((book.progress / 100) * book.totalPages);
            setElementText('currentBookPageLabel', `Page ${currentPage} of ${book.totalPages}`);
        } else {
            setElementText('currentBookPageLabel', `${book.progress}% complete`);
        }

        // Progress bar
        const barEl = document.getElementById('currentBookProgressBar');
        if (barEl) barEl.style.width = `${book.progress}%`;

    } catch (error) {
        console.error('Currently reading error:', error);
    }
}

// ─── SAFE TEXT SETTER ─────────────────────────────────────────────────────────
function setElementText(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
}

// ─── MONTHLY CHART ────────────────────────────────────────────────────────────
function initializeMonthlyReadingChart(monthlyData) {
    const chartFlexBox = document.querySelector(".bar-chart-flex");
    if (!chartFlexBox) return;

    const bars         = chartFlexBox.querySelectorAll(".chart-bar-wrapper");
    if (bars.length === 0) return;

    const dbData       = monthlyData || [];
    const peak         = Math.max(...dbData.map(d => d.bookCount), 1);
    const currentMonth = new Date().getMonth();

    bars.forEach((wrapper, index) => {
        const record = dbData[index];
        if (!record) return;

        const bar = wrapper.querySelector(".chart-bar");
        if (!bar) return;

         if (record.bookCount > 0) {
         const heightPct = Math.max(20, (record.bookCount / peak) * 100);
         bar.style.height    = `${heightPct}px`;
         bar.style.minHeight = `${heightPct}px`;
    } else {
        bar.style.height    = '0px';
        bar.style.minHeight = '0px';
   }

        const label = record.bookCount === 1 ? "Book" : "Books";
        bar.setAttribute("data-tooltip", `${record.bookCount} ${label}`);

        if (record.monthIndex === currentMonth) {
            bar.classList.add("active");
        } else {
            bar.classList.remove("active");
        }

        const span = wrapper.querySelector("span");
        if (span) span.textContent = record.monthLabel;
    });
}

// ─── SEARCH DROPDOWN ──────────────────────────────────────────────────────────
function initializeSearchDropdown() {
    const searchInput    = document.getElementById('globalSearchInput');
    const searchDropdown = document.getElementById('searchDropdown');
    const resultsWrapper = document.getElementById('searchResultsWrapper');
    let debounceTimer;

    if (!searchInput || !searchDropdown || !resultsWrapper) return;

    searchInput.addEventListener('input', async (e) => {
        clearTimeout(debounceTimer);
        const query = e.target.value.trim();

        if (!query) {
            searchDropdown.classList.remove('active');
            return;
        }

        debounceTimer = setTimeout(async () => {
            try {
                const response = await apiFetch(
                    `/books/search?q=${encodeURIComponent(query)}`
                );
                if (!response) return;

                const data    = await response.json();
                const matches = data.books || [];

                resultsWrapper.innerHTML = matches.length > 0
                    ? matches.map(b => `
                        <div class="search-row-item"
                             onclick="window.location.href='../Discover/index.html'">
                            <span class="title">${b.title}</span>
                            <span class="author">by ${b.author}</span>
                        </div>
                    `).join('')
                    : `<div class="search-row-item" 
                            style="color:#70665E; cursor:default;">
                            No matches found
                       </div>`;

                searchDropdown.classList.add('active');

            } catch (error) {
                console.error('Search error:', error);
            }
        }, 300);
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            searchDropdown.classList.remove('active');
        }
    });
}
