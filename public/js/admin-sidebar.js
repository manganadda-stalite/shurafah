(function () {
  /* ─────────────────────────────────────────────
     Shurafah Admin — Unified Sidebar
     Drop <script src="admin-sidebar.js"></script>
     anywhere in <body> and it will:
       1. Inject sidebar CSS
       2. Build and prepend the <aside>
       3. Mark the active nav item automatically
       4. Wire up the collapse toggle button
  ───────────────────────────────────────────── */

  /* ── 1. Inject sidebar CSS ─────────────────── */
  var css = `
    :root {
      --sidebar-w: 240px;
      --sidebar-collapsed: 62px;
      --topbar-h: 60px;
    }
    /* Prevent horizontal scrollbar from sidebar width transitions */
    body { overflow-x: hidden; }

    /* ── Sidebar shell ── */
    #sidebar {
      width: var(--sidebar-w);
      min-height: 100vh;
      background: var(--surface, #0A0E1A);
      border-right: 1px solid var(--border, rgba(255,255,255,0.06));
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0; left: 0; bottom: 0;
      z-index: 100;
      overflow: hidden;
      transition: width .25s ease;
      flex-shrink: 0;
    }
    #sidebar.collapsed { width: var(--sidebar-collapsed); }

    /* ── Logo ── */
    #sidebar .sb-logo {
      display: flex; align-items: center; gap: 10px;
      padding: 18px 16px 16px;
      border-bottom: 1px solid var(--border, rgba(255,255,255,0.06));
      flex-shrink: 0;
      min-height: var(--topbar-h);
    }
    #sidebar .sb-logo-icon {
      width: 32px; height: 32px; border-radius: 9px;
      background: linear-gradient(135deg, var(--accent, #FF6B35), var(--accent2, #FFB347));
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(255,107,53,.35);
    }
    #sidebar .sb-logo-text {
      font-family:  sans-serif; font-size: 15px; font-weight: 800;
      white-space: nowrap;
      background: linear-gradient(135deg, var(--accent, #FF6B35), var(--accent2, #FFB347));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    #sidebar .sb-logo-sub { font-size: 9px; color: var(--text3, #4A5270); white-space: nowrap; }
    #sidebar.collapsed .sb-logo-text,
    #sidebar.collapsed .sb-logo-sub { opacity: 0; }

    /* ── Nav ── */
    #sidebar .sb-nav {
      flex: 1; overflow-y: auto; overflow-x: hidden;
      padding: 10px 0; scrollbar-width: none;
    }
    #sidebar .sb-nav::-webkit-scrollbar { display: none; }

    #sidebar .sb-group-label {
      font-size: 9px; font-family:  sans-serif; font-weight: 700;
      color: var(--text3, #4A5270); text-transform: uppercase; letter-spacing: .6px;
      padding: 10px 16px 5px; white-space: nowrap; overflow: hidden;
      transition: opacity .2s;
    }
    #sidebar.collapsed .sb-group-label { opacity: 0; }

    /* ── Nav items ── */
    #sidebar .sb-item {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 16px; cursor: pointer;
      transition: background .15s;
      position: relative; white-space: nowrap;
      text-decoration: none;
      color: var(--text2, #8A94B0);
    }
    #sidebar .sb-item:hover {
      background: var(--surface2, #0F1525);
      color: var(--text, #F0F4FF);
    }
    #sidebar .sb-item.active {
      background: rgba(255,107,53,.1);
      color: var(--accent, #FF6B35);
      border-right: 2px solid var(--accent, #FF6B35);
    }
    #sidebar .sb-item.active .sb-icon {
      background: rgba(255,107,53,.12);
    }
    #sidebar .sb-item.active .sb-icon svg {
      stroke: var(--accent, #FF6B35);
    }

    /* Tooltip on collapsed hover */
    #sidebar .sb-item::after {
      content: attr(data-tip);
      position: absolute;
      left: calc(var(--sidebar-collapsed) + 8px);
      top: 50%; transform: translateY(-50%);
      background: var(--surface3, #141B2E);
      border: 1px solid var(--border, rgba(255,255,255,.06));
      border-radius: 8px; padding: 5px 10px;
      font-size: 11px; color: var(--text, #F0F4FF);
      white-space: nowrap; pointer-events: none;
      opacity: 0; transition: opacity .15s;
      z-index: 200; box-shadow: 0 4px 16px rgba(0,0,0,.4);
    }
    #sidebar.collapsed .sb-item:hover::after { opacity: 1; }

    /* ── Icon ── */
    #sidebar .sb-icon {
      width: 32px; height: 32px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    #sidebar .sb-icon svg {
      width: 15px; height: 15px; fill: none;
      stroke: var(--text3, #4A5270); stroke-width: 2;
      transition: stroke .15s;
    }
    #sidebar .sb-item:hover .sb-icon svg { stroke: var(--text, #F0F4FF); }

    /* ── Label ── */
    #sidebar .sb-label {
      font-size: 12px; font-weight: 500;
      white-space: nowrap; overflow: hidden;
      transition: opacity .2s;
    }
    #sidebar.collapsed .sb-label { opacity: 0; pointer-events: none; }

    /* ── Badge ── */
    #sidebar .sb-badge {
      margin-left: auto;
      background: var(--accent, #FF6B35);
      border-radius: 50px; padding: 1px 7px;
      font-size: 9px; font-weight: 700;
      color: white; font-family:  sans-serif;
      white-space: nowrap; flex-shrink: 0;
      transition: opacity .2s;
    }
    #sidebar.collapsed .sb-badge { opacity: 0; }

    /* ── Footer ── */
    #sidebar .sb-footer {
      padding: 12px 16px;
      border-top: 1px solid var(--border, rgba(255,255,255,.06));
      display: flex; align-items: center; gap: 10px;
      flex-shrink: 0;
    }
    #sidebar .sb-avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: linear-gradient(135deg, var(--purple, #9B6BFF), var(--blue, #4D9FFF));
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-family:  sans-serif; font-weight: 700;
      flex-shrink: 0;
    }
    #sidebar .sb-user-name {
      font-size: 12px; font-weight: 600;
      white-space: nowrap; transition: opacity .2s;
    }
    #sidebar .sb-user-role {
      font-size: 10px; color: var(--text3, #4A5270);
      transition: opacity .2s;
    }
    #sidebar.collapsed .sb-user-name,
    #sidebar.collapsed .sb-user-role { opacity: 0; }

    /* ── Main content area adjustment ── */
    .main {
      margin-left: var(--sidebar-w) !important;
      width: calc(100vw - var(--sidebar-w)) !important;
      max-width: calc(100vw - var(--sidebar-w)) !important;
      min-width: 0 !important;
      box-sizing: border-box !important;
      overflow-x: hidden;
      transition: margin-left .25s ease, width .25s ease, max-width .25s ease !important;
    }
    .main.sidebar-collapsed {
      margin-left: var(--sidebar-collapsed) !important;
      width: calc(100vw - var(--sidebar-collapsed)) !important;
      max-width: calc(100vw - var(--sidebar-collapsed)) !important;
    }

    /* ── Page transition ── */
    @keyframes adminPageIn {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .main {
      animation: adminPageIn .22s cubic-bezier(.4,0,.2,1) both;
    }
    body.page-leaving { opacity: 0; transition: opacity .18s ease !important; }

    /* ── Mobile overlay ── */
    #sidebarOverlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.55);
      z-index: 99;
      cursor: pointer;
    }
    #sidebarOverlay.visible { display: block; }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      #sidebar {
        transform: translateX(-100%);
        width: var(--sidebar-w) !important;
        transition: transform .3s cubic-bezier(.4,0,.2,1) !important;
        z-index: 300;
      }
      #sidebar.mobile-open { transform: translateX(0); }
      #sidebarOverlay { z-index: 299; }
      .main {
        margin-left: 0 !important;
        width: 100vw !important;
        max-width: 100vw !important;
        transition: none !important;
      }
      .main.sidebar-collapsed {
        margin-left: 0 !important;
        width: 100vw !important;
        max-width: 100vw !important;
      }
    }
  `;

  var styleEl = document.createElement('style');
  styleEl.id = 'admin-sidebar-styles';
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ── 2. Build sidebar HTML ─────────────────── */
  var currentPage = window.location.pathname.split('/').pop() || '';

  function item(page, label, tip, iconSvg, badge) {
    var isActive = (currentPage === page) ? ' active' : '';
    var badgeHtml = badge ? '<span class="sb-badge">' + badge + '</span>' : '';
    return '<a class="sb-item' + isActive + '" href="' + page + '" data-tip="' + tip + '">' +
      '<div class="sb-icon"><svg viewBox="0 0 24 24">' + iconSvg + '</svg></div>' +
      '<span class="sb-label">' + label + '</span>' +
      badgeHtml +
      '</a>';
  }

  var sidebarHTML =
    '<aside class="sidebar" id="sidebar">' +
      '<div class="sb-logo">' +
        '<div class="sb-logo-icon">🎵</div>' +
        '<div>' +
          '<div class="sb-logo-text">Shurafah</div>' +
          '<div class="sb-logo-sub">Admin Panel</div>' +
        '</div>' +
      '</div>' +
      '<nav class="sb-nav">' +

        '<div class="sb-group-label">Main</div>' +
        item('shurafah_admin_dashboard.html', 'Dashboard', 'Dashboard',
          '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>') +

        '<div class="sb-group-label">Content</div>' +
        item('shurafah_song_management.html', 'Song Management', 'Song Management',
          '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>') +
        item('shurafah_admin_artist_management.html', 'Artist Management', 'Artist Management',
          '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>') +
        item('shurafah_admin_categories.html', 'Categories', 'Categories',
          '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>') +
        item('shurafah_admin_featured_trending.html', 'Featured &amp; Trending', 'Featured & Trending',
          '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>') +
        item('shurafah_admin_playlist_management.html', 'Playlist Management', 'Playlist Management',
          '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>') +

        '<div class="sb-group-label">Wa\'azi</div>' +
        item('shurafah_admin_waazi_management.html', 'Wa\'azi Management', 'Wa\'azi Management',
          '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>') +
        item('shurafah_admin_preacher_management.html', 'Preacher Management', 'Preacher Management',
          '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M16 3l1 2 2-1-1 2 2 1-2 1 1 2-2-1-1 2"/>') +
        item('shurafah_admin_waazi_categories.html', 'Wa\'azi Categories', 'Wa\'azi Categories',
          '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="9" y1="13" x2="15" y2="13"/>') +
        item('shurafah_admin_waazi_series.html', 'Wa\'azi Series', 'Wa\'azi Series (Playlists)',
          '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><polyline points="3 5 5 7 3 9"/><polyline points="3 11 5 13 3 15"/><polyline points="3 17 5 19 3 21"/>') +

        '<div class="sb-group-label">Users</div>' +
        item('shurafah_admin_user_management.html', 'User Management', 'User Management',
          '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>') +
        item('shurafah_admin_comments_reports.html', 'Comments &amp; Reports', 'Comments & Reports',
          '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>') +

        '<div class="sb-group-label">Monetisation</div>' +
        item('shurafah_ads_management.html', 'Ads Management', 'Ads Management',
          '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>') +
        item('shurafah_admin_premium_subscriptions.html', 'Premium &amp; Subscriptions', 'Premium & Subscriptions',
          '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>') +

        '<div class="sb-group-label">Analytics</div>' +
        item('shurafah_download_analytics.html', 'Download Analytics', 'Download Analytics',
          '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>') +

        '<div class="sb-group-label">System</div>' +
        item('shurafah_admin_notifications.html', 'Notifications', 'Notifications',
          '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>') +
        item('shurafah_admin_activity_logs.html', 'Activity Logs', 'Activity Logs',
          '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>') +
        item('shurafah_admin_roles.html', 'Admin Roles', 'Admin Roles',
          '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>') +
        item('shurafah_admin_settings.html', 'Settings', 'Settings',
          '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>') +

      '</nav>' +
      '<div class="sb-footer">' +
        '<div class="sb-avatar">SA</div>' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="sb-user-name">Super Admin</div>' +
          '<div class="sb-user-role">Administrator</div>' +
        '</div>' +
      '</div>' +
    '</aside>';

  /* ── 3. Insert sidebar + overlay into DOM ──── */
  var wrapper = document.createElement('div');
  wrapper.innerHTML = sidebarHTML;
  var sidebarEl = wrapper.firstChild;

  var oldSidebar = document.getElementById('sidebar');
  if (oldSidebar) { oldSidebar.parentNode.removeChild(oldSidebar); }

  document.body.insertBefore(sidebarEl, document.body.firstChild);

  var overlayEl = document.createElement('div');
  overlayEl.id = 'sidebarOverlay';
  document.body.appendChild(overlayEl);
  overlayEl.addEventListener('click', closeMobile);

  /* ── 4. Restore collapse state from localStorage ── */
  var collapsed = localStorage.getItem('sidebarCollapsed') === '1';
  if (collapsed && window.innerWidth > 768) {
    sidebarEl.classList.add('collapsed');
    setTimeout(function () {
      var m = document.querySelector('.main');
      if (m) m.classList.add('sidebar-collapsed');
    }, 0);
  }

  /* ── 5. Toggle helpers ─────────────────────── */
  function getMainEl() {
    return document.querySelector('.main') || document.getElementById('mainArea');
  }

  function closeMobile() {
    sidebarEl.classList.remove('mobile-open');
    overlayEl.classList.remove('visible');
  }

  function doToggle() {
    if (window.innerWidth <= 768) {
      var open = sidebarEl.classList.toggle('mobile-open');
      overlayEl.classList.toggle('visible', open);
    } else {
      collapsed = !collapsed;
      sidebarEl.classList.toggle('collapsed', collapsed);
      var mainEl = getMainEl();
      if (mainEl) mainEl.classList.toggle('sidebar-collapsed', collapsed);
      localStorage.setItem('sidebarCollapsed', collapsed ? '1' : '0');
    }
  }

  /* Expose for admin-topbar.js hamburger */
  window._sidebarToggle = doToggle;

  /* Attach to any existing toggle button after DOM is ready */
  setTimeout(function () {
    var btn = document.getElementById('sidebarToggle') ||
              document.querySelector('.topbar-toggle') ||
              document.querySelector('[data-sidebar-toggle]');
    if (btn) {
      var freshBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(freshBtn, btn);
      freshBtn.addEventListener('click', doToggle);
    }
  }, 0);

  /* ── 6. Smooth page-transition on nav clicks ──── */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('#sidebar a.sb-item[href]');
    if (!link) return;
    var href = link.getAttribute('href');
    if (!href || href === '#' || href === window.location.pathname.split('/').pop()) return;
    e.preventDefault();
    document.body.classList.add('page-leaving');
    setTimeout(function () { window.location.href = href; }, 190);
  }, false);

  /* ── 7. Auto-load admin-topbar.js ─────────────── */
  (function () {
    var scripts = document.querySelectorAll('script[src]');
    var base = 'admin-topbar.js';
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].src.indexOf('admin-sidebar.js') !== -1) {
        base = scripts[i].src.replace('admin-sidebar.js', 'admin-topbar.js');
        break;
      }
    }
    if (!document.querySelector('script[src*="admin-topbar.js"]')) {
      var s = document.createElement('script');
      s.src = base;
      document.head.appendChild(s);
    }
  }());

})();
