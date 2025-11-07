// Navbar Component v2.0 - Custom Element
// Unified navigation bar for all Tank Tools pages

class NavbarComponent extends HTMLElement {
  constructor() {
    super();
    this.userName = 'Loading...';
    this.userAvatar = 'U';
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
    this.updateUserInfo();
    console.log('✅ Navbar Component v2.0 mounted');
  }

  render() {
    const title = this.getAttribute('title') || 'Tank Tools';
    const version = this.getAttribute('version') || '1.0';
    const currentPage = this.getAttribute('current-page') || '';
    const showNMOGAS = this.getAttribute('show-nmogas') !== 'false';

    this.innerHTML = `
      <style>
        .nav-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 30px;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(10px);
          border-bottom: 2px solid var(--primary);
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 15px;
          position: relative;
          z-index: 1000;
        }

        .nav-logo {
          font-size: 24px;
          font-weight: bold;
          color: var(--primary);
        }

        .nav-links {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }

        .nav-link {
          color: white;
          text-decoration: none;
          padding: 8px 16px;
          border-radius: 8px;
          transition: all 0.3s ease;
          background: rgba(255,255,255,0.1);
          font-weight: 500;
          border: 1px solid rgba(255,255,255,0.2);
          font-size: 14px;
          cursor: pointer;
        }

        .nav-link:hover {
          background: var(--primary);
          transform: translateY(-1px);
        }

        .nav-link.active {
          background: var(--primary);
          border-color: var(--accent);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .font-controls {
          display: flex;
          gap: 5px;
        }

        .font-btn {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          padding: 6px 10px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          transition: all 0.3s ease;
          min-width: 32px;
          min-height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .font-btn:hover {
          background: rgba(255,255,255,0.2);
          transform: translateY(-1px);
        }

        .theme-switcher {
          position: relative;
          display: inline-block;
        }

        .theme-btn {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 18px;
          transition: all 0.3s ease;
          min-width: 36px;
          min-height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .theme-btn:hover {
          background: rgba(255,255,255,0.2);
          transform: translateY(-1px);
        }

        .theme-dropdown {
          display: none;
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 5px;
          background: rgba(0,0,0,0.9);
          border-radius: 8px;
          min-width: 180px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          z-index: 10000;
          border: 1px solid rgba(255,255,255,0.2);
        }

        .theme-dropdown.show {
          display: block;
          animation: slideDown 0.3s ease;
        }

        .theme-option {
          padding: 10px 15px;
          cursor: pointer;
          color: white;
          transition: all 0.2s ease;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .theme-option:last-child {
          border-bottom: none;
        }

        .theme-option:hover {
          background: rgba(255,255,255,0.1);
        }

        .theme-option.active {
          background: var(--primary);
          font-weight: bold;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(45deg, var(--primary), var(--secondary));
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
          color: white;
          border: 2px solid var(--accent);
        }

        .user-name {
          background: rgba(255,255,255,0.1);
          padding: 6px 12px;
          border-radius: 5px;
          border: 1px solid rgba(255,255,255,0.2);
          font-size: 14px;
          color: white;
        }

        .logout-btn {
          background: rgba(255,0,0,0.3);
          color: white;
          border: 1px solid rgba(255,0,0,0.5);
          padding: 6px 12px;
          border-radius: 5px;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 14px;
        }

        .logout-btn:hover {
          background: rgba(255,0,0,0.5);
          transform: translateY(-2px);
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .nav-bar {
            padding: 10px 15px;
          }

          .nav-links {
            gap: 5px;
          }

          .nav-link {
            padding: 6px 10px;
            font-size: 12px;
          }
        }

        @media (max-width: 480px) {
          .nav-bar {
            padding: 8px 10px;
          }

          .nav-logo {
            font-size: 16px;
          }

          .nav-link {
            padding: 4px 6px;
            font-size: 10px;
          }

          .user-avatar {
            width: 28px;
            height: 28px;
            font-size: 12px;
          }

          .user-name {
            font-size: 11px;
            padding: 3px 6px;
          }

          .logout-btn {
            font-size: 11px;
            padding: 3px 6px;
          }
        }
      </style>

      <div class="nav-bar">
        <div class="nav-logo">${title} v${version}</div>
        <div class="nav-links">
          <a href="index.html" class="nav-link ${currentPage === 'pbcr' ? 'active' : ''}" id="pbcr-link">🛢️ PBCR</a>
          <a href="plcr.html" class="nav-link ${currentPage === 'plcr' ? 'active' : ''}" id="plcr-link">⚗️ PLCR</a>
          ${showNMOGAS ? `<a href="NMOGASBL.html" class="nav-link ${currentPage === 'nmogas' ? 'active' : ''}" id="nmogas-link">🔧 NMOGAS</a>` : ''}
          <a href="live-tanks.html" class="nav-link ${currentPage === 'live-tanks' ? 'active' : ''}" id="live-tanks-link">🔴 Live Tanks</a>
          <a href="vacation-planner.html" class="nav-link ${currentPage === 'vacation' ? 'active' : ''}" id="vacation-link">🏖️ Vacation Planner</a>
          <a href="shift-roster.html" class="nav-link ${currentPage === 'shift-roster' ? 'active' : ''}" id="shift-link">📅 Shift Roster</a>
          <a href="dashboard.html" class="nav-link ${currentPage === 'dashboard' ? 'active' : ''}" id="dashboard-link">📊 Dashboard</a>
        </div>
        <div class="user-info">
          <div class="font-controls">
            <button class="font-btn" id="decreaseFontBtn" title="تصغير الخط">-</button>
            <button class="font-btn" id="increaseFontBtn" title="تكبير الخط">+</button>
          </div>
          <div class="theme-switcher">
            <button class="theme-btn" id="themeBtn" title="Change Theme">🎨</button>
            <div class="theme-dropdown" id="themeDropdown">
              <div class="theme-option" data-theme="industrial">🏭 Industrial Bronze</div>
              <div class="theme-option" data-theme="ocean">🌊 Ocean Blue</div>
              <div class="theme-option" data-theme="dark">⚫ Dark Carbon</div>
              <div class="theme-option" data-theme="sunset">🌅 Sunset Amber</div>
              <div class="theme-option" data-theme="forest">🌲 Forest Green</div>
            </div>
          </div>
          <div class="user-avatar" id="userAvatar">U</div>
          <span class="user-name" id="userName">Loading...</span>
          <button class="logout-btn" id="logoutBtn">🚪 Logout</button>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    // Font controls
    this.querySelector('#decreaseFontBtn')?.addEventListener('click', () => {
      if (typeof decreaseFontSize === 'function') decreaseFontSize();
    });

    this.querySelector('#increaseFontBtn')?.addEventListener('click', () => {
      if (typeof increaseFontSize === 'function') increaseFontSize();
    });

    // Theme switcher
    const themeBtn = this.querySelector('#themeBtn');
    const themeDropdown = this.querySelector('#themeDropdown');

    themeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      themeDropdown?.classList.toggle('show');
    });

    // Theme options
    this.querySelectorAll('.theme-option').forEach(option => {
      option.addEventListener('click', () => {
        const theme = option.getAttribute('data-theme');
        if (typeof setTheme === 'function') {
          setTheme(theme);
        }
        themeDropdown?.classList.remove('show');
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.contains(e.target)) {
        themeDropdown?.classList.remove('show');
      }
    });

    // Logout button
    this.querySelector('#logoutBtn')?.addEventListener('click', () => {
      if (typeof handleLogout === 'function') {
        handleLogout();
      } else if (typeof FirebaseAuthHandler !== 'undefined' && FirebaseAuthHandler.logout) {
        FirebaseAuthHandler.logout();
      } else {
        console.error('No logout handler found');
      }
    });
  }

  updateUserInfo() {
    const checkUser = setInterval(() => {
      if (window.currentUser) {
        const userName = window.currentUser.name || window.currentUser.username || 'User';
        const userAvatar = (window.currentUser.name || window.currentUser.username || 'U').charAt(0).toUpperCase();

        const userNameEl = this.querySelector('#userName');
        const avatarEl = this.querySelector('#userAvatar');

        if (userNameEl) userNameEl.textContent = userName;
        if (avatarEl) avatarEl.textContent = userAvatar;

        clearInterval(checkUser);
      }
    }, 100);
  }
}

// Register the custom element
customElements.define('navbar-component', NavbarComponent);
