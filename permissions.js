/**
 * ============================================
 * TANK TOOLS - UNIFIED PERMISSIONS SYSTEM v4.0
 * ============================================
 * 
 * Complete rewrite from scratch
 * All permissions controlled from Dashboard
 * Simple, unified, and consistent across all pages
 * 
 * Developer: Fahad - 17877
 * Last Updated: 2025-11-05
 */

console.log('%c🔒 PERMISSIONS SYSTEM v4.0 LOADED', 'color:blue;font-size:16px;font-weight:bold');

// =================== PAGE MAPPINGS ===================

/**
 * Map display names to file names
 */
const PAGE_MAP = {
  'PBCR': 'index.html',
  'PLCR': 'plcr.html',
  'NMOGAS': 'nmogas.html',
  'Live Tanks': 'live-tanks.html',
  'Dashboard': 'dashboard.html',
  'Shift Roster': 'shift-roster.html',
  'Vacation Planner': 'vacation-planner.html',
  'Tank Management': 'tank-management.html'
};

/**
 * Get current page name (display name)
 */
function getCurrentPageName() {
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  
  // Find display name from file name
  for (const [displayName, fileName] of Object.entries(PAGE_MAP)) {
    if (fileName === currentFile) {
      return displayName;
    }
  }
  
  return null;
}

// =================== PERMISSION CHECKS ===================

/**
 * Check if user has access to a specific page
 * @param {Object} user - User object from Firestore
 * @param {string} pageName - Display name of the page (e.g., 'PBCR', 'Live Tanks')
 * @returns {boolean} - True if user has access
 */
function hasPageAccess(user, pageName) {
  if (!user) {
    console.log('❌ hasPageAccess: No user provided');
    return false;
  }
  
  // Admin has access to everything
  if (user.role === 'admin') {
    console.log('✅ Admin access granted to:', pageName);
    return true;
  }
  
  // Check pageAccess array
  const pageAccess = user.pageAccess || [];
  const hasAccess = pageAccess.includes(pageName);
  
  console.log(`${hasAccess ? '✅' : '❌'} User ${user.username} access to ${pageName}:`, hasAccess);
  
  return hasAccess;
}

/**
 * Check if user has specific Live Tanks permission
 * @param {Object} user - User object
 * @param {string} permission - Permission name (canViewLiveTanks, canEditLiveTanks, etc.)
 * @returns {boolean}
 */
function hasLiveTanksPermission(user, permission) {
  if (!user) return false;
  
  // Admin has all permissions
  if (user.role === 'admin') return true;
  
  // Check permissions object
  const permissions = user.permissions || {};
  return permissions[permission] === true;
}

/**
 * Check if "Add to Live Tanks" button should be shown in a page
 * @param {Object} user - User object
 * @param {string} pageName - 'PBCR' or 'PLCR'
 * @returns {boolean}
 */
function showAddToLiveTanksButton(user, pageName) {
  if (!user) return false;
  
  // Admin sees all buttons
  if (user.role === 'admin') return true;
  
  // Check customButtonAccess
  const buttonAccess = user.customButtonAccess || {};
  const addToLiveTanks = buttonAccess.addToLiveTanks || {};
  
  if (pageName === 'PBCR') {
    return addToLiveTanks.index === true;
  } else if (pageName === 'PLCR') {
    return addToLiveTanks.plcr === true;
  }
  
  return false;
}

// =================== PAGE PROTECTION ===================

/**
 * Check if current user has permission to view current page
 * Redirects to login if not authorized
 * Call this on page load
 */
function checkPagePermissions() {
  const currentPage = getCurrentPageName();
  
  console.log('🔍 Checking permissions for page:', currentPage);
  
  // Allow login page without auth
  if (window.location.pathname.includes('login.html')) {
    console.log('✅ Login page, no permission check needed');
    return;
  }
  
  // Get user from localStorage
  const savedUser = localStorage.getItem('tanktools_current_user');
  if (!savedUser) {
    console.log('❌ No user in localStorage, redirecting to login');
    alert('يرجى تسجيل الدخول أولاً');
    window.location.href = 'login.html';
    return;
  }
  
  let user;
  try {
    user = JSON.parse(savedUser);
  } catch (e) {
    console.error('❌ Error parsing user data:', e);
    alert('يرجى تسجيل الدخول أولاً');
    window.location.href = 'login.html';
    return;
  }
  
  // Check if user has access to current page
  if (!hasPageAccess(user, currentPage)) {
    console.log('❌ Access denied to', currentPage);
    alert('ليس لديك صلاحية للدخول إلى هذه الصفحة');
    window.location.href = 'login.html';
    return;
  }
  
  console.log('✅ Access granted to', currentPage);
}

// =================== UI PERMISSIONS ===================

/**
 * Apply UI permissions - show/hide navigation buttons
 * Call this function after loading user data
 * @param {Object} user - User object from Firestore
 */
function applyUIPermissions(user) {
  if (!user) {
    console.log('❌ applyUIPermissions: No user provided');
    return;
  }
  
  console.log('🔒 Applying UI permissions for:', user.username);
  
  // List of all navigation elements to check
  const navElements = [
    { selector: 'a[href="index.html"]', page: 'PBCR' },
    { selector: 'a[href="plcr.html"]', page: 'PLCR' },
    { selector: 'a[href="nmogas.html"]', page: 'NMOGAS' },
    { selector: 'a[href="live-tanks.html"]', page: 'Live Tanks' },
    { selector: 'a[href="dashboard.html"]', page: 'Dashboard' },
    { selector: 'a[href="shift-roster.html"]', page: 'Shift Roster' },
    { selector: 'a[href="vacation-planner.html"]', page: 'Vacation Planner' },
    { selector: 'a[href="tank-management.html"]', page: 'Tank Management' }
  ];
  
  // Show/hide each navigation element based on permissions
  navElements.forEach(({ selector, page }) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      const hasAccess = hasPageAccess(user, page);
      element.style.display = hasAccess ? '' : 'none';
      console.log(`${hasAccess ? '✅' : '❌'} ${page} button:`, hasAccess ? 'visible' : 'hidden');
    });
  });
  
  // Handle "Add to Live Tanks" buttons in PBCR and PLCR
  const currentPage = getCurrentPageName();
  
  if (currentPage === 'PBCR' || currentPage === 'PLCR') {
    const addButtons = document.querySelectorAll('.add-to-live-tanks, #addToLiveTanks, [data-action="add-to-live-tanks"]');
    const shouldShow = showAddToLiveTanksButton(user, currentPage);
    
    addButtons.forEach(button => {
      button.style.display = shouldShow ? '' : 'none';
      console.log(`${shouldShow ? '✅' : '❌'} Add to Live Tanks button in ${currentPage}:`, shouldShow ? 'visible' : 'hidden');
    });
  }
  
  console.log('✅ UI permissions applied');
}

// =================== EXPORTS ===================

// Make functions globally available
window.hasPageAccess = hasPageAccess;
window.hasLiveTanksPermission = hasLiveTanksPermission;
window.showAddToLiveTanksButton = showAddToLiveTanksButton;
window.checkPagePermissions = checkPagePermissions;
window.applyUIPermissions = applyUIPermissions;
window.getCurrentPageName = getCurrentPageName;

console.log('✅ Permissions system v4.0 initialized');
