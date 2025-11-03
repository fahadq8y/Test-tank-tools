/**
 * 🔐 Tank Tools - Unified Permissions System
 * Developer: Fahad - 17877
 * Version: 2.0 - Simplified and Unified (Backward Compatible)
 * Date: 2025-11-03
 */

// ✅ Permission definitions for each specialization
const PERMISSIONS = {
  'admin': {
    pages: ['all'],
    features: ['all']
  },
  'supervisor': {
    pages: ['index.html', 'plcr.html', 'nmogas.html', 'live-tanks.html', 'dashboard.html'],
    features: ['view_all', 'edit_tanks', 'view_dashboard']
  },
  'planning': {
    pages: ['index.html', 'plcr.html', 'nmogas.html', 'dashboard.html'],
    features: ['view_all', 'add_tanks', 'edit_tanks']
  },
  'control_panel': {
    pages: ['index.html', 'plcr.html', 'nmogas.html', 'live-tanks.html', 'tank-management.html', 'dashboard.html'],
    features: ['view_all', 'add_to_live_tanks', 'edit_live_tanks', 'delete_live_tanks']
  },
  'field_operator': {
    pages: ['index.html', 'plcr.html', 'dashboard.html'],
    features: ['view_assigned', 'update_level']
  }
};

/**
 * Check if user has permission to access a page
 * @param {Object} user - User object with specialization or role
 * @param {string} pageName - Page file name (e.g., 'index.html')
 * @returns {boolean}
 */
function hasPageAccess(user, pageName) {
  if (!user) {
    return false;
  }
  
  // ✅ Support new system (specialization)
  if (user.specialization) {
    const perms = PERMISSIONS[user.specialization];
    if (perms) {
      if (perms.pages.includes('all')) {
        return true;
      }
      return perms.pages.includes(pageName);
    }
  }
  
  // ✅ Support old system (role) - for existing users
  if (user.role) {
    const roleMapping = {
      'admin': 'admin',
      'supervisor': 'supervisor',
      'planning': 'planning',
      'panel_operator': 'control_panel',
      'operator': 'field_operator'
    };
    const mappedSpec = roleMapping[user.role];
    if (mappedSpec) {
      const perms = PERMISSIONS[mappedSpec];
      if (perms) {
        if (perms.pages.includes('all')) {
          return true;
        }
        return perms.pages.includes(pageName);
      }
    }
  }
  
  return false;
}

/**
 * Check if user has a specific feature permission
 * @param {Object} user - User object with specialization or role
 * @param {string} feature - Feature name
 * @returns {boolean}
 */
function hasFeatureAccess(user, feature) {
  if (!user) {
    return false;
  }
  
  // ✅ Support new system (specialization)
  if (user.specialization) {
    const perms = PERMISSIONS[user.specialization];
    if (perms) {
      if (perms.features.includes('all')) {
        return true;
      }
      return perms.features.includes(feature);
    }
  }
  
  // ✅ Support old system (role) - for existing users
  if (user.role) {
    const roleMapping = {
      'admin': 'admin',
      'supervisor': 'supervisor',
      'planning': 'planning',
      'panel_operator': 'control_panel',
      'operator': 'field_operator'
    };
    const mappedSpec = roleMapping[user.role];
    if (mappedSpec) {
      const perms = PERMISSIONS[mappedSpec];
      if (perms) {
        if (perms.features.includes('all')) {
          return true;
        }
        return perms.features.includes(feature);
      }
    }
  }
  
  return false;
}

/**
 * Get current page name
 * @returns {string}
 */
function getCurrentPageName() {
  const path = window.location.pathname;
  return path.split('/').pop() || 'index.html';
}

/**
 * Check page access and redirect if unauthorized
 * @param {Object} user - User object with specialization
 */
function checkPagePermissions(user) {
  const currentPage = getCurrentPageName();
  
  // Allow login page without auth
  if (currentPage === 'login.html') {
    return;
  }
  
  if (!hasPageAccess(user, currentPage)) {
    alert('ليس لديك صلاحية للدخول إلى هذه الصفحة');
    window.location.href = 'index.html';
  }
}

/**
 * Apply UI permissions based on user features
 * @param {Object} user - User object with specialization
 */
function applyUIPermissions(user) {
  // Show/hide Live Tanks button
  const liveTanksBtn = document.getElementById('live-tanks-link') || 
                       document.querySelector('a[href="live-tanks.html"]');
  if (liveTanksBtn) {
    liveTanksBtn.style.display = hasPageAccess(user, 'live-tanks.html') ? '' : 'none';
  }
  
  // Show/hide Add to Live Tanks button
  const addToLiveTanksBtn = document.getElementById('add-to-live-tanks-btn');
  if (addToLiveTanksBtn) {
    addToLiveTanksBtn.style.display = hasFeatureAccess(user, 'add_to_live_tanks') ? '' : 'none';
  }
  
  // Show/hide Dashboard link
  const dashboardLink = document.getElementById('dashboard-link') ||
                        document.querySelector('a[href="dashboard.html"]');
  if (dashboardLink) {
    dashboardLink.style.display = hasPageAccess(user, 'dashboard.html') ? '' : 'none';
  }
  
  // Show/hide Tank Management link
  const tankMgmtLink = document.querySelector('a[href="tank-management.html"]');
  if (tankMgmtLink) {
    tankMgmtLink.style.display = hasPageAccess(user, 'tank-management.html') ? '' : 'none';
  }
}

/**
 * Format specialization name for display
 * @param {string} specialization - User specialization
 * @returns {string}
 */
function formatSpecializationName(specialization) {
  const names = {
    'admin': 'Admin',
    'supervisor': 'Supervisor',
    'planning': 'Planning',
    'control_panel': 'Control Panel',
    'field_operator': 'Field Operator'
  };
  return names[specialization] || specialization;
}

/**
 * Get specialization badge class for styling
 * @param {string} specialization - User specialization
 * @returns {string}
 */
function getSpecializationBadgeClass(specialization) {
  const classes = {
    'admin': 'badge-admin',
    'supervisor': 'badge-supervisor',
    'planning': 'badge-planning',
    'control_panel': 'badge-control-panel',
    'field_operator': 'badge-field-operator'
  };
  return classes[specialization] || 'badge-default';
}

// Log initialization
console.log('✅ Permissions system v2.0 loaded');
