// Navbar Component v1.3 - Improved Avatar Design
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
        <div class="user-profile">
          <div class="user-avatar-wrapper">
            <div class="user-avatar" id="userAvatar">
              <span class="avatar-letter">${this.userAvatar}</span>
              <div class="avatar-ring"></div>
            </div>
          </div>
          <div class="user-details">
            <span class="user-name" id="userName">${this.userName}</span>
            <span class="user-status">Online</span>
          </div>
        </div>
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
    const avatarLetterEl = document.querySelector('.avatar-letter');
    
    if (userNameEl) userNameEl.textContent = this.userName;
    if (avatarLetterEl) avatarLetterEl.textContent = this.userAvatar;
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
    
    console.log('✅ Navbar Component v1.2 mounted');
  }
}

// Export for use
window.NavbarComponent = NavbarComponent;


// Professional Avatar Styles
const avatarStyles = document.createElement('style');
avatarStyles.textContent = `
/* User Profile Container */
.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50px;
  border: 1px solid rgba(255, 215, 0, 0.2);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.user-profile:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 215, 0, 0.4);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.2);
}

/* Avatar Wrapper */
.user-avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

/* Avatar Circle - Smaller & More Compact */
.user-avatar {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 2px 8px rgba(255, 215, 0, 0.4),
    inset 0 1px 2px rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.user-avatar:hover {
  transform: scale(1.08);
  box-shadow: 
    0 4px 12px rgba(255, 215, 0, 0.5),
    inset 0 1px 2px rgba(255, 255, 255, 0.4);
}

/* Avatar Letter */
.avatar-letter {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  z-index: 2;
}

/* Animated Ring - Removed for cleaner look */
.avatar-ring {
  display: none;
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* User Details - More Compact */
.user-details {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: #FFD700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-status {
  font-size: 10px;
  color: #90EE90;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.user-status::before {
  content: '';
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #90EE90;
  box-shadow: 0 0 6px #90EE90;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
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
    width: 32px;
    height: 32px;
  }
  
  .avatar-letter {
    font-size: 14px;
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
