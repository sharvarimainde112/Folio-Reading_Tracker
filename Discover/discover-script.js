const coverColorPalette = [
    "#C19A6B", "#D9836C", "#607E65", "#7A9FB0",
    "#D3C5E5", "#E2C391", "#C97A93", "#4A5B6E"
];

document.addEventListener("DOMContentLoaded", () => {
    const gridContainer     = document.getElementById("discoverGridContainer");
    const searchInput       = document.getElementById("discoverSearchInput");
    const resultsCountLabel = document.getElementById("resultsCountLabel");
    let debounceTimer;

    // ── HELPERS ───────────────────────────────────────────────────────────────
    /**
     * Normalise a Google Books ID so edition variants, extra query params,
     * and trailing junk don't cause false-negative shelf lookups.
     */
    function cleanGoogleId(rawId) {
        if (!rawId) return '';
        return rawId.split('?')[0].split('&')[0].trim();
    }

    /**
     * Return the shelf status for a book already on the user's shelf,
     * or null if the book isn't shelved.
     * Tries googleBooksId first, falls back to title+author.
     */
    function getExistingStatus(book) {
        const id = cleanGoogleId(book.googleBooksId);
        if (id && window.existingShelfBooks?.has(id)) {
            return window.existingShelfBooks.get(id);
        }
        const titleKey = `${book.title}__${book.author}`.toLowerCase();
        return window.existingShelfBooksByTitle?.get(titleKey) || null;
    }

    // ── RENDER GRID ───────────────────────────────────────────────────────────
    function renderDiscoverCollectionGrid(books) {
        gridContainer.innerHTML = "";

        if (books.length === 0) {
            gridContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 48px; 
                            color: var(--text-muted); font-weight: 500;">
                    ✨ No matching titles found. Try another query.
                </div>`;
            resultsCountLabel.innerText = "Search Results (0)";
            return;
        }

        books.forEach((book, index) => {
            const cardItem = document.createElement("article");
            cardItem.className = "book-card card-entrance-animation";
            cardItem.style.animationDelay = `${index * 0.06}s`;

            const coverHTML = book.thumbnail
                ? `<img src="${book.thumbnail}" alt="${book.title}" 
                        style="width:100%; height:100%; object-fit:cover; border-radius:8px;"
                        onerror="this.parentElement.style.backgroundColor='${coverColorPalette[index % coverColorPalette.length]}'; this.remove();">`
                : `<span class="cover-title-fallback">${book.title}</span>`;

            const coverBg = book.thumbnail
                ? 'transparent'
                : coverColorPalette[index % coverColorPalette.length];

            const cleanBookId = cleanGoogleId(book.googleBooksId);

            // ── FIX: use getExistingStatus() instead of duplicated inline logic ──
            const existingStatus = getExistingStatus(book);
            console.log('Book:', book.googleBooksId, '→ cleanId:', cleanBookId, '→ status:', existingStatus);

            // ── FIX: btnLabel / btnBg are now actually injected into the HTML ──
            const btnLabel = existingStatus
                ? `✓ On ${existingStatus} shelf`
                : '➕ Add to Shelf';
            const btnBg = existingStatus
                ? 'background-color: #9B8E82;'
                : '';

            cardItem.innerHTML = `
                <div class="cover-display-frame" style="background-color: ${coverBg};">
                    ${coverHTML}
                </div>
                <div class="card-details-info">
                    <h4 class="book-title-lbl">${book.title}</h4>
                    <span class="book-author-lbl">by ${book.author}</span>
                    <p class="book-desc-snippet">${book.description.substring(0, 120)}...</p>
                </div>
                <div class="card-action-bar">
                    <div class="shelf-dropdown-wrapper">
                        <button class="btn-add-shelf"
                                style="${btnBg}"
                                data-book-id="${book.id}"
                                data-title="${book.title}"
                                data-author="${book.author}"
                                data-description="${book.description.substring(0, 200)}"
                                data-thumbnail="${book.thumbnail || ''}"
                                data-google-id="${cleanBookId}"
                                data-total-pages="${book.totalPages || 0}">
                            ${btnLabel}
                        </button>
                        <div class="shelf-popover-menu" id="popover-${book.id}">
                            <button class="menu-action-option" 
                                    data-status="want-to-read">Want to Read</button>
                            <button class="menu-action-option" 
                                    data-status="reading">Currently Reading</button>
                            <button class="menu-action-option" 
                                    data-status="completed">Completed</button>
                        </div>
                    </div>
                    <a href="#" class="action-view-link">View Details →</a>
                </div>
            `;

            gridContainer.appendChild(cardItem);
        });

        resultsCountLabel.innerText = searchInput.value.trim() !== ""
            ? `Search Results (${books.length})`
            : `Explore Collection (${books.length})`;

        initializeDropdownControllers();
    }

    // ── DROPDOWN CONTROLLERS ──────────────────────────────────────────────────
    function initializeDropdownControllers() {
        document.querySelectorAll(".btn-add-shelf").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const targetId = btn.getAttribute("data-book-id");
                const popover  = document.getElementById(`popover-${targetId}`);
                document.querySelectorAll(".shelf-popover-menu").forEach(menu => {
                    if (menu !== popover) menu.classList.remove("open");
                });
                popover.classList.toggle("open");
            });
        });

        document.querySelectorAll(".menu-action-option").forEach(option => {
            option.addEventListener("click", async (e) => {
                e.stopPropagation();

                const selectedStatus = option.getAttribute("data-status");
                const parentMenu     = option.closest(".shelf-popover-menu");
                const triggerBtn     = parentMenu.previousElementSibling;

                const bookData = {
                    title:         triggerBtn.getAttribute("data-title"),
                    author:        triggerBtn.getAttribute("data-author"),
                    description:   triggerBtn.getAttribute("data-description"),
                    googleBooksId: triggerBtn.getAttribute("data-google-id") || '',
                    totalPages:    parseInt(triggerBtn.getAttribute("data-total-pages")) || 0,
                    thumbnail:     triggerBtn.getAttribute("data-thumbnail") || '',
                    status:        selectedStatus,
                    coverColor:    coverColorPalette[Math.floor(Math.random() * coverColorPalette.length)]
                };

                try {
                    const response = await apiFetch('/shelves', {
                        method: 'POST',
                        body:   JSON.stringify(bookData)
                    });

                    if (!response) return;

                    const data = await response.json();

                    if (!response.ok) {
                        if (response.status === 409 && data.bookId) {
                            // Book already exists — move it to new shelf
                            const moveResponse = await apiFetch(`/shelves/${data.bookId}`, {
                                method: 'PUT',
                                body:   JSON.stringify({ status: selectedStatus })
                            });

                            if (moveResponse && moveResponse.ok) {
                                triggerBtn.textContent = `✓ On ${selectedStatus} shelf`;
                                triggerBtn.style.backgroundColor = "#9B8E82";
                                // Keep the in-memory map in sync
                                const gid = triggerBtn.getAttribute("data-google-id");
                                if (gid) window.existingShelfBooks?.set(gid, selectedStatus);
                                const titleKey = `${triggerBtn.getAttribute("data-title")}__${triggerBtn.getAttribute("data-author")}`.toLowerCase();
                                window.existingShelfBooksByTitle?.set(titleKey, selectedStatus);
                            }
                        } else {
                            alert(data.message || 'Could not add book to shelf.');
                        }
                        parentMenu.classList.remove("open");
                        return;
                    }

                    triggerBtn.textContent = `✓ On ${selectedStatus} shelf`;
                    triggerBtn.style.backgroundColor = "#9B8E82";
                    parentMenu.classList.remove("open");

                    // Keep the in-memory maps in sync so searching again shows correct state
                    const gid = triggerBtn.getAttribute("data-google-id");
                    if (gid) window.existingShelfBooks?.set(gid, selectedStatus);
                    const titleKey = `${triggerBtn.getAttribute("data-title")}__${triggerBtn.getAttribute("data-author")}`.toLowerCase();
                    window.existingShelfBooksByTitle?.set(titleKey, selectedStatus);

                } catch (error) {
                    console.error('Folio shelf error:', error);
                    alert('Could not connect to Folio server.');
                }
            });
        });

        document.addEventListener("click", () => {
            document.querySelectorAll(".shelf-popover-menu")
                    .forEach(m => m.classList.remove("open"));
        });
    }

    // ── SEARCH ────────────────────────────────────────────────────────────────
    searchInput.addEventListener("input", (e) => {
        clearTimeout(debounceTimer);
        const query = e.target.value.trim();
        if (!query) { loadFeaturedBooks(); return; }
        debounceTimer = setTimeout(() => searchBooks(query), 400);
    });

    async function searchBooks(query) {
        try {
            gridContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; 
                            padding: 48px; color: var(--text-muted);">
                    🔍 Searching...
                </div>`;

            const response = await apiFetch(
                `/books/search?q=${encodeURIComponent(query)}`
            );
            if (!response) return;

            const data = await response.json();
            renderDiscoverCollectionGrid(data.books || []);

        } catch (error) {
            console.error('Search error:', error);
            gridContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; 
                            padding: 48px; color: var(--text-muted);">
                    ⚠️ Could not connect to server.
                </div>`;
        }
    }

    // ── MARK EXISTING SHELF BOOKS ─────────────────────────────────────────────
    async function markExistingShelfBooks() {
        try {
            const response = await apiFetch('/shelves');
            if (!response) return;

            const data = await response.json();
            if (!data.success) return;

            const allBooks = [
                ...data.shelves['want-to-read'],
                ...data.shelves['reading'],
                ...data.shelves['completed']
            ];

            window.existingShelfBooks = new Map(
                allBooks
                    .filter(b => b.googleBooksId)
                    .map(b => [cleanGoogleId(b.googleBooksId), b.status])
            );

            window.existingShelfBooksByTitle = new Map(
                allBooks.map(b => [
                    `${b.title}__${b.author}`.toLowerCase(),
                    b.status
                ])
            );

            console.log('Shelf map built:', [...window.existingShelfBooks.entries()]);

        } catch (error) {
            console.error('Mark existing books error:', error);
        }
    }

    // ── LOAD FEATURED ─────────────────────────────────────────────────────────
    async function loadFeaturedBooks() {
        try {
            gridContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; 
                            padding: 48px; color: var(--text-muted);">
                    📚 Loading books...
                </div>`;

            const response = await apiFetch('/books/featured');
            if (!response) return;

            const data = await response.json();
            renderDiscoverCollectionGrid(data.books || []);

        } catch (error) {
            console.error('Featured books error:', error);
        }
    }

    // ── INITIAL LOAD ──────────────────────────────────────────────────────────
    markExistingShelfBooks().then(() => {
        loadFeaturedBooks();
    });
     loadSidebarStreak();

});