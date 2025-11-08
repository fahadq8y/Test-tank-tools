/**
 * Firebase Auth Handler v1.0
 * Unified Firebase Authentication & Session Management
 * 
 * Features:
 * - Firebase initialization
 * - Session validation with SessionManager
 * - Permission checking
 * - UI updates
 * - Logout handling
 * 
 * Usage:
 * <script src="session-manager.js"></script>
 * <script src="permissions.js"></script>
 * <script src="firebase-auth-handler.js" type="module"></script>
 * <script>
 *   FirebaseAuthHandler.init({
 *     pageName: 'NMOGAS',
 *     redirectPage: 'index.html'
 *   });
 * </script>
 */

import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Firebase configuration will be loaded from Edge Function
let firebaseConfig = null;

class FirebaseAuthHandlerClass {
  constructor() {
    this.app = null;
    this.db = null;
    this.auth = null;
    this.initialized = false;
  }

  /**
   * Initialize Firebase and setup auth listener
   * @param {Object} options - Configuration options
   * @param {string} options.pageName - Name of the current page (for permission checking)
   * @param {string} options.redirectPage - Page to redirect if no access (default: 'index.html')
   * @param {boolean} options.checkPermissions - Whether to check page permissions (default: true)
   */
  async init(options = {}) {
    const {
      pageName = 'Unknown Page',
      redirectPage = 'index.html',
      checkPermissions = true
    } = options;

    // Load Firebase config from Edge Function (only once)
    if (!firebaseConfig) {
      try {
        const response = await fetch('/api/firebase-config');
        if (!response.ok) {
          throw new Error(`Failed to load Firebase config: ${response.status}`);
        }
        firebaseConfig = await response.json();
        console.log('✅ Firebase config loaded from Edge Function');
      } catch (error) {
        console.error('❌ Failed to load Firebase config:', error);
        alert('Failed to initialize application. Please refresh the page.');
        return;
      }
    }

    // Initialize Firebase (only once)
    if (!this.initialized) {
      const existingApps = getApps();
      if (existingApps.length === 0) {
        this.app = initializeApp(firebaseConfig);
        console.log(`🔥 Firebase initialized for ${pageName}!`);
      } else {
        this.app = getApp();
        console.log('🔄 Using existing Firebase app');
      }

      this.db = getFirestore(this.app);
      this.auth = getAuth(this.app);

      // Make Firebase globally available
      window.db = this.db;
      window.doc = doc;
      window.getDoc = getDoc;
      window.auth = this.auth;

      this.initialized = true;
    }

    // Setup auth state listener
    onAuthStateChanged(this.auth, async (user) => {
      if (!user) {
        console.log('❌ No Firebase Auth user, checking localStorage...');
        
        // Fallback to SessionManager for non-migrated users
        const userData = SessionManager.validateSession();
        
        if (!userData) {
          console.log('❌ No session found, redirecting to login...');
          alert('يرجى تسجيل الدخول أولاً');
          window.location.href = 'login.html';
          return;
        }
        
        // Use localStorage data
        console.log('✅ Using localStorage session for:', userData.username);
        window.currentUser = userData;
        
        // Check page permissions
        if (checkPermissions && typeof hasPageAccess === 'function') {
          if (!hasPageAccess(userData, pageName)) {
            alert('ليس لديك صلاحية للدخول إلى هذه الصفحة');
            window.location.href = redirectPage;
            return;
          }
        }
        
        // Apply UI permissions
        if (typeof applyUIPermissions === 'function') {
          applyUIPermissions(userData);
        }
        
        // Update UI with user info
        this.updateUserUI(userData);
        
        console.log('✅ Permissions applied for:', userData.name || userData.username);
      } else {
        // Firebase Auth user (migrated users)
        console.log('✅ Firebase Auth user:', user.email);
        
        try {
          const userDoc = await getDoc(doc(this.db, 'users', user.uid));
          if (!userDoc.exists()) {
            console.error('❌ User document not found');
            
            // ✅ حذف session من localStorage قبل alert
            SessionManager.destroySession(false);
            
            await signOut(this.auth);
            alert('حساب غير موجود');
            window.location.href = 'login.html';
            return;
          }
          
          const userData = userDoc.data();
          window.currentUser = userData;
          
          // Check page permissions
          if (checkPermissions && typeof hasPageAccess === 'function') {
            if (!hasPageAccess(userData, pageName)) {
              alert('ليس لديك صلاحية للدخول إلى هذه الصفحة');
              window.location.href = redirectPage;
              return;
            }
          }
          
          // Apply UI permissions
          if (typeof applyUIPermissions === 'function') {
            applyUIPermissions(userData);
          }
          
          // Update UI with user info
          this.updateUserUI(userData);
          
          console.log('✅ Permissions applied for:', userData.name || user.email);
        } catch (error) {
          console.error('❌ Error loading user data:', error);
          alert('خطأ في تحميل بيانات المستخدم');
        }
      }
    });
  }

  /**
   * Update UI with user information
   * @param {Object} userData - User data object
   */
  updateUserUI(userData) {
    // Update user name
    const userNameEl = document.getElementById('userName');
    if (userNameEl) {
      userNameEl.textContent = userData.name || userData.username;
    }
    
    // Update user avatar
    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar && userData.name) {
      userAvatar.textContent = userData.name.charAt(0).toUpperCase();
    }
  }

  /**
   * Logout user
   * @param {boolean} clearAll - Whether to clear all localStorage (default: false)
   */
  async logout(clearAll = false) {
    try {
      // Sign out from Firebase if authenticated
      if (this.auth.currentUser) {
        await signOut(this.auth);
      }
      
      // Destroy session
      SessionManager.destroySession(clearAll);
      
      console.log('✅ User logged out successfully');
      window.location.href = 'login.html';
    } catch (error) {
      console.error('❌ Logout error:', error);
      alert('خطأ في تسجيل الخروج');
    }
  }
}

// Create singleton instance
const FirebaseAuthHandler = new FirebaseAuthHandlerClass();

// Make it globally available
window.FirebaseAuthHandler = FirebaseAuthHandler;

// Export for module usage
export default FirebaseAuthHandler;

console.log('%c🔐 Firebase Auth Handler v1.0 Loaded', 'color:#4CAF50;font-size:14px;font-weight:bold');
