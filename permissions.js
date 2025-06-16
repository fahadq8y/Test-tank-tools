/**
 * Tank Tools - نظام إدارة الصلاحيات
 * Developer: Fahad - 17877
 * Version: 1.0
 */

// تعريف التخصصات والصلاحيات الافتراضية
const SPECIALIZATIONS = {
  supervisor: {
    name: 'Supervisor',
    nameAr: 'مشرف',
    defaultPages: ['index.html', 'plcr.html', 'NMOGASBL.html', 'dashboard.html'],
    defaultPermissions: {
      canViewLiveTanks: true,
      canEditLiveTanks: false,  // مشاهدة فقط في Live Tanks
      canAddToLiveTanks: false, // لا يقدر يضيف للـ Live Tanks
      canDeleteFromLiveTanks: false,
      canManageUsers: false
    }
  },
  planning: {
    name: 'Planning',
    nameAr: 'تخطيط',
    defaultPages: ['index.html', 'plcr.html', 'NMOGASBL.html', 'dashboard.html'],
    defaultPermissions: {
      canViewLiveTanks: false,  // لا يشوف Live Tanks أصلاً
      canEditLiveTanks: false,
      canAddToLiveTanks: false, // لا يقدر يضيف للـ Live Tanks
      canDeleteFromLiveTanks: false,
      canManageUsers: false
    }
  },
  control_panel: {
    name: 'Control Panel',
    nameAr: 'غرفة التحكم',
    defaultPages: ['live-tanks.html', 'dashboard.html'],
    defaultPermissions: {
      canViewLiveTanks: true,
      canEditLiveTanks: true,   // يقدر يعدل في Live Tanks
      canAddToLiveTanks: true,  // يقدر يضيف للـ Live Tanks
      canDeleteFromLiveTanks: true,
      canManageUsers: false
    }
  },
  field_operator: {
    name: 'Field Operator',
    nameAr: 'مشغل ميداني',
    defaultPages: ['dashboard.html'],
    defaultPermissions: {
      canViewLiveTanks: false,
      canEditLiveTanks: false,
      canAddToLiveTanks: false,
      canDeleteFromLiveTanks: false,
      canManageUsers: false
    }
  },
  admin: {
    name: 'Administrator',
    nameAr: 'مدير النظام',
    defaultPages: ['all'],
    defaultPermissions: {
      canViewLiveTanks: true,
      canEditLiveTanks: true,
      canAddToLiveTanks: true,
      canDeleteFromLiveTanks: true,
      canManageUsers: true
    }
  }
};

// تعريف مستويات الصلاحيات لكل صفحة
const PAGE_PERMISSIONS = {
  'index.html': ['view', 'edit', 'delete'],
  'plcr.html': ['view', 'edit', 'delete'],
  'NMOGASBL.html': ['view', 'edit', 'delete'],
  'live-tanks.html': ['view', 'edit', 'delete'],
  'dashboard.html': ['view'],
  'verify.html': ['view', 'edit']
};

// أسماء الصفحات بالعربية
const PAGE_NAMES = {
  'index.html': 'PBCR',
  'plcr.html': 'PLCR', 
  'NMOGASBL.html': 'NMOGAS',
  'live-tanks.html': 'Live Tanks',
  'dashboard.html': 'Dashboard',
  'verify.html': 'Verification'
};

