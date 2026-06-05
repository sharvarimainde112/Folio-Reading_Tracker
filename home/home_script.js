// --- CENTRAL APPLICATION MEMORY MOCK STORAGE ---
const booksRepositoryMock = [
    { title: "The Midnight Library", author: "Matt Haig", genre: "Fiction" },
    { title: "The Silent Patient", author: "Alex Michaelides", genre: "Thriller" },
    { title: "A Court of Thorns and Roses", author: "Sarah J. Maas", genre: "Fantasy" },
    { title: "Normal People", author: "Sally Rooney", genre: "Contemporary" },
    { title: "Atomic Habits", author: "James Clear", genre: "Self-Help" },
    { title: "Tomorrow, and Tomorrow, and Tomorrow", author: "Gabrielle Zevin", genre: "Fiction" },
    { title: "Crying in H Mart", author: "Michelle Zauner", genre: "Memoir" },
    { title: "Babel", author: "R.F. Kuang", genre: "Fantasy" }
];

// --- CENTRAL RUNTIME INITIALIZATION LOOP ---
document.addEventListener("DOMContentLoaded", () => {

    // 1. Restore Greeting Username fallback
    const activeUser = localStorage.getItem('folio_user') || "Sharvari";
    const greetingTextElement = document.getElementById('greetingText');
    const profileNameElement = document.getElementById('profileName');
    
    if(greetingTextElement) greetingTextElement.innerText = `Good evening, ${activeUser}! ✨`;
    if(profileNameElement) profileNameElement.innerText = activeUser;

    // 2. Dropdown Logic Controller Fix
    const searchInput = document.getElementById('globalSearchInput');
    const searchDropdown = document.getElementById('searchDropdown');
    const resultsWrapper = document.getElementById('searchResultsWrapper');
    let debounceTimer;

    if (searchInput && searchDropdown && resultsWrapper) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            const query = e.target.value.trim().toLowerCase();

            // If empty search, close the box immediately
            if (!query) {
                searchDropdown.classList.remove('active');
                return;
            }

            debounceTimer = setTimeout(() => {
                const matches = booksRepositoryMock.filter(b => 
                    b.title.toLowerCase().includes(query) || b.author.toLowerCase().includes(query)
                );
                
                // Build dynamic rows inside the wrapper
                resultsWrapper.innerHTML = matches.map(b => `
                    <div class="search-row-item" onclick="window.location.href='../book-details/book-details.html'">
                        <span class="title">${b.title}</span>
                        <span class="author">by ${b.author}</span>
                    </div>
                `).join('');

                if (matches.length === 0) {
                    resultsWrapper.innerHTML = `<div class="search-row-item" style="color: #70665E; cursor: default;">No matches found</div>`;
                }
                
                // FORCE SHOW THE BOX NOW
                searchDropdown.classList.add('active');
            }, 150);
        });

        // Hide search if user clicks outside of search container components
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                searchDropdown.classList.remove('active');
            }
        });
    }

    // 3. THIS WAS MISSING: RUN THE CHART CONTROLLER!
    // This looks at your unmodified HTML bars and safely overwrites their values.
    initializeMonthlyReadingChart();
}); 

/**
 * STANDALONE CONTROLLER METHOD
 * Safely updates your existing HTML chart elements without modifying or destroying any layout boxes.
 */
async function initializeMonthlyReadingChart() {
    // 1. Target the bar-chart-flex container exactly as it's written in your static HTML
    const chartFlexBox = document.querySelector(".bar-chart-flex");
    if (!chartFlexBox) return;

    // 2. Fetch all existing wrappers already rendered inside your static HTML page
    const visualBarWrappers = chartFlexBox.querySelectorAll(".chart-bar-wrapper");
    if (visualBarWrappers.length === 0) return;

    try {
        // Mocking your database payload data arrays matching your 6 months
        const dbData = [
            { monthLabel: "J", bookCount: 2, monthIndex: 0 }, // January
            { monthLabel: "F", bookCount: 4, monthIndex: 1 }, // February
            { monthLabel: "M", bookCount: 1, monthIndex: 2 }, // March
            { monthLabel: "A", bookCount: 5, monthIndex: 3 }, // April
            { monthLabel: "M", bookCount: 3, monthIndex: 4 }, // May
            { monthLabel: "J", bookCount: 6, monthIndex: 5 }  // June
        ];

        // Identify real-world current month index to manage active states dynamically
        const currentCalendarMonthIndex = new Date().getMonth(); 

        // Find the highest book count to normalize heights gracefully within bounds
        const countArray = dbData.map(item => item.bookCount);
        const peakReadingCount = Math.max(...countArray, 1);

        // 3. Instead of deleting items, update your static DOM nodes in place
        visualBarWrappers.forEach((wrapper, index) => {
            // Check if we have a database record matching this column index
            const record = dbData[index];
            if (!record) return;

            // Target the internal chart-bar child div inside this specific wrapper row
            const barElement = wrapper.querySelector(".chart-bar");
            if (!barElement) return;

            // Calculate the relative mathematical height percentage dynamically
            const relativeHeightPercentage = (record.bookCount / peakReadingCount) * 100;

            // Update the height style directly without touching any core HTML code layout
            barElement.style.height = `${relativeHeightPercentage}%`;

            // Append tooltip attribute definitions directly for hover interactions
            const pluralizedLabel = record.bookCount === 1 ? "Book" : "Books";
            barElement.setAttribute("data-tooltip", `${record.bookCount} ${pluralizedLabel}`);

            // Manage your exact "active" color class state matching the real calendar matrix
            if (record.monthIndex === currentCalendarMonthIndex) {
                barElement.classList.add("active");
            } else {
                barElement.classList.remove("active");
            }
            
            // Optional alignment verification: updates text label underneath if needed
            const labelSpan = wrapper.querySelector("span");
            if (labelSpan) {
                labelSpan.textContent = record.monthLabel;
            }
        });

    } catch (error) {
        console.error("Folio Analytics System Error:", error);
    }
}