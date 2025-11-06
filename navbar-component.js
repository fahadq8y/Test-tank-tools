// Navbar Component v1.5 - Complete Vacation Planner Layout
// Unified navigation bar for all Tank Tools pages

class NavbarComponent {
  constructor(config = {}) {
    // Set showNMOGAS first before calling getDefaultLinks
    this.showNMOGAS = config.showNMOGAS !== false; // default true
    
    this.config = {
      title: config.title || 'Tank Tools',
      version: config.version || '1.0',
      currentPage: config.currentPage || '',
      showNMOGAS: this.showNMOGAS,
      links: config.links || this.getDefaultLinks(),
      onLogout: config.onLogout || this.defaultLogout
    };
    
    this.userName = 'Loading...';
    this.userAvatar = 'U';
  }
  
  getDefaultLinks() {
    return [
      { href: 'index.html', icon: '🛢️', text: 'PBCR', id: 'pbcr-link' },
      { href: 'plcr.html', icon: '⚗️', text: 'PLCR', id: 'plcr-link' },
      { href: 'NMOGASBL.html', icon: '🔧', text: 'NMOGAS', id: 'nmogas-link', hidden: !this.showNMOGAS },
      { href: 'live-tanks.html', icon: '🔴', text: 'Live Tanks', id: 'live-tanks-link' },
      { href: 'vacation-planner.html', icon: '🏖️', text: 'Vacation Planner', id: 'vacation-link' },
      { href: 'shift-roster.html', icon: '📅', text: 'Shift Roster', id: 'shift-link' },
      { href: 'dashboard.html', icon: '📊', text: 'Dashboard', id: 'dashboard-link' }
    ];
  }
  
  render() {
    const navbar = document.createElement('div');
    navbar.className = 'nav-bar';
    navbar.innerHTML = `
      <div class="nav-logo">${this.config.title} v${this.config.version}</div>
      <div class="nav-links">
        ${this.renderLinks()}
      </div>
      <div class="user-info">
        <div class="font-controls">
          <button class="font-btn" onclick="decreaseFontSize()" title="تصغير الخط">-</button>
          <button class="font-btn" onclick="increaseFontSize()" title="تكبير الخط">+</button>
        </div>
        <div class="theme-switcher">
          <button class="theme-btn" onclick="toggleThemeDropdown()" title="Change Theme">🎨</button>
          <div class="theme-dropdown" id="themeDropdown">
            <div class="theme-option" data-theme="industrial" onclick="setTheme('industrial')">🏭 Industrial Bronze</div>
            <div class="theme-option" data-theme="ocean" onclick="setTheme('ocean')">🌊 Ocean Blue</div>
            <div class="theme-option" data-theme="dark" onclick="setTheme('dark')">⚫ Dark Carbon</div>
            <div class="theme-option" data-theme="sunset" onclick="setTheme('sunset')">🌅 Sunset Amber</div>
            <div class="theme-option" data-theme="forest" onclick="setTheme('forest')">🌲 Forest Green</div>
          </div>
        </div>
        <div class="user-avatar" id="userAvatar">${this.userAvatar}</div>
        <span class="user-name" id="userName">${this.userName}</span>
        <button class="logout-btn" onclick="window.NavbarComponent.handleLogout()">
          <span class="logout-icon">🚪</span>
          <span class="logout-text">Logout</span>
        </button>
      </div>
    `;
    
    return navbar;
  }
  
  renderLinks() {
    return this.config.links
      .filter(link => !link.hidden)
      .map(link => {
        const activeClass = this.config.currentPage === link.id ? 'active' : '';
        const style = link.hidden ? 'style="display:none"' : '';
        return `<a href="${link.href}" class="nav-link ${activeClass}" id="${link.id}" ${style}>${link.icon} ${link.text}</a>`;
      })
      .join('');
  }
  
  updateUserInfo(userData) {
    this.userName = userData.name || userData.username || 'User';
    this.userAvatar = (userData.name || userData.username || 'U').charAt(0).toUpperCase();
    
    const userNameEl = document.getElementById('userName');
    const avatarEl = document.getElementById('userAvatar');
    
    if (userNameEl) userNameEl.textContent = this.userName;
    if (avatarEl) avatarEl.textContent = this.userAvatar;
  }
  
  handleLogout() {
    if (this.config.onLogout) {
      this.config.onLogout();
    } else {
      this.defaultLogout();
    }
  }
  
  defaultLogout() {
    if (typeof handleLogout === 'function') {
      handleLogout();
    } else if (typeof FirebaseAuthHandler !== 'undefined' && FirebaseAuthHandler.logout) {
      FirebaseAuthHandler.logout();
    } else {
      console.error('No logout handler found');
    }
  }
  
  mount(targetSelector = 'body') {
    const target = document.querySelector(targetSelector);
    if (!target) {
      console.error('Navbar mount target not found:', targetSelector);
      return;
    }
    
    const navbar = this.render();
    
    // Insert at the beginning of target
    if (target.firstChild) {
      target.insertBefore(navbar, target.firstChild);
    } else {
      target.appendChild(navbar);
    }
    
    // Store instance globally for logout button
    window.NavbarComponent = this;
    
    console.log('✅ Navbar Component v1.5 mounted');
  }
}

// Export for use
window.NavbarComponent = NavbarComponent;


// Professional Avatar Styles
const avatarStyles = document.createElement('style');
avatarStyles.textContent = `
/* User Profile - Removed, using simple layout like Vacation Planner */

/* User Avatar - Vacation Planner Style */
.user-avatar {
  width: 32px !important;
  height: 32px !important;
  border-radius: 50%;
  background: linear-gradient(45deg, var(--primary, #B8860B), var(--secondary, #8B4513)) !important;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  color: white;
  border: 2px solid var(--accent, #CD853F) !important;
  transition: all 0.3s ease;
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* User Name - Vacation Planner Style */
.user-name {
  background: rgba(255,255,255,0.1);
  padding: 6px 12px;
  border-radius: 5px;
  border: 1px solid rgba(255,255,255,0.2);
  font-size: 14px;
  color: white;
}

/* Logout Button Enhanced */
.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
  min-width: 48px;
  min-height: 48px;
}

.logout-btn:hover {
  background: linear-gradient(135deg, #c82333 0%, #bd2130 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(220, 53, 69, 0.4);
}

.logout-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
}

.logout-icon {
  font-size: 18px;
}

.logout-text {
  font-size: 14px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .user-profile {
    padding: 5px 10px;
    gap: 8px;
  }
  
  .user-avatar {
    width: 28px !important;
    height: 28px !important;
    font-size: 12px;
  }
  
  .user-name {
    font-size: 12px;
  }
  
  .user-status {
    font-size: 9px;
  }
  
  .logout-text {
    display: none;
  }
  
  .logout-btn {
    padding: 8px;
    min-width: 40px;
    min-height: 40px;
  }
}
`;

// Inject styles only once
if (!document.getElementById('navbar-avatar-styles')) {
  avatarStyles.id = 'navbar-avatar-styles';
  document.head.appendChild(avatarStyles);
}