// الحصول على بيانات المستخدم الحالي
async function getCurrentUser() {
  console.log('getCurrentUser: Starting...');
  
  // التحقق من الجلسة أولاً
  const session = sessionStorage.getItem('tanktools_session');
  if (session !== 'active') {
    console.log('getCurrentUser: Session not active, returning null.');
    return null;
  }
  
  // الحصول على بيانات المستخدم من localStorage
  const userData = localStorage.getItem('tanktools_current_user');
  let user = null;
  
  if (userData) {
    try {
      user = JSON.parse(userData);
      console.log('getCurrentUser: User data from localStorage:', user);
    } catch (e) {
      console.error('getCurrentUser: Error parsing user data from localStorage:', e);
      // إذا كانت البيانات تالفة، امسح الجلسة
      sessionStorage.removeItem('tanktools_session');
      localStorage.removeItem('tanktools_current_user');
      return null;
    }
  }

  if (!user || !user.username) {
    console.log('getCurrentUser: No valid user in localStorage, clearing session.');
    sessionStorage.removeItem('tanktools_session');
    localStorage.removeItem('tanktools_current_user');
    return null;
  }

  // التحقق من صحة الجلسة (عمر الجلسة)
  if (user.loginTime) {
    const loginTime = new Date(user.loginTime);
    const now = new Date();
    const sessionAge = (now - loginTime) / (1000 * 60 * 60); // بالساعات
    
    // إذا كانت الجلسة أكبر من 24 ساعة، امسحها
    if (sessionAge > 24) {
      console.log('getCurrentUser: Session expired, clearing data.');
      sessionStorage.removeItem('tanktools_session');
      localStorage.removeItem('tanktools_current_user');
      return null;
    }
  }

  // محاولة تحديث البيانات من Firebase (اختياري)
  try {
    if (window.db && window.doc && window.getDoc) {
      console.log('getCurrentUser: Attempting to fetch latest user data from Firebase...');
      const userRef = window.doc(window.db, 'users', user.username.toLowerCase());
      const userDoc = await window.getDoc(userRef);
      
      if (userDoc.exists()) {
        const firebaseUser = userDoc.data();
        // دمج البيانات مع إعطاء الأولوية لبيانات Firebase
        const updatedUser = { ...user, ...firebaseUser, loginTime: user.loginTime };
        
        // التأكد من أن customPages مصفوفة
        if (updatedUser.customPages && !Array.isArray(updatedUser.customPages)) {
          updatedUser.customPages = [];
        }
        // التأكد من أن customPermissions كائن
        if (updatedUser.customPermissions && typeof updatedUser.customPermissions !== 'object') {
          updatedUser.customPermissions = {};
        }
        
        localStorage.setItem('tanktools_current_user', JSON.stringify(updatedUser));
        console.log('getCurrentUser: Successfully updated user data from Firebase:', updatedUser);
        return updatedUser;
      } else {
        console.log('getCurrentUser: User not found in Firebase, using local data.');
        return user;
      }
    }
  } catch (error) {
    console.error('getCurrentUser: Error updating user data from Firebase:', error);
    // في حالة فشل Firebase، استخدم البيانات المحلية
    return user;
  }
  
  console.log('getCurrentUser: Returning local user data (Firebase not available):', user);
  return user;
}

// فحص صلاحية الوصول للصفحة الحالية
async function checkPageAccess() {
  console.log('checkPageAccess: Starting...');
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.log('checkPageAccess: No current user, redirecting to login.');
      redirectToLogin();
      return false;
    }

    const currentPage = getCurrentPageName();
    console.log('checkPageAccess: Current page:', currentPage);
    console.log('checkPageAccess: User data for access check:', user);
    
    const hasAccess = await checkUserPageAccess(user, currentPage);
    console.log('checkPageAccess: Page access result for', currentPage, ':', hasAccess);
    
    if (!hasAccess) {
      console.log('checkPageAccess: Access denied for page:', currentPage);
      showAccessDenied();
      return false;
    }

    await applyFeaturePermissions(user);
    console.log('checkPageAccess: Feature permissions applied.');
    return true;
  } catch (error) {
    console.error('checkPageAccess: Error during page access check:', error);
    redirectToLogin();
    return false;
  }
}

// الحصول على اسم الصفحة الحالية
function getCurrentPageName() {
  const path = window.location.pathname;
  const fileName = path.split('/').pop() || 'index.html';
  return fileName;
}

