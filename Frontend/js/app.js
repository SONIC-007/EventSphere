/* ==========================================================================
   EventSphere - Core Client, Auth & UI Utilities
   ========================================================================== */

const API_BASE = '/api';

// ── Auth Token & Session Management ──
const Auth = {
  getToken: () => localStorage.getItem('es_access_token'),
  getRefresh: () => localStorage.getItem('es_refresh_token'),
  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem('es_user') || 'null');
    } catch {
      return null;
    }
  },

  save(data) {
    if (data.accessToken) localStorage.setItem('es_access_token', data.accessToken);
    if (data.refreshToken) localStorage.setItem('es_refresh_token', data.refreshToken);
    if (data.user) localStorage.setItem('es_user', JSON.stringify(data.user));
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

  isAdmin() {
    const u = this.getUser();
    return u && u.role === 'admin';
  }
};

// ── Fetch Wrapper ──
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
  const icons = { success: 'check_circle', error: 'error', info: 'info' };
  toast.innerHTML = `<span class="material-symbols-outlined">${icons[type] || 'info'}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ── Date Formatters ──
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(dateStr) {
  if (!dateStr) return 'N/A';
  return `${formatDate(dateStr)} at ${formatTime(dateStr)}`;
}

function getMonthAbbr(dateStr) {
  if (!dateStr) return 'OCT';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
}

function getDayNum(dateStr) {
  if (!dateStr) return '15';
  return new Date(dateStr).getDate();
}

function timeUntil(dateStr) {
  if (!dateStr) return '';
  const diff = new Date(dateStr) - new Date();
  if (diff < 0) return 'Past';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 30) return `${Math.floor(days / 30)} months`;
  if (days > 0) return `${days}d left`;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  return `${hours}h left`;
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderCapacityBar(filled = 0, total = 0) {
  const percent = total > 0 ? Math.min(100, Math.round((filled / total) * 100)) : 0;
  return `
    <div class="capacity-bar" aria-hidden="true">
      <span style="width:${percent}%"></span>
    </div>
    <div class="capacity-meta">${filled} / ${total}</div>
  `;
}

function renderLifecycleRail(status, compact = true) {
  const steps = ['draft', 'published', 'completed'];
  const activeIndex = Math.max(0, steps.indexOf(status));
  const cancelled = status === 'cancelled';

  if (compact) {
    return `
      <div class="lifecycle-rail lifecycle-rail-compact lifecycle-${status || 'draft'}" title="${status || 'draft'}">
        ${steps.map((step, index) => `<span class="rail-dot ${index <= activeIndex && !cancelled ? 'is-active' : ''}"></span>`).join('')}
        ${cancelled ? '<span class="rail-cancelled">cancelled</span>' : ''}
      </div>
    `;
  }

  const labels = [
    { key: 'draft', label: 'Draft' },
    { key: 'published', label: 'Published' },
    { key: 'completed', label: 'Completed' },
  ];

  return `
    <div class="lifecycle-rail lifecycle-rail-full lifecycle-${status || 'draft'}">
      ${labels.map((step, index) => `
        <div class="rail-step ${index <= activeIndex && !cancelled ? 'is-active' : ''}">
          <span class="rail-step-dot"></span>
          <span class="rail-step-label">${step.label}</span>
        </div>
      `).join('')}
      <div class="rail-step rail-step-cancelled ${cancelled ? 'is-active' : ''}">
        <span class="rail-step-dot"></span>
        <span class="rail-step-label">Cancelled</span>
      </div>
    </div>
  `;
}

// ── Navbar Component ──
function renderNavbar(activePage = '') {
  const user = Auth.getUser();
  const isOrg = Auth.isOrganizer();
  const loggedIn = !!user;
  const brandHref = loggedIn ? '/dashboard.html' : '/';

  return `
    <nav class="navbar" id="main-navbar">
      <div class="container">
        <a href="${brandHref}" class="navbar-brand" id="nav-brand">
          <div class="brand-icon">
            <span class="material-symbols-outlined">hub</span>
          </div>
          EventSphere
        </a>
        <button class="menu-toggle" id="menu-toggle" aria-label="Toggle navigation">
          <span class="material-symbols-outlined">menu</span>
        </button>
        <div class="navbar-nav" id="navbar-nav">
          ${loggedIn ? '' : `<a href="/" class="nav-link ${activePage === 'home' ? 'active' : ''}" id="nav-home">
            <span class="material-symbols-outlined">home</span> Home
          </a>`}
          <a href="/events.html" class="nav-link ${activePage === 'events' ? 'active' : ''}" id="nav-events">
            <span class="material-symbols-outlined">event</span> Browse Events
          </a>
          ${loggedIn ? `
            <a href="/dashboard.html" class="nav-link ${activePage === 'dashboard' ? 'active' : ''}" id="nav-dashboard">
              <span class="material-symbols-outlined">dashboard</span> Dashboard
            </a>
            ${isOrg ? `
              <a href="/create-event.html" class="nav-link ${activePage === 'create' ? 'active' : ''}" id="nav-create">
                <span class="material-symbols-outlined">add_circle</span> Create Event
              </a>
            ` : ''}
            <div class="nav-user">
              <div class="nav-avatar" id="nav-avatar" title="${user.name}">
                ${user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <button class="btn btn-ghost btn-sm" id="nav-logout" onclick="logout()">
                <span class="material-symbols-outlined">logout</span> Log Out
              </button>
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

  const navbar = document.getElementById('main-navbar');
  if (!navbar) return;

  const syncNav = () => {
    navbar.classList.toggle('is-scrolled', window.scrollY > 12);
  };

  syncNav();
  window.addEventListener('scroll', syncNav, { passive: true });
}

function logout() {
  Auth.clear();
  showToast('Logged out successfully', 'info');
  setTimeout(() => window.location.href = '/', 400);
}

// ── Sample Banner Image Stock ──
const sampleBanners = [
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80',
];

function getSampleBanner(index) {
  return sampleBanners[index % sampleBanners.length];
}

// ── Status Badges ──
function statusBadge(status) {
  const map = {
    draft: 'badge-slate',
    published: 'badge-amber',
    completed: 'badge-moss',
    cancelled: 'badge-rust',
    registered: 'badge-moss',
    waitlisted: 'badge-amber',
    attended: 'badge-ink',
  };
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
  return `<span class="badge ${map[status] || 'badge-primary'}">${label}</span>`;
}

// ── Event Card Component (Sample Inspired) ──
function renderEventCard(event, index = 0) {
  const orgName = event.orgId?.name || 'Organization';
  const bannerImg = getSampleBanner(index);
  const filledSeats = event.registeredCount ?? event.currentRegistrations ?? 0;
  const capacity = event.capacity ?? 0;

  return `
    <div class="event-card" onclick="window.location.href='/event.html?id=${event._id}'" id="event-card-${event._id}">
      <div class="event-card-banner" style="background-image: linear-gradient(180deg, rgba(20,33,61,0.08), rgba(20,33,61,0.72)), url('${bannerImg}');">
        <div>${event.category ? `<span class="badge badge-secondary">${escapeHtml(event.category)}</span>` : ''}</div>
        <div>${renderLifecycleRail(event.status, true)}</div>
      </div>
      <div class="event-card-body">
        <h4 class="event-card-title">${event.title}</h4>
        <p class="event-card-desc">${event.description || 'No description provided.'}</p>
        <div class="event-card-meta">
          <div class="event-card-meta-item">
            <span class="material-symbols-outlined">calendar_today</span> ${formatDate(event.date)}
          </div>
          <div class="event-card-meta-item">
            <span class="material-symbols-outlined">location_on</span> ${event.venue}
          </div>
          <div class="event-card-meta-item">
            <span class="material-symbols-outlined">group</span> Capacity: ${event.capacity}
          </div>
        </div>
        <div class="capacity-shell">
          ${renderCapacityBar(filledSeats, capacity)}
        </div>
      </div>
      <div class="event-card-footer">
        <span style="display:flex; align-items:center; gap:0.3rem;"><span class="material-symbols-outlined" style="font-size:16px;">business</span> ${orgName}</span>
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
  container.querySelectorAll('.star').forEach((star, idx) => {
    star.classList.toggle('filled', idx + 1 <= value);
  });
}

function showLoading(containerId) {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = '<div class="spinner-center"><div class="spinner"></div></div>';
}

function showEmpty(containerId, icon = 'inbox', title = 'No items found', text = '') {
  const el = document.getElementById(containerId);
  if (el) {
    el.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <span class="material-symbols-outlined" style="font-size:32px;">${icon}</span>
        </div>
        <div class="empty-state-title">${title}</div>
        ${text ? `<div class="empty-state-text">${text}</div>` : ''}
      </div>
    `;
  }
}

function requireAuth() {
  if (!Auth.isLoggedIn()) {
    window.location.href = '/login.html';
    return false;
  }
  return true;
}
