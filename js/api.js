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

async function updateSidebarUserInfo() {
    // Update name from localStorage
    const rawName    = localStorage.getItem('folio_user') || 'Reader';
    const activeUser = rawName.charAt(0).toUpperCase() + rawName.slice(1);

    const profileEl = document.getElementById('profileName');
    const avatarEl  = document.querySelector('.avatar-circle');

    if (profileEl) profileEl.innerText = activeUser;
    if (avatarEl)  avatarEl.innerText  = activeUser.charAt(0).toUpperCase();

    // Update streak from backend — silently, no redirect on failure
    try {
        const token = localStorage.getItem('folio_token');
        if (!token) return; // ← don't redirect, just skip

        const response = await fetch('http://localhost:5000/api/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) return; // ← don't redirect, just skip

        const data = await response.json();
        if (!data.success) return;

        const streakEl = document.getElementById('sidebarStreak');
        if (streakEl) streakEl.innerText = `${data.stats.streak} day streak 🔥`;

    } catch (error) {
        console.error('Sidebar update error:', error);
    }
}