// فحص صلاحية المستخدم للصفحة
async function checkUserPageAccess(user, pageName) {
  console.log('checkUserPageAccess: Checking access for page:', pageName, 'for user:', user.username);
  
  // 1. Admin has access to everything (Highest priority)
  if (user.specialization === 'admin' || user.isAdmin || user.role === 'admin') {
    console.log('checkUserPageAccess: User is admin, granting access.');
    return true;
  }

  // 2. Check custom pages (Second highest priority)
  // This should override default specialization or old system roles
  if (user.customPages && Array.isArray(user.customPages)) {
    const hasAccessByCustomPages = user.customPages.includes(pageName) || user.customPages.includes('all');
    console.log('checkUserPageAccess: Custom pages:', user.customPages, 'Access granted by custom pages:', hasAccessByCustomPages);
    // If customPages is defined, it dictates access. No fallback to default if customPages is present.
    return hasAccessByCustomPages;
  }

  // 3. Fallback for old system users (role instead of specialization)
  // This block should only be reached if customPages is NOT defined for the user.
  if (user.role && !user.specialization) { // This condition is still important for actual old users
    console.log('checkUserPageAccess: User is old system user with role:', user.role);
    const allowedPagesForOldUsers = ['index.html', 'plcr.html', 'NMOGASBL.html', 'dashboard.html'];
    const canAccessLiveTanks = ['admin', 'panel_operator', 'supervisor'].includes(user.role);
    
    if (pageName === 'live-tanks.html') {
      console.log('checkUserPageAccess: Old system Live Tanks access:', canAccessLiveTanks);
      return canAccessLiveTanks;
    }
    
    const hasAccess = allowedPagesForOldUsers.includes(pageName);
    console.log('checkUserPageAccess: Old system general page access:', hasAccess);
    return hasAccess;
  }

  // 4. Use default specialization permissions (Lowest priority)
  // This block should only be reached if customPages is NOT defined and user is NOT an old system user.
  const specialization = SPECIALIZATIONS[user.specialization];
  if (!specialization) {
    console.error('checkUserPageAccess: Unknown specialization:', user.specialization);
    return false;
  }

  if (specialization.defaultPages.includes('all')) {
    console.log('checkUserPageAccess: Specialization has "all" access, granting access.');
    return true;
  }

  const hasAccess = specialization.defaultPages.includes(pageName);
  console.log('checkUserPageAccess: Default specialization pages:', specialization.defaultPages, 'Access granted by specialization:', hasAccess);
  return hasAccess;
}

