/**
 * --- CENTRAL COLLECTION BOOK REPOSITORY DATABASE SOURCE MOCK DATA ---
 * Featuring unique custom soft pastel canvas background hex variants
 */
const discoverRepositoryDataset = [
    {
        id: "disc-01",
        title: "The Midnight Library",
        author: "Matt Haig",
        description: "Between life and death there is a library containing infinite books of paths you could have traveled. A beautiful exploration of regrets and what truly makes life worth living.",
        bgColor: "#C19A6B" // Warm leather bookcloth brown
    },
    {
        id: "disc-02",
        title: "The Silent Patient",
        author: "Alex Michaelides",
        description: "Alicia Berenson’s life is seemingly perfect. Then one evening, she shoots her husband five times in the face and never speaks another word, sparking an intense psychological investigation.",
        bgColor: "#D9836C" // Core dynamic Terracotta
    },
    {
        id: "disc-03",
        title: "Babel",
        author: "R.F. Kuang",
        description: "An extraordinary historical fantasy exploring the power of language, the brutality of empire, and the magic of translation inside Oxford University's premier silver-working institute.",
        bgColor: "#607E65" // Signature Sage Green
    },
    {
        id: "disc-04",
        title: "Atomic Habits",
        author: "James Clear",
        description: "A profoundly practical framework for reshaping your daily patterns. Learn how tiny 1% transformations can stack up to compound into monumental life-altering achievements.",
        bgColor: "#7A9FB0" // Soft Powder Air Blue
    },
    {
        id: "disc-05",
        title: "Tomorrow, and Tomorrow, and Tomorrow",
        author: "Gabrielle Zevin",
        description: "Two brilliant childhood friends aestheticize their worlds by partnering up to launch a legendary video game studio, exploring love, loss, and creative companionship over thirty years.",
        bgColor: "#D3C5E5" // Premium Lavender Iris tint
    },
    {
        id: "disc-06",
        title: "Normal People",
        author: "Sally Rooney",
        description: "An intimate chronicle tracking the complex social and romantic intricacies between Connell and Marianne as they navigate class lines from high school into university years.",
        bgColor: "#E2C391" // Muted Gold Wheat canvas
    },
    {
        id: "disc-07",
        title: "Crying in H Mart",
        author: "Michelle Zauner",
        description: "A powerful, poignant memoir detailing the experiences of growing up Korean-American, finding voice and identity, and navigating profound grief through the beautiful lens of food.",
        bgColor: "#C97A93" // Distressed Coral Rose dust
    },
    {
        id: "disc-08",
        title: "The Starless Sea",
        author: "Erin Morgenstern",
        description: "A subterranean labyrinth of stories hidden deep beneath the surface of the earth. Pirates, acolytes, and keys fill this enchanting, lyrical love letter to the art of storytelling.",
        bgColor: "#4A5B6E" // Vintage Slate Deep Indigo
    }
];

