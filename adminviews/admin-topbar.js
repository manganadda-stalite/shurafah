(function () {
  'use strict';

  /* ── 1. Apply saved theme before first paint (no flash) ── */
  if (localStorage.getItem('adminTheme') === 'light') {
    document.documentElement.classList.add('light-mode');
  }

  /* ── 2. CSS ──────────────────────────────────────────── */
  var css = `
    /* Light mode variable overrides */
    html.light-mode {
      --bg:      #F0F2F8 !important; --surface: #FFFFFF !important;
      --surface2:#F4F6FA !important; --surface3:#ECEEF5 !important;
      --surface4:#E0E3ED !important; --text:    #1A1D2E !important;
      --text2:   #4A5270 !important; --text3:   #8A94B0 !important;
      --border:  rgba(0,0,0,0.08) !important;
      --border2: rgba(0,0,0,0.12) !important;
    }

    /* ── Topbar shell ── */
    .admin-topbar {
      height: 60px; min-height: 60px; flex-shrink: 0;
      background: var(--surface, #0A0E1A);
      border-bottom: 1px solid var(--border, rgba(255,255,255,0.06));
      display: flex; align-items: center;
      padding: 0 20px 0 14px; gap: 10px;
      position: sticky; top: 0; z-index: 90;
      overflow: visible;
    }

    /* Hamburger toggle */
    .atb-hamburger {
      width: 36px; height: 36px; flex-shrink: 0;
      background: transparent; border: none; cursor: pointer; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      color: var(--text2, #8A94B0); transition: background .15s, color .15s;
    }
    .atb-hamburger:hover { background: var(--surface2, #111828); color: var(--text, #F0F4FF); }
    .atb-hamburger svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; pointer-events: none; }

    /* Spacer */
    .atb-spacer { flex: 1; min-width: 8px; }

    /* Search bar */
    .atb-search {
      display: flex; align-items: center; gap: 7px;
      background: var(--surface2, #111828); border: 1px solid var(--border, rgba(255,255,255,.06));
      border-radius: 10px; padding: 0 12px; height: 36px;
      min-width: 200px; max-width: 300px; flex: 0 1 260px;
      transition: border-color .15s;
    }
    .atb-search:focus-within { border-color: var(--accent, #FF6B35); }
    .atb-search svg { width: 13px; height: 13px; fill: none; stroke: var(--text3, #4A5270); stroke-width: 2; flex-shrink: 0; pointer-events: none; }
    .atb-search input { background: none; border: none; outline: none; font-size: 12px; color: var(--text, #F0F4FF); width: 100%; font-family: 'DM Sans', sans-serif; }
    .atb-search input::placeholder { color: var(--text3, #4A5270); }

    /* Right cluster — never wraps, never shrinks */
    .atb-cluster {
      display: flex; align-items: center; gap: 4px;
      flex-shrink: 0; flex-wrap: nowrap;
    }

    /* Divider */
    .atb-divider { width: 1px; height: 22px; background: var(--border2, rgba(255,255,255,.1)); flex-shrink: 0; margin: 0 6px; }

    /* Generic icon button */
    .atb-btn {
      width: 36px; height: 36px; flex-shrink: 0;
      background: transparent; border: none; cursor: pointer; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      color: var(--text2, #8A94B0);
      transition: background .15s, color .15s;
    }
    .atb-btn:hover, .atb-btn.active { background: var(--surface2, #111828); color: var(--text, #F0F4FF); }
    .atb-btn svg { width: 17px; height: 17px; fill: none; stroke: currentColor; stroke-width: 2; pointer-events: none; }

    /* Notification dot on bell */
    .atb-ndot {
      position: absolute; top: 7px; right: 7px;
      width: 7px; height: 7px; border-radius: 50%;
      background: var(--accent, #FF6B35);
      border: 1.5px solid var(--surface, #0A0E1A);
      pointer-events: none;
    }

    /* Dark/light icon swap */
    html:not(.light-mode) .atb-icon-sun  { display: none; }
    html.light-mode       .atb-icon-moon { display: none; }

    /* Dropdown wrapper — the trigger + panel live here */
    .atb-dw {
      position: relative;
      display: flex; align-items: center;
    }

    /* Dropdown panel — anchored to its .atb-dw parent */
    @keyframes atbPanelIn {
      from { opacity: 0; transform: translateY(-8px) scale(.97); }
      to   { opacity: 1; transform: translateY(0)   scale(1); }
    }
    .atb-panel {
      position: absolute; top: calc(100% + 10px); right: 0;
      background: var(--surface2, #111828);
      border: 1px solid var(--border2, rgba(255,255,255,.1));
      border-radius: 14px;
      box-shadow: 0 20px 60px rgba(0,0,0,.6);
      z-index: 9999; display: none; overflow: hidden;
      animation: atbPanelIn .15s ease;
      min-width: 300px;
    }
    .atb-panel.open { display: block; }

    /* User chip trigger */
    .atb-user-chip {
      display: flex; align-items: center; gap: 8px;
      padding: 4px 8px 4px 4px; border-radius: 10px; cursor: pointer;
      transition: background .15s; flex-shrink: 0;
    }
    .atb-user-chip:hover, .atb-user-chip.active { background: var(--surface2, #111828); }
    .atb-user-av {
      width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg, var(--purple, #9B6BFF), var(--blue, #4D9FFF));
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; font-family:  sans-serif; color: #fff;
      pointer-events: none;
    }
    .atb-user-name { font-size: 12px; font-weight: 600; white-space: nowrap; color: var(--text, #F0F4FF); pointer-events: none; }

    /* ── Notification panel content ── */
    .atp-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 16px 10px; border-bottom: 1px solid var(--border, rgba(255,255,255,.06));
    }
    .atp-header-title { font-size: 13px; font-weight: 700; font-family:  sans-serif; color: var(--text, #F0F4FF); }
    .atp-mark-all { font-size: 10px; color: var(--accent, #FF6B35); cursor: pointer; background: none; border: none; font-family: 'DM Sans', sans-serif; padding: 0; }
    .atp-mark-all:hover { text-decoration: underline; }
    .atp-notif-item {
      display: flex; align-items: flex-start; gap: 10px;
      padding: 11px 16px; cursor: pointer; transition: background .12s;
      border-bottom: 1px solid var(--border, rgba(255,255,255,.04));
      text-decoration: none; color: inherit;
    }
    .atp-notif-item:last-of-type { border-bottom: none; }
    .atp-notif-item:hover { background: var(--surface3, #182035); }
    .atp-ni-icon { width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 14px; }
    .atp-ni-body { flex: 1; min-width: 0; }
    .atp-ni-title { font-size: 12px; font-weight: 600; color: var(--text, #F0F4FF); margin-bottom: 2px; line-height: 1.35; }
    .atp-ni-sub   { font-size: 11px; color: var(--text3, #4A5270); }
    .atp-ni-time  { font-size: 10px; color: var(--text3, #4A5270); white-space: nowrap; flex-shrink: 0; }
    .atp-view-all { display: block; text-align: center; padding: 11px; font-size: 11px; font-weight: 600; color: var(--accent, #FF6B35); border-top: 1px solid var(--border, rgba(255,255,255,.06)); transition: background .12s; text-decoration: none; }
    .atp-view-all:hover { background: var(--surface3, #182035); }

    /* ── User panel content ── */
    .atp-user-head { display: flex; align-items: center; gap: 12px; padding: 16px; border-bottom: 1px solid var(--border, rgba(255,255,255,.06)); }
    .atp-u-av { width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0; background: linear-gradient(135deg, var(--purple, #9B6BFF), var(--blue, #4D9FFF)); display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700; font-family:  sans-serif; color: #fff; }
    .atp-u-name { font-size: 13px; font-weight: 700; color: var(--text, #F0F4FF); font-family:  sans-serif; }
    .atp-u-role { font-size: 10px; color: var(--text3, #4A5270); margin-top: 2px; }
    .atp-menu-item { display: flex; align-items: center; gap: 10px; padding: 10px 16px; cursor: pointer; transition: background .12s; font-size: 12px; color: var(--text2, #8A94B0); text-decoration: none; }
    .atp-menu-item:hover { background: var(--surface3, #182035); color: var(--text, #F0F4FF); }
    .atp-menu-item svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 2; flex-shrink: 0; pointer-events: none; }
    .atp-menu-item.danger { color: var(--red, #FF4444); }
    .atp-menu-item.danger:hover { background: rgba(255,68,68,.08); }
    .atp-sep { height: 1px; background: var(--border, rgba(255,255,255,.06)); margin: 4px 0; }

    /* Hide any leftover page topbars */
    .admin-topbar ~ .topbar,
    .admin-topbar ~ .header { display: none !important; }

    /* Responsive */
    @media (max-width: 900px) { .atb-search { display: none !important; } }
    @media (max-width: 600px) {
      .atb-user-name { display: none; }
      .admin-topbar  { padding: 0 12px 0 10px; gap: 6px; }
      .atb-panel     { min-width: 260px; right: -10px; }
    }
  `;

  var styleEl = document.createElement('style');
  styleEl.id = 'admin-topbar-styles';
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ── 3. Build topbar after DOM is fully parsed ─── */
  setTimeout(buildTopbar, 0);

  /* ─────────────────────────────────────────────── */
  function buildTopbar() {
    var main = document.querySelector('.main');
    if (!main) return;

    /* Remove old inline topbar */
    var old = main.querySelector('.topbar, .header');
    if (old) old.remove();

    var el = document.createElement('div');
    el.id = 'adminTopbar';
    el.className = 'admin-topbar';
    el.innerHTML =

      /* ── Hamburger ── */
      '<button class="atb-hamburger" id="atbHamburger" aria-label="Toggle sidebar">' +
        '<svg viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>' +
      '</button>' +

      /* ── Spacer pushes everything right ── */
      '<div class="atb-spacer"></div>' +

      /* ── Search ── */
      '<div class="atb-search">' +
        '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
        '<input type="text" placeholder="Search anything\u2026">' +
      '</div>' +

      /* ── Right cluster ── */
      '<div class="atb-cluster">' +

        /* Dark / light mode */
        '<button class="atb-btn" id="atbDarkBtn" title="Toggle light / dark mode">' +
          '<svg class="atb-icon-moon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>' +
          '<svg class="atb-icon-sun"  viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>' +
        '</button>' +

        /* ── Notification wrapper (button + dropdown sibling) ── */
        '<div class="atb-dw" id="atbNotifWrap">' +
          '<button class="atb-btn" id="atbNotifBtn" title="Notifications" style="position:relative;">' +
            '<svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>' +
            '<span class="atb-ndot" id="atbNdot"></span>' +
          '</button>' +
          '<div class="atb-panel" id="atbNotifPanel">' +
            '<div class="atp-header">' +
              '<span class="atp-header-title">Notifications</span>' +
              '<button class="atp-mark-all" id="atbMarkAll">Mark all read</button>' +
            '</div>' +
            notifItem('\uD83C\uDFB5', 'rgba(255,107,53,.15)', 'New song uploaded', '"Summer Vibes" by DJ Storm', '2 min ago', 'shurafah_song_management.html') +
            notifItem('\u26A0\uFE0F', 'rgba(255,77,143,.15)', 'User report', 'Inappropriate content flagged in comments', '18 min ago', 'shurafah_admin_comments_reports.html') +
            notifItem('\u2705', 'rgba(46,204,143,.15)', 'System', 'Database backup completed successfully', '1 hour ago', '') +
            '<a class="atp-view-all" href="shurafah_admin_notifications.html">View all notifications \u2192</a>' +
          '</div>' +
        '</div>' +

        '<div class="atb-divider"></div>' +

        /* ── User chip wrapper (chip + dropdown sibling) ── */
        '<div class="atb-dw" id="atbUserWrap">' +
          '<div class="atb-user-chip" id="atbUserChip">' +
            '<div class="atb-user-av">SA</div>' +
            '<span class="atb-user-name">Super Admin</span>' +
          '</div>' +
          '<div class="atb-panel" id="atbUserPanel">' +
            '<div class="atp-user-head">' +
              '<div class="atp-u-av">SA</div>' +
              '<div><div class="atp-u-name">Super Admin</div><div class="atp-u-role">Administrator</div></div>' +
            '</div>' +
            '<a class="atp-menu-item" href="shurafah_admin_settings.html">' +
              '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>' +
              'Settings' +
            '</a>' +
            '<a class="atp-menu-item" href="shurafah_admin_activity_logs.html">' +
              '<svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>' +
              'Activity Logs' +
            '</a>' +
            '<a class="atp-menu-item" href="shurafah_admin_roles.html">' +
              '<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' +
              'Admin Roles' +
            '</a>' +
            '<div class="atp-sep"></div>' +
            '<div class="atp-menu-item danger" id="atbSignOut">' +
              '<svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>' +
              'Sign Out' +
            '</div>' +
          '</div>' +
        '</div>' +

      '</div>'; /* end .atb-cluster */

    main.insertBefore(el, main.firstChild);
    wireEvents();
  }

  /* ── Notification item helper ── */
  function notifItem(icon, bg, title, sub, time, href) {
    var tag = href ? 'a' : 'div';
    var attr = href ? ' href="' + href + '"' : '';
    return '<' + tag + ' class="atp-notif-item"' + attr + '>' +
      '<div class="atp-ni-icon" style="background:' + bg + '">' + icon + '</div>' +
      '<div class="atp-ni-body"><div class="atp-ni-title">' + title + '</div><div class="atp-ni-sub">' + sub + '</div></div>' +
      '<div class="atp-ni-time">' + time + '</div>' +
    '</' + tag + '>';
  }

  /* ── Event wiring ────────────────────────────── */
  function wireEvents() {
    /* Hamburger → sidebar toggle */
    document.getElementById('atbHamburger').addEventListener('click', function () {
      if (typeof window._sidebarToggle === 'function') window._sidebarToggle();
    });

    /* Dark mode toggle */
    document.getElementById('atbDarkBtn').addEventListener('click', function (e) {
      e.stopPropagation();
      var isLight = document.documentElement.classList.toggle('light-mode');
      localStorage.setItem('adminTheme', isLight ? 'light' : 'dark');
    });

    /* Refs */
    var notifBtn   = document.getElementById('atbNotifBtn');
    var notifPanel = document.getElementById('atbNotifPanel');
    var userChip   = document.getElementById('atbUserChip');
    var userPanel  = document.getElementById('atbUserPanel');
    var ndot       = document.getElementById('atbNdot');

    /* Notifications toggle */
    notifBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var opening = !notifPanel.classList.contains('open');
      closeAll();
      if (opening) { notifPanel.classList.add('open'); notifBtn.classList.add('active'); }
    });

    /* Mark all read */
    document.getElementById('atbMarkAll').addEventListener('click', function (e) {
      e.stopPropagation();
      if (ndot) ndot.style.display = 'none';
      this.textContent = 'All read \u2713';
      this.style.color = 'var(--green, #2ECC8F)';
    });

    /* User chip toggle */
    userChip.addEventListener('click', function (e) {
      e.stopPropagation();
      var opening = !userPanel.classList.contains('open');
      closeAll();
      if (opening) { userPanel.classList.add('open'); userChip.classList.add('active'); }
    });

    /* Sign out */
    document.getElementById('atbSignOut').addEventListener('click', function (e) {
      e.stopPropagation();
      if (confirm('Sign out of Shurafah Admin?')) {
        closeAll();
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity .3s';
        setTimeout(function () { window.location.href = 'shurafah_admin_dashboard.html'; }, 300);
      }
    });

    /* Close on any outside click */
    document.addEventListener('click', function (e) {
      if (!e.target.closest('#atbNotifWrap') && !e.target.closest('#atbUserWrap')) {
        closeAll();
      }
    }, true);
  }

  function closeAll() {
    ['atbNotifPanel', 'atbUserPanel'].forEach(function (id) {
      var p = document.getElementById(id);
      if (p) p.classList.remove('open');
    });
    var nb = document.getElementById('atbNotifBtn');
    var uc = document.getElementById('atbUserChip');
    if (nb) nb.classList.remove('active');
    if (uc) uc.classList.remove('active');
  }

  /* ── Prefetch sidebar pages after load for instant navigation ── */
  setTimeout(function () {
    document.querySelectorAll('#sidebar a.sb-item[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || href === '#') return;
      var l = document.createElement('link');
      l.rel = 'prefetch'; l.href = href;
      document.head.appendChild(l);
    });
  }, 1500);

}());