// تطبيق صلاحيات الوظائف على الصفحة
async function applyFeaturePermissions(user) {
  try {
    console.log('applyFeaturePermissions: Starting...');
    
    // تحديث بيانات المستخدم من Firebase أولاً
    if (!user) {
      user = await getCurrentUser();
      if (!user) {
        console.error('applyFeaturePermissions: No current user, cannot apply permissions');
        return;
      }
    }
    
    console.log('applyFeaturePermissions: User data for feature permissions:', user);
    
    // إذا كان المستخدم يستخدم النظام القديم
    if (user.role && !user.specialization) {
      console.log('applyFeaturePermissions: Applying old system permissions for role:', user.role);
      
      // تطبيق الصلاحيات الافتراضية للنظام القديم
      const isAdmin = user.role === 'admin' || user.isAdmin;
      const canAccessLiveTanks = ['admin', 'panel_operator', 'supervisor'].includes(user.role);
      const canEditLiveTanks = ['admin', 'panel_operator'].includes(user.role);
      const canAddToLiveTanks = ['admin', 'panel_operator'].includes(user.role);
      const canDeleteFromLiveTanks = ['admin', 'panel_operator'].includes(user.role);
      
      console.log('- canAccessLiveTanks:', canAccessLiveTanks);
      console.log('- canEditLiveTanks:', canEditLiveTanks);
      console.log('- canAddToLiveTanks:', canAddToLiveTanks);
      console.log('- canDeleteFromLiveTanks:', canDeleteFromLiveTanks);
      
      // تطبيق الصلاحيات على عناصر الواجهة
      hideElementIfNoPermission('live-tanks-btn', canAccessLiveTanks);
      hideElementIfNoPermission('add-to-live-tanks-btn', canAddToLiveTanks);
      hideElementIfNoPermission('add-to-live-tanks-help', canAddToLiveTanks); // إخفاء علامة التعجب
      hideElementIfNoPermission('user-management-link', isAdmin);
      hideElementIfNoPermission('nav-admin', isAdmin);
      
      // تطبيق صلاحيات على صفحة Live Tanks إذا كنا فيها
      if (getCurrentPageName() === 'live-tanks.html') {
        applyLiveTanksPermissions({
          canEditLiveTanks: canEditLiveTanks,
          canDeleteFromLiveTanks: canDeleteFromLiveTanks,
          canAddToLiveTanks: canAddToLiveTanks
        });
      }
      
      return;
    }

    // للمستخدمين الجدد مع نظام specialization
    let permissions = {};
    
    // إذا كان للمستخدم صلاحيات مخصصة
    if (user.customPermissions && typeof user.customPermissions === 'object') {
      permissions = user.customPermissions;
      console.log('applyFeaturePermissions: Applying custom permissions:', permissions);
    } else {
      // استخدام الصلاحيات الافتراضية للتخصص
      const specialization = SPECIALIZATIONS[user.specialization];
      if (!specialization) {
        console.error('applyFeaturePermissions: Unknown specialization:', user.specialization);
        return;
      }
      permissions = specialization.defaultPermissions;
      console.log('applyFeaturePermissions: Applying default specialization permissions for', user.specialization, ':', permissions);
    }

    console.log('applyFeaturePermissions: Checking Live Tanks button permissions:');
    console.log('- canViewLiveTanks:', permissions.canViewLiveTanks);
    console.log('- canAddToLiveTanks:', permissions.canAddToLiveTanks);
    console.log('- canEditLiveTanks:', permissions.canEditLiveTanks);
    console.log('- canDeleteFromLiveTanks:', permissions.canDeleteFromLiveTanks);
    
    // إخفاء أزرار Live Tanks حسب الصلاحيات
    hideElementIfNoPermission('live-tanks-btn', permissions.canViewLiveTanks);
    hideElementIfNoPermission('add-to-live-tanks-btn', permissions.canAddToLiveTanks || permissions.canEditLiveTanks);
    hideElementIfNoPermission('add-to-live-tanks-help', permissions.canAddToLiveTanks || permissions.canEditLiveTanks); // إخفاء علامة التعجب
    hideElementIfNoPermission('edit-live-tanks-btn', permissions.canEditLiveTanks);
    hideElementIfNoPermission('delete-live-tanks-btn', permissions.canDeleteFromLiveTanks);
    
    // إخفاء رابط إدارة المستخدمين
    hideElementIfNoPermission('user-management-link', permissions.canManageUsers);
    hideElementIfNoPermission('nav-admin', permissions.canManageUsers);

    // تطبيق صلاحيات على الروابط في القائمة العلوية
    await applyNavigationPermissions(user);
    
    // تطبيق صلاحيات على صفحة Live Tanks إذا كنا فيها
    if (getCurrentPageName() === 'live-tanks.html') {
      applyLiveTanksPermissions(permissions);
    }
    
    // تخزين الصلاحيات في متغير عام للاستخدام في أجزاء أخرى من التطبيق
    window.TankToolsPermissions = {
      permissions: permissions,
      hasPermission: async function(permissionName) {
        return await hasPermission(permissionName);
      }
    };
    
    console.log('applyFeaturePermissions: Permissions successfully applied for user:', user.username);
  } catch (error) {
    console.error('applyFeaturePermissions: Error applying permissions:', error);
  }
}