document.addEventListener("DOMContentLoaded", () => {
    const gridContainer = document.getElementById("discoverGridContainer");
    const searchInput = document.getElementById("discoverSearchInput");
    const resultsCountLabel = document.getElementById("resultsCountLabel");

    /**
     * Renders filtered list into the DOM with custom staggered loading timelines
     * @param {Array} booksListTarget List of books matching rendering parameters
     */
    function renderDiscoverCollectionGrid(booksListTarget) {
        // Clear old mounted inner blocks
        gridContainer.innerHTML = "";

        if (booksListTarget.length === 0) {
            gridContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 48px; color: var(--text-muted); font-weight: 500;">
                     ✨ No matching titles or authors found. Try another query.
                </div>
            `;
            resultsCountLabel.innerText = "Search Results (0)";
            return;
        }

        // Dynamically append collection cards
        booksListTarget.forEach((book, loopIndex) => {
            const cardItem = document.createElement("article");
            cardItem.className = "book-card";
            
            // Programmatically establish stagged entrance increments
            cardItem.style.animationDelay = `${loopIndex * 0.06}s`;
            cardItem.classList.add("card-entrance-animation");

            cardItem.innerHTML = `
                <div class="cover-display-frame" style="background-color: ${book.bgColor};">
                    <span class="cover-title-fallback">${book.title}</span>
                </div>
                <div class="card-details-info">
                    <h4 class="book-title-lbl">${book.title}</h4>
                    <span class="book-author-lbl">by ${book.author}</span>
                    <p class="book-desc-snippet">${book.description}</p>
                </div>
                <div class="card-action-bar">
                    <div class="shelf-dropdown-wrapper">
                        <button class="btn-add-shelf" data-target-id="${book.id}">
                            ➕ Add to Shelf
                        </button>
                        <div class="shelf-popover-menu" id="popover-${book.id}">
                            <button class="menu-action-option" data-status="Want to Read">Want to Read</button>
                            <button class="menu-action-option" data-status="Currently Reading">Currently Reading</button>
                            <button class="menu-action-option" data-status="Completed">Completed</button>
                        </div>
                    </div>
                    <a href="#" class="action-view-link">View Details →</a>
                </div>
            `;

            gridContainer.appendChild(cardItem);
        });

        // Update total dynamic indicators
        if (searchInput.value.trim() !== "") {
            resultsCountLabel.innerText = `Search Results (${booksListTarget.length})`;
        } else {
            resultsCountLabel.innerText = "Explore Collection";
        }

        initializeDropdownControllers();
    }

    /**
     * Attaches structural events to dynamic popup drawers safely
     */
    function initializeDropdownControllers() {
        const shelfActionButtons = document.querySelectorAll(".btn-add-shelf");

        shelfActionButtons.forEach(btn => {
            btn.addEventListener("click", (event) => {
                event.stopPropagation();
                const targetId = btn.getAttribute("data-target-id");
                const currentPopover = document.getElementById(`popover-${targetId}`);

                // Close all other instances
                document.querySelectorAll(".shelf-popover-menu").forEach(menu => {
                    if (menu !== currentPopover) menu.classList.remove("open");
                });

                // Toggle target active overlay layer drawer
                currentPopover.classList.toggle("open");
            });
        });

        // Mount internal nested operational option links handler logic rules
        const menuOptions = document.querySelectorAll(".menu-action-option");
        menuOptions.forEach(option => {
            option.addEventListener("click", (e) => {
                e.stopPropagation();
                const selectedStatus = option.getAttribute("data-status");
                const assignedParentMenu = option.closest(".shelf-popover-menu");
                const associatedTriggerBtn = assignedParentMenu.previousElementSibling;

                // Provide a visually responsive tactile success modifier indicator 
                associatedTriggerBtn.innerHTML = `✓ ${selectedStatus}`;
                associatedTriggerBtn.style.backgroundColor = "var(--sage-green)";
                
                // Retain tracking updates confirmation alert logs 
                console.log(`Folio Event Tracker: Book ID mapped to shelf action structural updates state: [${selectedStatus}]`);
                
                // Auto dismiss selection tray
                assignedParentMenu.classList.remove("open");
            });
        });
    }

    // Dismiss active operational menus globally if a background viewport canvas is clicked
    document.addEventListener("click", () => {
        document.querySelectorAll(".shelf-popover-menu").forEach(menu => menu.classList.remove("open"));
    });

    /**
     * Active real-time input filter monitoring event layout configuration pipeline
     */
    searchInput.addEventListener("input", (e) => {
        const structuralQuery = e.target.value.toLowerCase().trim();

        const filteredCollectionMatches = discoverRepositoryDataset.filter(bookItem => {
            return bookItem.title.toLowerCase().includes(structuralQuery) || 
                   bookItem.author.toLowerCase().includes(structuralQuery) ||
                   bookItem.description.toLowerCase().includes(structuralQuery);
        });

        // Process rendering layout mutations instantly
        renderDiscoverCollectionGrid(filteredCollectionMatches);
    });

    // Fire default pristine initialization view on standard document loads
    renderDiscoverCollectionGrid(discoverRepositoryDataset);
});