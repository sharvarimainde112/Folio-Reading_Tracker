/**
 * --- CENTRAL APPLICATION LIBRARY SHELVES METRICS DATABASE ---
 * Syncs seamlessly across dynamic Kanban layout view columns
 */
let shelfBooksCollection = [
    {
        id: "shelf-b01",
        title: "The Starless Sea",
        author: "Erin Morgenstern",
        status: "want-to-read",
        coverColor: "#4A5B6E",
        progress: 0,
        rating: 0
    },
    {
        id: "shelf-b02",
        title: "Dune",
        author: "Frank Herbert",
        status: "want-to-read",
        coverColor: "#C19A6B",
        progress: 0,
        rating: 0
    },
    {
        id: "shelf-b03",
        title: "Tomorrow, and Tomorrow, and Tomorrow",
        author: "Gabrielle Zevin",
        status: "reading",
        coverColor: "#D3C5E5",
        progress: 62, // Rendering metrics percentage value mapping
        rating: 0
    },
    {
        id: "shelf-b04",
        title: "Atomic Habits",
        author: "James Clear",
        status: "reading",
        coverColor: "#7A9FB0",
        progress: 35,
        rating: 0
    },
    {
        id: "shelf-b05",
        title: "The Midnight Library",
        author: "Matt Haig",
        status: "completed",
        coverColor: "#607E65",
        progress: 100,
        rating: 5 // Maps out 5 full yellow layout star nodes
    },
    {
        id: "shelf-b06",
        title: "The Silent Patient",
        author: "Alex Michaelides",
        status: "completed",
        coverColor: "#D9836C",
        progress: 100,
        rating: 4
    }
];

document.addEventListener("DOMContentLoaded", () => {
    executeStaggeredColumnEntranceAnimation();
    renderLibraryShelvesBoard();
});

/**
 * Fires high-end staggered CSS keyframe transitions over the columns
 */
function executeStaggeredColumnEntranceAnimation() {
    const activeColumns = document.querySelectorAll(".column-animate");
    activeColumns.forEach((column, loopIndex) => {
        // Precise stagger cadence timing delay increments
        column.style.animationDelay = `${loopIndex * 0.12}s`;
        column.classList.add("column-glide-up-trigger");
    });
}

/**
 * Sweeps the DOM and loops through dataset to inject matching code tokens
 */