// تطبيق صلاحيات على صفحة Live Tanks
function applyLiveTanksPermissions(permissions) {
  console.log('applyLiveTanksPermissions: Applying Live Tanks permissions:', permissions);
  
  // إخفاء أزرار التعديل والحذف إذا لم تكن هناك صلاحية
  const editButtons = document.querySelectorAll('.edit-btn, .update-btn, .save-btn');
  const deleteButtons = document.querySelectorAll('.delete-btn, .remove-btn');
  const addButtons = document.querySelectorAll('.add-btn, .create-btn');
  
  console.log(`- Number of edit buttons: ${editButtons.length}`);
  console.log(`- Number of delete buttons: ${deleteButtons.length}`);
  console.log(`- Number of add buttons: ${addButtons.length}`);
  
  // التحقق من صلاحية التعديل
  if (!permissions.canEditLiveTanks) {
    console.log('applyLiveTanksPermissions: No edit permission for Live Tanks, hiding edit buttons');
    editButtons.forEach(btn => {
      btn.style.display = 'none';
      btn.disabled = true;
      btn.setAttribute('data-permission-disabled', 'true');
    });
    
    // تعطيل الحقول القابلة للتعديل
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (!input.readOnly) {
        input.readOnly = true;
        input.disabled = true;
        input.style.backgroundColor = '#f5f5f5';
        input.style.cursor = 'not-allowed';
        input.setAttribute('data-permission-disabled', 'true');
      }
    });
  } else {
    console.log('applyLiveTanksPermissions: Edit permission exists for Live Tanks, showing edit buttons');
    editButtons.forEach(btn => {
      btn.style.display = '';
      btn.disabled = false;
      btn.removeAttribute('data-permission-disabled');
    });
  }
  
  // التحقق من صلاحية الحذف
  if (!permissions.canDeleteFromLiveTanks) {
    console.log('applyLiveTanksPermissions: No delete permission for Live Tanks, hiding delete buttons');
    deleteButtons.forEach(btn => {
      btn.style.display = 'none';
      btn.disabled = true;
      btn.setAttribute('data-permission-disabled', 'true');
    });
  } else {
    console.log('applyLiveTanksPermissions: Delete permission exists for Live Tanks, showing delete buttons');
    deleteButtons.forEach(btn => {
      btn.style.display = '';
      btn.disabled = false;
      btn.removeAttribute('data-permission-disabled');
    });
  }
  
  // التحقق من صلاحية الإضافة
  if (!permissions.canAddToLiveTanks) {
    console.log('applyLiveTanksPermissions: No add permission for Live Tanks, hiding add buttons');
    addButtons.forEach(btn => {
      btn.style.display = 'none';
      btn.disabled = true;
      btn.setAttribute('data-permission-disabled', 'true');
    });
  } else {
    console.log('applyLiveTanksPermissions: Add permission exists for Live Tanks, showing add buttons');
    addButtons.forEach(btn => {
      btn.style.display = '';
      btn.disabled = false;
      btn.removeAttribute('data-permission-disabled');
    });
  }
  
  // إضافة مستمع أحداث لمنع التلاعب بالأزرار عبر وحدة التحكم
  document.addEventListener('click', function(event) {
    const target = event.target;
    if (target.hasAttribute('data-permission-disabled')) {
      console.log('applyLiveTanksPermissions: Attempt to use permission-disabled element:', target);
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, true);
}

// إخفاء عنصر إذا لم تكن هناك صلاحية
function hideElementIfNoPermission(elementId, hasPermission) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = hasPermission ? 'block' : 'none';
  }
}

// تطبيق صلاحيات على القائمة العلوية
async function applyNavigationPermissions(user) {
  try {
    console.log('applyNavigationPermissions: Starting...');
    // التأكد من أن لدينا بيانات المستخدم المحدثة
    if (!user) {
      user = await getCurrentUser();
      if (!user) {
        console.error('applyNavigationPermissions: No current user, cannot apply navigation permissions');
        return;
      }
    }
    
    console.log('applyNavigationPermissions: User data for navigation permissions:', user);

    // Get the effective allowed pages for the user
    let effectiveAllowedPages = [];
    if (user.specialization === 'admin' || user.isAdmin || user.role === 'admin') {
      effectiveAllowedPages = ['all']; // Admin can see all pages
    } else if (user.customPages && Array.isArray(user.customPages)) {
      effectiveAllowedPages = user.customPages;
    } else if (user.role && !user.specialization) {
      // Old system user roles
      const oldSystemAllowedPages = {
        'supervisor': ['index.html', 'plcr.html', 'NMOGASBL.html', 'dashboard.html', 'live-tanks.html'],
        'planning': ['index.html', 'plcr.html', 'NMOGASBL.html', 'dashboard.html'],
        'control_panel': ['live-tanks.html', 'dashboard.html'],
        'field_operator': ['dashboard.html']
      };
      effectiveAllowedPages = oldSystemAllowedPages[user.role] || [];
    } else {
      // Default specialization pages
      const specialization = SPECIALIZATIONS[user.specialization];
      if (specialization) {
        effectiveAllowedPages = specialization.defaultPages;
      }
    }

    console.log('applyNavigationPermissions: Effective allowed pages:', effectiveAllowedPages);

    // إخفاء الروابط غير المسموحة
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        const fileName = href.split('/').pop();
        let isAllowed = false;

        if (effectiveAllowedPages.includes('all')) {
          isAllowed = true;
        } else {
          isAllowed = effectiveAllowedPages.includes(fileName);
        }
        
        if (!isAllowed) {
          link.style.display = 'none';
        } else {
          link.style.display = ''; // Ensure it's visible if allowed
        }
      }
    });
    console.log('applyNavigationPermissions: Navigation permissions applied.');
  } catch (error) {
    console.error('applyNavigationPermissions: Error applying navigation permissions:', error);
  }
}

