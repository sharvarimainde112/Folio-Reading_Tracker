const API_BASE = 'http://localhost:5000/api';

/**
 * Authenticated fetch — automatically adds JWT token to every request
 * Use this instead of plain fetch() everywhere in your frontend
 */
async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem('folio_token');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
    });

    // Token expired or invalid — redirect to login
    if (response.status === 401) {
        localStorage.removeItem('folio_token');
        localStorage.removeItem('folio_user');
        window.location.href = '../Auth/index.html';
        return null;
    }

    return response;
}

async function handleLogout() {
    try {
        await apiFetch('/auth/logout', { method: 'POST' });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        // Always clear local storage and redirect
        localStorage.removeItem('folio_token');
        localStorage.removeItem('folio_user');
        localStorage.removeItem('folio_userId');
        window.location.href = '../Auth/index.html';
    }
}

// ─── SIDEBAR STREAK (runs on every page) ─────────────────────────────────────
async function loadSidebarStreak() {
    try {
        const response = await apiFetch('/stats');
        if (!response) return;

        const data = await response.json();
        if (!data.success) return;

        const streakEl = document.getElementById('sidebarStreak');
        if (streakEl) streakEl.innerText = `${data.stats.streak} day streak 🔥`;

        const mottoEl = document.querySelector('.motto');
        if (mottoEl) {
            mottoEl.innerHTML = `You've read <strong class="highlight">${data.stats.completed} books</strong> total. Keep going!`;
        }

    } catch (error) {
        console.error('Sidebar streak error:', error);
    }
}