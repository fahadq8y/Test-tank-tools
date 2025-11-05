/**
 * 🔐 Tank Tools - Unified Permissions System v3.0
 * Developer: Fahad - 17877
 * Date: 2025-11-05
 * 
 * ✅ Simple & Clear Permission System:
 * - Uses pageAccess array from Firestore
 * - Admin role gets all pages automatically
 * - No complex logic, just simple checks
 */

console.log('🔐 Permissions System v3.0 - Loading...');

// =================== PAGE NAME MAPPING ===================

/**
 * Map display names to actual file names
 */
const PAGE_NAME_MAP = {
  'Dashboard': 'dashboard.html',
  'Live Tanks': 'live-tanks.html',
  'Shift Roster': 'shift-roster.html',
  'Vacation Planner': 'vacation-planner.html',
  'Tank Management': 'tank-management.html',
  'PBCR': 'index.html',
  'PLCR': 'plcr.html',
  'NMOGAS': 'nmogas.html'
};

/**
 * Reverse map: file names to display names
 */
const FILE_TO_DISPLAY_MAP = {
  'dashboard.html': 'Dashboard',
  'live-tanks.html': 'Live Tanks',
  'shift-roster.html': 'Shift Roster',
  'vacation-planner.html': 'Vacation Planner',
  'tank-management.html': 'Tank Management',
  'index.html': 'PBCR',
  'plcr.html': 'PLCR',
  'nmogas.html': 'NMOGAS'
};

// =================== CORE FUNCTIONS ===================

/**
 * Get current page file name
 * @returns {string} Current page file name (e.g., 'dashboard.html')
 */
function getCurrentPageName() {
  const path = window.location.pathname;
  const fileName = path.split('/').pop() || 'index.html';
  console.log('📄 Current page:', fileName);
  return fileName;
}

/**
 * Check if user has access to a specific page
 * @param {Object} user - User object from Firestore
 * @param {string} pageName - Page name (display name like 'Dashboard' or file name like 'dashboard.html')
 * @returns {boolean}
 */
function hasPageAccess(user, pageName) {
  if (!user) {
    console.log('❌ hasPageAccess: No user provided');
    return false;
  }
  
  // ✅ Admin has access to everything
  if (user.role === 'admin') {
    console.log('✅ hasPageAccess: User is admin, access granted to', pageName);
    return true;
  }
  
  // Convert display name to file name if needed
  let fileName = pageName;
  if (PAGE_NAME_MAP[pageName]) {
    fileName = PAGE_NAME_MAP[pageName];
  }
  
  // Convert file name to display name for checking pageAccess array
  let displayName = FILE_TO_DISPLAY_MAP[fileName] || pageName;
  
  // Check pageAccess array from Firestore
  if (user.pageAccess && Array.isArray(user.pageAccess)) {
    const hasAccess = user.pageAccess.includes(displayName);
    console.log(`${hasAccess ? '✅' : '❌'} hasPageAccess: ${displayName} ${hasAccess ? 'found' : 'not found'} in pageAccess:`, user.pageAccess);
    return hasAccess;
  }
  
  console.log('❌ hasPageAccess: No pageAccess array found for user');
  return false;
}

/**
 * Check current page access and redirect if unauthorized
 * Call this function on page load
 */
function checkPagePermissions() {
  const currentPage = getCurrentPageName();
  
  // Allow login page without auth
  if (currentPage === 'login.html') {
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
    window.location.href = 'live-tanks.html'; // Redirect to default page
    return;
  }
  
  console.log('✅ Access granted to', currentPage);
}

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
    { selector: 'a[href="dashboard.html"]', page: 'Dashboard' },
    { selector: '#dashboard-link', page: 'Dashboard' },
    { selector: 'a[href="live-tanks.html"]', page: 'Live Tanks' },
    { selector: '#live-tanks-link', page: 'Live Tanks' },
    { selector: 'a[href="shift-roster.html"]', page: 'Shift Roster' },
    { selector: 'a[href="vacation-planner.html"]', page: 'Vacation Planner' },
    { selector: 'a[href="tank-management.html"]', page: 'Tank Management' },
    { selector: 'a[href="index.html"]', page: 'PBCR' },
    { selector: 'a[href="plcr.html"]', page: 'PLCR' },
    { selector: 'a[href="nmogas.html"]', page: 'NMOGAS' }
  ];
  
  // Show/hide each navigation element based on permissions
  navElements.forEach(({ selector, page }) => {
    const element = document.querySelector(selector);
    if (element) {
      const hasAccess = hasPageAccess(user, page);
      element.style.display = hasAccess ? '' : 'none';
      console.log(`${hasAccess ? '✅' : '❌'} ${page} button:`, hasAccess ? 'visible' : 'hidden', '| Selector:', selector, '| Element:', element);
    } else {
      console.log(`⚠️ ${page} button NOT FOUND | Selector:`, selector);
    }
  });
  
  console.log('✅ UI permissions applied');
}

// =================== EXPORTS ===================

// Make functions globally available
window.hasPageAccess = hasPageAccess;
window.checkPagePermissions = checkPagePermissions;
window.applyUIPermissions = applyUIPermissions;
window.getCurrentPageName = getCurrentPageName;

console.log('✅ Permissions System v3.0 loaded successfully');