// دالة مساعدة لتسجيل الخروج
function logout() {
  localStorage.removeItem('tanktools_current_user');
  sessionStorage.removeItem('tanktools_session');
  window.location.href = 'login.html';
}

// دالة مساعدة لإعادة التوجيه لصفحة الدخول
function redirectToLogin() {
  console.log('redirectToLogin: Redirecting to login page.');
  logout();
}

// دالة مساعدة لإظهار شاشة منع الوصول
function showAccessDenied() {
  console.log('showAccessDenied: Displaying access denied screen.');
  document.getElementById('mainContent').style.display = 'none';
  document.getElementById('accessDenied').style.display = 'flex';
}

// دالة مساعدة لإخفاء شاشة منع الوصول
function hideAccessDenied() {
  console.log('hideAccessDenied: Hiding access denied screen.');
  document.getElementById('mainContent').style.display = 'block';
  document.getElementById('accessDenied').style.display = 'none';
}

// دالة مساعدة للتحقق من صلاحية معينة
async function hasPermission(permissionName) {
  const user = await getCurrentUser();
  if (!user) return false;

  let permissions = {};
  if (user.customPermissions && typeof user.customPermissions === 'object') {
    permissions = user.customPermissions;
  } else if (user.specialization) {
    const specialization = SPECIALIZATIONS[user.specialization];
    if (specialization) {
      permissions = specialization.defaultPermissions;
    }
  } else if (user.role) { // Fallback for old system users
    const oldSystemPermissions = {
      'admin': { canViewLiveTanks: true, canEditLiveTanks: true, canAddToLiveTanks: true, canDeleteFromLiveTanks: true, canManageUsers: true },
      'panel_operator': { canViewLiveTanks: true, canEditLiveTanks: true, canAddToLiveTanks: true, canDeleteFromLiveTanks: true, canManageUsers: false },
      'supervisor': { canViewLiveTanks: true, canEditLiveTanks: false, canAddToLiveTanks: false, canDeleteFromLiveTanks: false, canManageUsers: false },
      'planning': { canViewLiveTanks: false, canEditLiveTanks: false, canAddToLiveTanks: false, canDeleteFromLiveTanks: false, canManageUsers: false },
      'field_operator': { canViewLiveTanks: false, canEditLiveTanks: false, canAddToLiveTanks: false, canDeleteFromLiveTanks: false, canManageUsers: false }
    };
    permissions = oldSystemPermissions[user.role] || {};
  }
  
  return permissions[permissionName] === true;
}

// تهيئة الصلاحيات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOMContentLoaded: Initializing permissions...');
  await checkPageAccess();
});

// تصدير الدوال للاستخدام العالمي
window.getCurrentUser = getCurrentUser;
window.checkPageAccess = checkPageAccess;
window.checkUserPageAccess = checkUserPageAccess;
window.applyFeaturePermissions = applyFeaturePermissions;
window.applyLiveTanksPermissions = applyLiveTanksPermissions;
window.hideElementIfNoPermission = hideElementIfNoPermission;
window.applyNavigationPermissions = applyNavigationPermissions;
window.logout = logout;
window.redirectToLogin = redirectToLogin;
window.showAccessDenied = showAccessDenied;
window.hideAccessDenied = hideAccessDenied;
window.hasPermission = hasPermission;




// ===== نظام إدارة الأجهزة =====

// إنشاء بصمة فريدة للجهاز
function generateDeviceFingerprint() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('Device fingerprint', 2, 2);
  
  const fingerprint = btoa(
    navigator.userAgent + 
    screen.width + 'x' + screen.height + 
    screen.colorDepth + 
    new Date().getTimezoneOffset() +
    navigator.language +
    (navigator.platform || '') +
    canvas.toDataURL()
  ).substring(0, 32);
  
  console.log('Generated device fingerprint:', fingerprint);
  return fingerprint;
}

