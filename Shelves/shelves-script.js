document.addEventListener("DOMContentLoaded", async () => {
    updateSidebarUserInfo();
    executeStaggeredColumnEntranceAnimation();
    await loadAndRenderShelves();
     
});

function executeStaggeredColumnEntranceAnimation() {
    const activeColumns = document.querySelectorAll(".column-animate");
    activeColumns.forEach((column, index) => {
        column.style.animationDelay = `${index * 0.12}s`;
        column.classList.add("column-glide-up-trigger");
    });
}

async function loadAndRenderShelves() {
    try {
        const response = await apiFetch('/shelves');
        if (!response) return;

        const data = await response.json();
        if (!data.success) return;

        renderLibraryShelvesBoard(data.shelves);

    } catch (error) {
        console.error('Folio shelves error:', error);
    }
}

function renderLibraryShelvesBoard(shelves) {
    const targetZones = {
        "want-to-read": document.getElementById("zone-want-to-read"),
        "reading":       document.getElementById("zone-reading"),
        "completed":     document.getElementById("zone-completed")
    };

    const counterBadges = {
        "want-to-read": document.getElementById("count-want-to-read"),
        "reading":       document.getElementById("count-reading"),
        "completed":     document.getElementById("count-completed")
    };

    Object.values(targetZones).forEach(zone => { if (zone) zone.innerHTML = ""; });

    Object.entries(shelves).forEach(([status, books]) => {
        if (counterBadges[status]) {
            counterBadges[status].innerText = books.length;
        }

        books.forEach(book => {
            const cardNode = document.createElement("article");
            cardNode.className = "shelf-book-card";
            cardNode.id = book._id;

            let operationalMetricMarkup = "";
               if (status === "reading") {
    operationalMetricMarkup = `
        <div class="metric-row-container">
            <div class="compact-progress-track">
                <div class="compact-progress-fill" 
                     style="width: ${book.progress}%;"></div>
            </div>
            <span class="progress-label">${book.progress}% read</span>
        </div>
    `;
}
             else if (status === "completed") {
    const stars = "★".repeat(book.rating) + "☆".repeat(5 - book.rating);
    operationalMetricMarkup = `
        <div class="metric-row-container">
            <div class="star-rating-row" 
                 style="cursor:pointer"
                 data-book-id="${book._id}"
                 onclick="openRatingModal('${book._id}')">
                ${stars}
            </div>
        </div>
    `;
}

            cardNode.innerHTML = `
    <div class="card-thumbnail-frame" 
         style="background-color: ${book.thumbnail ? 'transparent' : book.coverColor};">
        ${book.thumbnail
            ? `<img src="${book.thumbnail}" alt="${book.title}" 
                    style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`
            : `<span class="thumb-letter">${book.title.charAt(0)}</span>`
        }
    </div>
    <div class="card-meta-block">
        <div class="text-group">
            <h4 class="book-title" title="${book.title}">${book.title}</h4>
            <p class="book-author">${book.author}</p>
        </div>
        ${operationalMetricMarkup}
    </div>

    <div class="shelf-shift-container">
    ${status === 'reading' ? `
        <button class="btn-update-progress"
                data-book-id="${book._id}"
                data-book-title="${book.title}"
                data-current-progress="${book.progress}"
                data-total-pages="${book.totalPages || 0}">Update</button>
    ` : ''}
    <button class="btn-shift-trigger" 
            aria-label="Move book to shelf">⋮</button>
        <div class="shift-dropdown-menu">
            ${status !== 'want-to-read' ?
                `<button class="dropdown-opt" 
                         data-target-status="want-to-read">
                         📂 Want to Read</button>` : ''}
            ${status !== 'reading' ?
                `<button class="dropdown-opt" 
                         data-target-status="reading">
                         📖 Reading</button>` : ''}
            ${status !== 'completed' ?
                `<button class="dropdown-opt" 
                         data-target-status="completed">
                         ✓ Completed</button>` : ''}
            <button class="dropdown-opt" 
                    data-target-status="delete"
                    style="color: #c0392b;">
                    🗑 Remove</button>
        </div>
    </div>
`;

            if (targetZones[status]) {
                targetZones[status].appendChild(cardNode);
            }
        });
    });

    bindShelfManagementInteractionEvents();
}