function renderLibraryShelvesBoard() {
    // Structural target component mount handles
    const targetZones = {
        "want-to-read": document.getElementById("zone-want-to-read"),
        "reading": document.getElementById("zone-reading"),
        "completed": document.getElementById("zone-completed")
    };

    const counterBadges = {
        "want-to-read": document.getElementById("count-want-to-read"),
        "reading": document.getElementById("count-reading"),
        "completed": document.getElementById("count-completed")
    };

    // Clean tracking columns completely prior to mutations redraws
    Object.values(targetZones).forEach(zone => { if(zone) zone.innerHTML = ""; });

    // Track dynamic category counts values internally
    const runtimeCounters = { "want-to-read": 0, "reading": 0, "completed": 0 };

    // Process and sort loop nodes map allocations
    shelfBooksCollection.forEach(bookItem => {
        runtimeCounters[bookItem.status]++;
        
        const cardNode = document.createElement("article");
        cardNode.className = "shelf-book-card";
        cardNode.id = bookItem.id;

        // Custom internal logic helper string mapping parameters
        let operationalMetricMarkup = "";
        if (bookItem.status === "reading") {
            operationalMetricMarkup = `
                <div class="metric-row-container">
                    <div class="compact-progress-track">
                        <div class="compact-progress-fill" style="width: ${bookItem.progress}%;"></div>
                    </div>
                    <span class="progress-label">${bookItem.progress}% read</span>
                </div>
            `;
        } else if (bookItem.status === "completed") {
            const compiledStarElements = "★".repeat(bookItem.rating) + "☆".repeat(5 - bookItem.rating);
            operationalMetricMarkup = `
                <div class="metric-row-container">
                    <div class="star-rating-row">${compiledStarElements}</div>
                </div>
            `;
        }

        cardNode.innerHTML = `
            <div class="card-thumbnail-frame" style="background-color: ${bookItem.coverColor};">
                <span class="thumb-letter">${bookItem.title.charAt(0)}</span>
            </div>
            <div class="card-meta-block">
                <div class="text-group">
                    <h4 class="book-title" title="${bookItem.title}">${bookItem.title}</h4>
                    <p class="book-author">${bookItem.author}</p>
                </div>
                ${operationalMetricMarkup}
            </div>
            <div class="shelf-shift-container">
                <button class="btn-shift-trigger" aria-label="Move book to shelf">⋮</button>
                <div class="shift-dropdown-menu">
                    ${bookItem.status !== 'want-to-read' ? `<button class="dropdown-opt" data-target-status="want-to-read">📂 Want to Read</button>` : ''}
                    ${bookItem.status !== 'reading' ? `<button class="dropdown-opt" data-target-status="reading">📖 Reading</button>` : ''}
                    ${bookItem.status !== 'completed' ? `<button class="dropdown-opt" data-target-status="completed">✓ Completed</button>` : ''}
                </div>
            </div>
        `;

        // Mount newly instantiated block nodes to matching target containers
        if (targetZones[bookItem.status]) {
            targetZones[bookItem.status].appendChild(cardNode);
        }
    });

    // Mirror totals onto header badges dynamically
    Object.keys(counterBadges).forEach(statusKey => {
        if (counterBadges[statusKey]) {
            counterBadges[statusKey].innerText = runtimeCounters[statusKey];
        }
    });

    bindShelfManagementInteractionEvents();
}

/**
 * Structural logic events layer binding controllers
 */
function bindShelfManagementInteractionEvents() {
    const shiftActionTriggers = document.querySelectorAll(".btn-shift-trigger");

    shiftActionTriggers.forEach(btn => {
        btn.addEventListener("click", (event) => {
            event.stopPropagation();
            const matchingMenu = btn.nextElementSibling;

            // Close alternative instances running on alternative nodes
            document.querySelectorAll(".shift-dropdown-menu").forEach(menu => {
                if (menu !== matchingMenu) menu.classList.remove("open");
            });

            matchingMenu.classList.toggle("open");
        });
    });

    const managementSelectionOptions = document.querySelectorAll(".dropdown-opt");
    managementSelectionOptions.forEach(opt => {
        opt.addEventListener("click", (e) => {
            e.stopPropagation();
            
            const targetNewStatus = opt.getAttribute("data-target-status");
            const parentCardElement = opt.closest(".shelf-book-card");
            const targetBookId = parentCardElement.id;

            // Locate target book data reference object inside collection array
            const bookReference = shelfBooksCollection.find(b => b.id === targetBookId);
            
            if (bookReference) {
                // Mutate state status tokens mapping definitions
                bookReference.status = targetNewStatus;
                
                // Initialize metric parameter defaults on column resets
                if (targetNewStatus === "reading" && bookReference.progress === 0) {
                    bookReference.progress = 10; // Setup baseline reading progress starter metric
                } else if (targetNewStatus === "completed") {
                    bookReference.progress = 100;
                    if (bookReference.rating === 0) bookReference.rating = 5; // Default standard completion stars
                }

                console.log(`Folio Event Logger: Shifted '${bookReference.title}' status state to -> [${targetNewStatus}]`);
                
                // Redraw canvas state mutations with clean structural transitions
                renderLibraryShelvesBoard();
            }
        });
    });
}

// Global click monitoring framework dismisses open dropdown windows safely
document.addEventListener("click", () => {
    document.querySelectorAll(".shift-dropdown-menu").forEach(menu => menu.classList.remove("open"));
});