// الحصول على معلومات الجهاز
function getDeviceInfo() {
  const userAgent = navigator.userAgent;
  let deviceName = 'Unknown Device';
  
  // تحديد نوع الجهاز
  if (/iPhone/i.test(userAgent)) {
    deviceName = 'iPhone';
  } else if (/iPad/i.test(userAgent)) {
    deviceName = 'iPad';
  } else if (/Android/i.test(userAgent)) {
    if (/Mobile/i.test(userAgent)) {
      deviceName = 'Android Phone';
    } else {
      deviceName = 'Android Tablet';
    }
  } else if (/Windows/i.test(userAgent)) {
    deviceName = 'Windows PC';
  } else if (/Mac/i.test(userAgent)) {
    deviceName = 'Mac';
  } else if (/Linux/i.test(userAgent)) {
    deviceName = 'Linux PC';
  }
  
  return {
    id: generateDeviceFingerprint(),
    name: deviceName,
    userAgent: userAgent,
    lastUsed: new Date().toISOString(),
    screen: `${screen.width}x${screen.height}`,
    language: navigator.language
  };
}

// فحص صلاحية الجهاز للمستخدم
async function checkDeviceAccess(username) {
  console.log('checkDeviceAccess: Checking device access for user:', username);
  
  try {
    const currentDevice = getDeviceInfo();
    console.log('checkDeviceAccess: Current device info:', currentDevice);
    
    // الحصول على بيانات المستخدم
    const users = await loadUsers();
    const user = users[username];
    
    if (!user) {
      console.log('checkDeviceAccess: User not found');
      return { allowed: false, reason: 'user_not_found' };
    }
    
    // التأكد من وجود حقول الأجهزة
    if (!user.devices) {
      user.devices = [];
    }
    if (!user.maxDevices) {
      user.maxDevices = 1; // الافتراضي جهاز واحد
    }
    
    console.log('checkDeviceAccess: User device data:', {
      maxDevices: user.maxDevices,
      currentDevices: user.devices.length,
      devices: user.devices
    });
    
    // البحث عن الجهاز الحالي في قائمة الأجهزة المسموحة
    const existingDevice = user.devices.find(device => device.id === currentDevice.id);
    
    if (existingDevice) {
      // الجهاز موجود - تحديث آخر استخدام
      existingDevice.lastUsed = currentDevice.lastUsed;
      await saveUsers(users);
      console.log('checkDeviceAccess: Device found and updated');
      return { allowed: true, reason: 'device_registered' };
    }
    
    // الجهاز غير موجود - فحص إذا كان هناك مساحة لجهاز جديد
    if (user.devices.length < user.maxDevices) {
      // إضافة الجهاز الجديد
      user.devices.push(currentDevice);
      await saveUsers(users);
      console.log('checkDeviceAccess: New device added');
      return { allowed: true, reason: 'device_added' };
    }
    
    // تجاوز العدد المسموح
    console.log('checkDeviceAccess: Device limit exceeded');
    return { 
      allowed: false, 
      reason: 'device_limit_exceeded',
      maxDevices: user.maxDevices,
      currentDevices: user.devices
    };
    
  } catch (error) {
    console.error('checkDeviceAccess: Error checking device access:', error);
    return { allowed: false, reason: 'error' };
  }
}

// إزالة جهاز من قائمة المستخدم
async function removeUserDevice(username, deviceId) {
  console.log('removeUserDevice: Removing device', deviceId, 'for user', username);
  
  try {
    const users = await loadUsers();
    const user = users[username];
    
    if (!user || !user.devices) {
      return false;
    }
    
    user.devices = user.devices.filter(device => device.id !== deviceId);
    await saveUsers(users);
    
    console.log('removeUserDevice: Device removed successfully');
    return true;
  } catch (error) {
    console.error('removeUserDevice: Error removing device:', error);
    return false;
  }
}