function bindShelfManagementInteractionEvents() {
    // Use event delegation on the board container
    const board = document.querySelector('.board-container');
    if (!board) return;

    // Remove old listeners by cloning
    const newBoard = board.cloneNode(true);
    board.parentNode.replaceChild(newBoard, board);

    // Toggle dropdown menus
    newBoard.addEventListener('click', async (e) => {
        e.stopPropagation();

        // ── SHIFT TRIGGER ─────────────────────────────────────────────────────
        if (e.target.closest('.btn-shift-trigger')) {
            const btn  = e.target.closest('.btn-shift-trigger');
            const menu = btn.nextElementSibling;
            newBoard.querySelectorAll('.shift-dropdown-menu').forEach(m => {
                if (m !== menu) m.classList.remove('open');
            });
            menu.classList.toggle('open');
            return;
        }

        // ── DROPDOWN OPTION ───────────────────────────────────────────────────
        if (e.target.closest('.dropdown-opt')) {
            const opt          = e.target.closest('.dropdown-opt');
            const targetStatus = opt.getAttribute('data-target-status');
            const parentCard   = opt.closest('.shelf-book-card');
            const bookId       = parentCard.id;

            if (targetStatus === 'delete') {
                await deleteBookFromShelf(bookId);
            } else {
                await moveBookToShelf(bookId, targetStatus);
            }
            return;
        }

        // ── UPDATE PROGRESS ───────────────────────────────────────────────────
        if (e.target.closest('.btn-update-progress')) {
            const btn = e.target.closest('.btn-update-progress');
            openProgressModal(
                btn.getAttribute('data-book-id'),
                btn.getAttribute('data-book-title'),
                parseInt(btn.getAttribute('data-current-progress')) || 0,
                parseInt(btn.getAttribute('data-total-pages')) || 0
            );
            return;
        }
    });

    // Close dropdowns on outside click
    document.addEventListener('click', () => {
        document.querySelectorAll('.shift-dropdown-menu')
                .forEach(m => m.classList.remove('open'));
    });
}

async function moveBookToShelf(bookId, newStatus) {
    try {
        const response = await apiFetch(`/shelves/${bookId}`, {
            method: 'PUT',
            body:   JSON.stringify({ status: newStatus })
        });
        if (response && response.ok) await loadAndRenderShelves();
    } catch (error) {
        console.error('Move book error:', error);
    }
}

async function deleteBookFromShelf(bookId) {
    try {
        const response = await apiFetch(`/shelves/${bookId}`, {
            method: 'DELETE'
        });
        if (response && response.ok) await loadAndRenderShelves();
    } catch (error) {
        console.error('Delete book error:', error);
    }
}
// ─── MODAL STATE ──────────────────────────────────────────────────────────────
let activeBookId   = null;
let activeRating   = 0;

// ─── OPEN PROGRESS MODAL ──────────────────────────────────────────────────────
function openProgressModal(bookId, bookTitle, currentProgress, totalPages) {
    activeBookId = bookId;

    document.getElementById('modalBookTitle').innerText   = bookTitle;
    document.getElementById('totalPagesInput').value      = totalPages || '';
    document.getElementById('currentPageInput').value     = '';

    // Set initial progress preview
    updateProgressPreview(currentProgress);

    document.getElementById('progressModalOverlay').classList.add('active');
    document.getElementById('currentPageInput').focus();
}

// ─── UPDATE PROGRESS PREVIEW ──────────────────────────────────────────────────
function updateProgressPreview(percent) {
    const clamped = Math.min(100, Math.max(0, percent));
    document.getElementById('modalProgressFill').style.width    = `${clamped}%`;
    document.getElementById('modalProgressPercent').innerText   = `${clamped}%`;
}

// ─── CLOSE PROGRESS MODAL ─────────────────────────────────────────────────────
function closeProgressModal() {
    document.getElementById('progressModalOverlay').classList.remove('active');
    document.getElementById('currentPageInput').value = '';
    document.getElementById('totalPagesInput').value  = '';
    
}

// ─── SAVE PROGRESS ────────────────────────────────────────────────────────────
async function saveProgress() {
    const currentPage = parseInt(document.getElementById('currentPageInput').value);
    const totalPages  = parseInt(document.getElementById('totalPagesInput').value);

    if (!currentPage || !totalPages || totalPages === 0) {
        alert('Please enter both current page and total pages.');
        return;
    }

    if (currentPage > totalPages) {
        alert('Current page cannot exceed total pages.');
        return;
    }

    try {
        const response = await apiFetch(`/shelves/${activeBookId}`, {
            method: 'PUT',
            body:   JSON.stringify({ currentPage, totalPages })
        });

        if (response && response.ok) {
            const data = await response.json();
            closeProgressModal();
            await loadAndRenderShelves();

            // If auto-completed (reached 100%), open rating modal
            if (data.autoCompleted) {
                setTimeout(() => openRatingModal(activeBookId), 400);
            }
        }
    } catch (error) {
        console.error('Save progress error:', error);
    }
}
// ─── FINISH BOOK ──────────────────────────────────────────────────────────────
async function finishBook() {
    try {
        const response = await apiFetch(`/shelves/${activeBookId}`, {
            method: 'PUT',
            body:   JSON.stringify({ finished: true })
        });

        if (response && response.ok) {
            closeProgressModal();
            await loadAndRenderShelves();
            // Open rating modal after finishing
            openRatingModal(activeBookId);
        }
    } catch (error) {
        console.error('Finish book error:', error);
    }
}

