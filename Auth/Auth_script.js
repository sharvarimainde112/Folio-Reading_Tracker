const API_BASE = 'http://localhost:5000/api';

// ─── CARD FLIP ────────────────────────────────────────────────────────────────
function toggleCard() {
    document.getElementById('authCard').classList.toggle('flipped');
}

// ─── MAIN AUTH HANDLER ────────────────────────────────────────────────────────
// Called by both forms via onsubmit="handleAuth(event)"
// Detects which form submitted and routes accordingly
async function handleAuth(event) {
    event.preventDefault();

    const submittedFormId = event.target.id; // "loginForm" or "signupForm"

    if (submittedFormId === 'signupForm') {
        await handleSignup();
    } else if (submittedFormId === 'loginForm') {
        await handleLogin();
    }
}

// ─── SIGNUP ───────────────────────────────────────────────────────────────────
async function handleSignup() {
    const name     = document.getElementById('signupName').value.trim();
    const email    = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();

    if (!name || !email || !password) {
        alert('Please fill in all fields.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Required to receive + store httpOnly cookie
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || 'Signup failed. Please try again.');
            return;
        }

        // Store name for greeting display across pages
        localStorage.setItem('folio_user', data.user.name);

        showSuccessAndRedirect();

    } catch (error) {
        console.error('Folio signup error:', error);
        alert('Could not connect to Folio server. Is it running?');
    }
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
async function handleLogin() {
    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!email || !password) {
        alert('Please enter your email and password.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Required to send + receive httpOnly cookie
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || 'Login failed. Please check your credentials.');
            return;
        }

        // Store name for greeting display across pages
        localStorage.setItem('folio_user', data.user.name);

        showSuccessAndRedirect();

    } catch (error) {
        console.error('Folio login error:', error);
        alert('Could not connect to Folio server. Is it running?');
    }
}

// ─── SHARED SUCCESS HANDLER ───────────────────────────────────────────────────
function showSuccessAndRedirect() {
    document.getElementById('successOverlay').classList.add('active');
    setTimeout(() => {
        window.location.href = '../home/index.html';
    }, 1800);
}