// عرض modal إدارة الأجهزة
function showDeviceManagementModal(deviceData) {
  const modal = document.createElement('div');
  modal.className = 'device-modal';
  modal.innerHTML = `
    <div class="device-modal-content">
      <div class="device-modal-header">
        <h3>🔒 إدارة الأجهزة</h3>
        <span class="device-modal-close">&times;</span>
      </div>
      <div class="device-modal-body">
        <div class="device-warning">
          <p><strong>تم تجاوز العدد المسموح من الأجهزة!</strong></p>
          <p>العدد المسموح: <span class="highlight">${deviceData.maxDevices}</span> جهاز</p>
          <p>الأجهزة المستخدمة حالياً: <span class="highlight">${deviceData.currentDevices.length}</span> جهاز</p>
        </div>
        
        <div class="current-devices">
          <h4>الأجهزة المسجلة:</h4>
          <div class="devices-list">
            ${deviceData.currentDevices.map((device, index) => `
              <div class="device-item">
                <div class="device-info">
                  <strong>${device.name}</strong>
                  <small>آخر استخدام: ${new Date(device.lastUsed).toLocaleString('ar-SA')}</small>
                </div>
                <button class="remove-device-btn" data-device-id="${device.id}">
                  🗑️ إزالة
                </button>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="device-actions">
          <p>لتسجيل الدخول من هذا الجهاز، يجب إزالة أحد الأجهزة السابقة.</p>
        </div>
      </div>
    </div>
  `;
  
  // إضافة الـ CSS
  if (!document.querySelector('#device-modal-styles')) {
    const styles = document.createElement('style');
    styles.id = 'device-modal-styles';
    styles.textContent = `
      .device-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        backdrop-filter: blur(5px);
      }
      
      .device-modal-content {
        background: white;
        border-radius: 15px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      }
      
      .device-modal-header {
        background: linear-gradient(45deg, #f44336, #d32f2f);
        color: white;
        padding: 20px;
        border-radius: 15px 15px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .device-modal-close {
        font-size: 24px;
        cursor: pointer;
        opacity: 0.8;
      }
      
      .device-modal-close:hover {
        opacity: 1;
      }
      
      .device-modal-body {
        padding: 20px;
        color: #333;
      }
      
      .device-warning {
        background: rgba(244, 67, 54, 0.1);
        border: 1px solid rgba(244, 67, 54, 0.3);
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 20px;
        text-align: center;
      }
      
      .highlight {
        color: #f44336;
        font-weight: bold;
      }
      
      .current-devices h4 {
        margin-bottom: 15px;
        color: #333;
      }
      
      .device-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 8px;
        margin-bottom: 10px;
        background: #f9f9f9;
      }
      
      .device-info strong {
        display: block;
        color: #333;
      }
      
      .device-info small {
        color: #666;
        font-size: 12px;
      }
      
      .remove-device-btn {
        background: #f44336;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.3s ease;
      }
      
      .remove-device-btn:hover {
        background: #d32f2f;
        transform: translateY(-1px);
      }
      
      .device-actions {
        background: rgba(33, 150, 243, 0.1);
        border: 1px solid rgba(33, 150, 243, 0.3);
        border-radius: 8px;
        padding: 15px;
        margin-top: 20px;
        text-align: center;
        color: #1976d2;
      }
    `;
    document.head.appendChild(styles);
  }
  
  document.body.appendChild(modal);
  
  // إضافة event listeners
  modal.querySelector('.device-modal-close').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
  
  // إضافة event listeners لأزرار الحذف
  modal.querySelectorAll('.remove-device-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const deviceId = e.target.getAttribute('data-device-id');
      const username = getCurrentUsername();
      
      if (confirm('هل أنت متأكد من إزالة هذا الجهاز؟')) {
        const success = await removeUserDevice(username, deviceId);
        if (success) {
          alert('تم حذف الجهاز بنجاح! يمكنك الآن تسجيل الدخول.');
          document.body.removeChild(modal);
          // إعادة تحميل الصفحة لإعادة فحص الأجهزة
          window.location.reload();
        } else {
          alert('حدث خطأ أثناء حذف الجهاز. حاول مرة أخرى.');
        }
      }
    });
  });
}

// الحصول على اسم المستخدم الحالي
function getCurrentUsername() {
  const userData = localStorage.getItem('tanktools_current_user');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      return user.username;
    } catch (error) {
      console.error('Error parsing current user data:', error);
    }
  }
  return null;
}