// ─── OPEN RATING MODAL ────────────────────────────────────────────────────────
function openRatingModal(bookId) {
    activeBookId = bookId;
    activeRating = 0;

    // Reset stars
    document.querySelectorAll('.star-input').forEach(s => {
        s.textContent = '☆';
        s.classList.remove('active');
    });
    document.getElementById('ratingLabel').innerText = 'Select a rating';
    document.getElementById('ratingModalOverlay').classList.add('active');
}

// ─── CLOSE RATING MODAL ───────────────────────────────────────────────────────
function closeRatingModal() {
    document.getElementById('ratingModalOverlay').classList.remove('active');
    activeBookId = null;
    activeRating = 0;
}

// ─── SAVE RATING ──────────────────────────────────────────────────────────────
async function saveRating() {
    if (activeRating === 0) {
        alert('Please select a rating.');
        return;
    }

    try {
        const response = await apiFetch(`/shelves/${activeBookId}`, {
            method: 'PUT',
            body:   JSON.stringify({ rating: activeRating })
        });

        if (response && response.ok) {
            closeRatingModal();
            await loadAndRenderShelves();
        }
    } catch (error) {
        console.error('Save rating error:', error);
    }
}

// ─── MODAL EVENT LISTENERS ────────────────────────────────────────────────────
document.getElementById('modalCloseBtn').addEventListener('click',  closeProgressModal);
document.getElementById('modalCancelBtn').addEventListener('click', closeProgressModal);
document.getElementById('modalSaveBtn').addEventListener('click',   saveProgress);
document.getElementById('modalFinishBtn').addEventListener('click', finishBook);

document.getElementById('ratingModalCloseBtn').addEventListener('click', closeRatingModal);
document.getElementById('ratingCancelBtn').addEventListener('click',     closeRatingModal);
document.getElementById('ratingSaveBtn').addEventListener('click',       saveRating);

// Close modal on overlay click
document.getElementById('progressModalOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('progressModalOverlay')) closeProgressModal();
});
document.getElementById('ratingModalOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('ratingModalOverlay')) closeRatingModal();
});

// Live progress preview as user types
document.getElementById('currentPageInput').addEventListener('input', () => {
    const current = parseInt(document.getElementById('currentPageInput').value) || 0;
    const total   = parseInt(document.getElementById('totalPagesInput').value)  || 0;
    if (total > 0) updateProgressPreview(Math.round((current / total) * 100));
});
document.getElementById('totalPagesInput').addEventListener('input', () => {
    const current = parseInt(document.getElementById('currentPageInput').value) || 0;
    const total   = parseInt(document.getElementById('totalPagesInput').value)  || 0;
    if (total > 0) updateProgressPreview(Math.round((current / total) * 100));
});

// Star rating hover + click
const ratingLabels = ['', 'Not for me', 'It was okay', 'Liked it', 'Really liked it', 'Amazing! ⭐'];
document.querySelectorAll('.star-input').forEach(star => {
    star.addEventListener('mouseover', () => {
        const val = parseInt(star.getAttribute('data-value'));
        document.querySelectorAll('.star-input').forEach((s, i) => {
            s.textContent = i < val ? '★' : '☆';
        });
        document.getElementById('ratingLabel').innerText = ratingLabels[val];
    });

    star.addEventListener('click', () => {
        activeRating = parseInt(star.getAttribute('data-value'));
        document.querySelectorAll('.star-input').forEach((s, i) => {
            s.classList.toggle('active', i < activeRating);
        });
    });

    star.addEventListener('mouseleave', () => {
        document.querySelectorAll('.star-input').forEach((s, i) => {
            s.textContent = i < activeRating ? '★' : '☆';
        });
        if (activeRating === 0) {
            document.getElementById('ratingLabel').innerText = 'Select a rating';
        }
    });
});

