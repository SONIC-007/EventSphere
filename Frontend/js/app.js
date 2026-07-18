/* ============================================
   EventSphere – API Client & Utilities
   ============================================ */

const API_BASE = '/api';

// ── Auth Token Management ──
const Auth = {
  getToken: () => localStorage.getItem('es_access_token'),
  getRefresh: () => localStorage.getItem('es_refresh_token'),
  getUser: () => JSON.parse(localStorage.getItem('es_user') || 'null'),

  save(data) {
    localStorage.setItem('es_access_token', data.accessToken);
    localStorage.setItem('es_refresh_token', data.refreshToken);
    localStorage.setItem('es_user', JSON.stringify(data.user));
  },

  clear() {
    localStorage.removeItem('es_access_token');
    localStorage.removeItem('es_refresh_token');
    localStorage.removeItem('es_user');
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  isOrganizer() {
    const u = this.getUser();
    return u && (u.role === 'organizer' || u.role === 'admin');
  },
};

// ── API Fetch Wrapper ──
async function api(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };

  const token = Auth.getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });
  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || 'Something went wrong');
  }

  return json;
}

// ── Toast Notifications ──
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

// ── Date Formatting ──
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(dateStr) {
  return `${formatDate(dateStr)} at ${formatTime(dateStr)}`;
}

function timeUntil(dateStr) {
  const diff = new Date(dateStr) - new Date();
  if (diff < 0) return 'Past';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 30) return `${Math.floor(days / 30)} months`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  return `${hours} hour${hours !== 1 ? 's' : ''}`;
}

// ── Render Navbar ──
function renderNavbar(activePage = '') {
  const user = Auth.getUser();
  const isOrg = Auth.isOrganizer();

  return `
    <nav class="navbar" id="main-navbar">
      <div class="container">
        <a href="/" class="navbar-brand" id="nav-brand">
          <div class="brand-icon">⚡</div>
          EventSphere
        </a>
        <button class="menu-toggle" id="menu-toggle" aria-label="Toggle menu">☰</button>
        <div class="navbar-nav" id="navbar-nav">
          <a href="/" class="nav-link ${activePage === 'home' ? 'active' : ''}" id="nav-home">Home</a>
          <a href="/events.html" class="nav-link ${activePage === 'events' ? 'active' : ''}" id="nav-events">Events</a>
          ${user ? `
            <a href="/dashboard.html" class="nav-link ${activePage === 'dashboard' ? 'active' : ''}" id="nav-dashboard">Dashboard</a>
            ${isOrg ? `<a href="/create-event.html" class="nav-link ${activePage === 'create' ? 'active' : ''}" id="nav-create">Create Event</a>` : ''}
            <div class="nav-user">
              <div class="nav-avatar" id="nav-avatar">${user.name.charAt(0).toUpperCase()}</div>
              <button class="nav-link" id="nav-logout" onclick="logout()">Logout</button>
            </div>
          ` : `
            <a href="/login.html" class="btn btn-ghost ${activePage === 'login' ? 'active' : ''}" id="nav-login">Log In</a>
            <a href="/signup.html" class="btn btn-primary btn-sm" id="nav-signup">Sign Up</a>
          `}
        </div>
      </div>
    </nav>
  `;
}

function initNavbar() {
  const toggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('navbar-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
  }
}

// ── Logout ──
function logout() {
  Auth.clear();
  window.location.href = '/login.html';
}

// ── Loading State ──
function showLoading(containerId) {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = '<div class="loading-center"><div class="spinner"></div></div>';
}

function showEmpty(containerId, icon = '📭', title = 'Nothing here yet', text = '') {
  const el = document.getElementById(containerId);
  if (el) {
    el.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">${icon}</div>
        <div class="empty-state-title">${title}</div>
        ${text ? `<div class="empty-state-text">${text}</div>` : ''}
      </div>
    `;
  }
}

// ── Generate gradient colors for event cards ──
const gradients = [
  'linear-gradient(135deg, #6C63FF, #FF6B9D)',
  'linear-gradient(135deg, #4ECDC4, #556270)',
  'linear-gradient(135deg, #FF6B9D, #FFB347)',
  'linear-gradient(135deg, #2DD4A8, #6C63FF)',
  'linear-gradient(135deg, #A855F7, #EC4899)',
  'linear-gradient(135deg, #3B82F6, #8B5CF6)',
  'linear-gradient(135deg, #F59E0B, #EF4444)',
  'linear-gradient(135deg, #10B981, #3B82F6)',
];

function getGradient(index) {
  return gradients[index % gradients.length];
}

// ── Status badge helper ──
function statusBadge(status) {
  const map = {
    draft: 'badge-warning',
    published: 'badge-success',
    completed: 'badge-info',
    cancelled: 'badge-danger',
    registered: 'badge-success',
    waitlisted: 'badge-warning',
    attended: 'badge-primary',
  };
  return `<span class="badge ${map[status] || 'badge-primary'}">${status}</span>`;
}

// ── Render Event Card ──
function renderEventCard(event, index = 0) {
  const orgName = event.orgId?.name || 'Unknown Org';
  return `
    <div class="event-card" onclick="window.location.href='/event.html?id=${event._id}'" id="event-card-${event._id}">
      <div class="event-card-banner" style="background: ${getGradient(index)}">
        ${event.category ? `<div class="event-card-category"><span class="badge badge-primary">${event.category}</span></div>` : ''}
        <div class="event-card-status">${statusBadge(event.status)}</div>
      </div>
      <div class="event-card-body">
        <h4 class="event-card-title">${event.title}</h4>
        <p style="font-size:0.85rem; color: var(--text-muted); margin-top:4px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
          ${event.description || 'No description'}
        </p>
        <div class="event-card-meta">
          <div class="event-card-meta-item">
            <span class="icon">📅</span> ${formatDate(event.date)}
          </div>
          <div class="event-card-meta-item">
            <span class="icon">📍</span> ${event.venue}
          </div>
          <div class="event-card-meta-item">
            <span class="icon">👥</span> Capacity: ${event.capacity}
          </div>
        </div>
      </div>
      <div class="event-card-footer">
        <span class="event-card-org">🏢 ${orgName}</span>
        <span class="badge badge-info">${timeUntil(event.date)}</span>
      </div>
    </div>
  `;
}

// ── Star Rating Component ──
function renderStars(rating, interactive = false, inputId = 'rating-input') {
  let html = `<div class="star-rating" ${interactive ? `id="${inputId}"` : ''}>`;
  for (let i = 1; i <= 5; i++) {
    const filled = i <= rating ? 'filled' : '';
    if (interactive) {
      html += `<span class="star ${filled}" data-value="${i}" onclick="setRating(${i}, '${inputId}')">★</span>`;
    } else {
      html += `<span class="star ${filled}">★</span>`;
    }
  }
  html += '</div>';
  return html;
}

function setRating(value, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.dataset.rating = value;
  container.querySelectorAll('.star').forEach((star) => {
    star.classList.toggle('filled', parseInt(star.dataset.value) <= value);
  });
}

// ── Require Auth Guard ──
function requireAuth() {
  if (!Auth.isLoggedIn()) {
    window.location.href = '/login.html';
    return false;
  }
  return true;
}
