/**
 * 🔐 Tank Tools - Unified Permissions System
 * Developer: Fahad - 17877
 * Version: 2.2 - Added sessionStorage Cache for Permissions (Performance Boost)
 * Date: 2025-11-03
 */

// ✅ Permission definitions for each specialization
const PERMISSIONS = {
  'admin': {
    pages: ['all'],
    features: ['all']
  },
  'supervisor': {
    pages: ['index.html', 'plcr.html', 'nmogas.html', 'live-tanks.html', 'dashboard.html', 'shift-roster.html'],
    features: ['view_all', 'edit_tanks', 'view_dashboard']
  },
  'planning': {
    pages: ['index.html', 'plcr.html', 'nmogas.html', 'dashboard.html', 'shift-roster.html'],
    features: ['view_all', 'add_tanks', 'edit_tanks']
  },
  'control_panel': {
    pages: ['index.html', 'plcr.html', 'nmogas.html', 'live-tanks.html', 'tank-management.html', 'dashboard.html', 'shift-roster.html'],
    features: ['view_all', 'add_to_live_tanks', 'edit_live_tanks', 'delete_live_tanks']
  },
  'field_operator': {
    pages: ['index.html', 'plcr.html', 'dashboard.html', 'shift-roster.html'],
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
console.log('✅ Permissions system v2.2 loaded - with sessionStorage Cache');

/**
 * ✅ Check if current user has a specific permission (Firebase Auth + Firestore)
 * @param {string} permissionName - Permission name (e.g., 'canViewLiveTanks')
 * @returns {Promise<boolean>}
 */
async function hasPermission(permissionName) {
  try {
    // Get current user from window.currentUser (set by onAuthStateChanged)
    const user = window.currentUser;
    
    if (!user) {
      console.log('hasPermission: No current user');
      return false;
    }
    
    const username = user.username || (user.email ? user.email.split('@')[0] : null);
    console.log(`hasPermission: Checking ${permissionName} for user:`, username);
    
    // ⚡ Check cache first (sessionStorage)
    const cacheKey = `permissions_cache_${username}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const cachedPermissions = JSON.parse(cached);
        if (cachedPermissions[permissionName] !== undefined) {
          console.log(`⚡ hasPermission: Using cached value for ${permissionName} = ${cachedPermissions[permissionName]}`);
          return cachedPermissions[permissionName];
        }
      } catch (e) {
        console.error('hasPermission: Cache parse error:', e);
      }
    }
    
    // ✅ Admin has all permissions
    if (user.role === 'admin' || user.specialization === 'admin') {
      console.log(`hasPermission: User is admin, granting ${permissionName}`);
      
      // ⚡ Save to cache
      const cacheKey = `permissions_cache_${username}`;
      const cached = sessionStorage.getItem(cacheKey);
      const cachedPermissions = cached ? JSON.parse(cached) : {};
      cachedPermissions[permissionName] = true;
      sessionStorage.setItem(cacheKey, JSON.stringify(cachedPermissions));
      
      return true;
    }
    
    // ✅ Check custom permissions from Firestore
    if (window.db && window.getDoc && window.doc) {
      try {
        const username = user.username || (user.email ? user.email.split('@')[0] : null);
        if (!username) {
          console.error('hasPermission: No username found');
          return false;
        }
        
        const userDocRef = window.doc(window.db, 'users', username);
        const userDoc = await window.getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log(`hasPermission: User data from Firestore:`, userData);
          
          // Check if user has custom permissions object
          if (userData.permissions && typeof userData.permissions === 'object') {
            const hasIt = userData.permissions[permissionName] === true;
            console.log(`hasPermission: ${permissionName} = ${hasIt}`);
            
            // ⚡ Save to cache
            const cacheKey = `permissions_cache_${username}`;
            const cached = sessionStorage.getItem(cacheKey);
            const cachedPermissions = cached ? JSON.parse(cached) : {};
            cachedPermissions[permissionName] = hasIt;
            sessionStorage.setItem(cacheKey, JSON.stringify(cachedPermissions));
            
            return hasIt;
          }
          
          // Fallback: Check if permission exists directly on user object
          if (userData[permissionName] === true) {
            console.log(`hasPermission: ${permissionName} found directly on user = true`);
            
            // ⚡ Save to cache
            const cacheKey = `permissions_cache_${username}`;
            const cached = sessionStorage.getItem(cacheKey);
            const cachedPermissions = cached ? JSON.parse(cached) : {};
            cachedPermissions[permissionName] = true;
            sessionStorage.setItem(cacheKey, JSON.stringify(cachedPermissions));
            
            return true;
          }
        }
      } catch (firestoreError) {
        console.error('hasPermission: Firestore error:', firestoreError);
      }
    }
    
    // ✅ Fallback: Map permission names to role-based permissions
    const permissionMapping = {
      'canViewLiveTanks': ['admin', 'supervisor', 'control_panel', 'panel_operator'],
      'canAddToLiveTanks': ['admin', 'control_panel', 'panel_operator'],
      'canEditLiveTanks': ['admin', 'control_panel', 'panel_operator'],
      'canDeleteFromLiveTanks': ['admin', 'control_panel', 'panel_operator'],
      'canViewPBCR': ['admin', 'supervisor', 'planning', 'control_panel', 'panel_operator', 'field_operator', 'operator'],
      'canAddToPBCR': ['admin', 'planning', 'control_panel', 'panel_operator'],
      'canEditPBCR': ['admin', 'planning', 'control_panel', 'panel_operator'],
      'canDeleteFromPBCR': ['admin', 'control_panel', 'panel_operator'],
      'canViewPLCR': ['admin', 'supervisor', 'planning', 'control_panel', 'panel_operator', 'field_operator', 'operator'],
      'canAddToPLCR': ['admin', 'planning', 'control_panel', 'panel_operator'],
      'canEditPLCR': ['admin', 'planning', 'control_panel', 'panel_operator'],
      'canDeleteFromPLCR': ['admin', 'control_panel', 'panel_operator'],
      'canViewDashboard': ['admin', 'supervisor', 'planning', 'control_panel', 'panel_operator']
    };
    
    const allowedRoles = permissionMapping[permissionName];
    if (allowedRoles) {
      const userRole = user.role || user.specialization;
      const hasIt = allowedRoles.includes(userRole);
      console.log(`hasPermission: Fallback role-based check: ${permissionName} for role ${userRole} = ${hasIt}`);
      
      // ⚡ Save to cache
      const cacheKey = `permissions_cache_${username}`;
      const cached = sessionStorage.getItem(cacheKey);
      const cachedPermissions = cached ? JSON.parse(cached) : {};
      cachedPermissions[permissionName] = hasIt;
      sessionStorage.setItem(cacheKey, JSON.stringify(cachedPermissions));
      
      return hasIt;
    }
    
    console.log(`hasPermission: No permission found for ${permissionName}, returning false`);
    return false;
    
  } catch (error) {
    console.error('hasPermission: Error:', error);
    return false;
  }
}

console.log('✅ hasPermission() function added to permissions system');
