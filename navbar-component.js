// Navbar Component v1.0
// Unified navigation bar for all Tank Tools pages

class NavbarComponent {
  constructor(config) {
    this.config = {
      title: config.title || 'Tank Tools',
      version: config.version || '1.0',
      currentPage: config.currentPage || '',
      showNMOGAS: config.showNMOGAS !== false, // default true
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
      { href: 'NMOGASBL.html', icon: '🔧', text: 'NMOGAS', id: 'nmogas-link', hidden: !this.config.showNMOGAS },
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
        <button class="logout-btn" onclick="window.NavbarComponent.handleLogout()">🚪 Logout</button>
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
    const userAvatarEl = document.getElementById('userAvatar');
    
    if (userNameEl) userNameEl.textContent = this.userName;
    if (userAvatarEl) userAvatarEl.textContent = this.userAvatar;
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
    
    console.log('✅ Navbar Component v1.0 mounted');
  }
}

// Export for use
window.NavbarComponent = NavbarComponent;
