/**
 * Tank Tools - Session Manager
 * Developer: Fahad - 17877
 * Version: 1.0.0
 * Last Updated: 2025-11-06
 * 
 * Centralized session management system with 7-day expiry
 */

const SessionManager = {
  // Constants
  SESSION_DURATION: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  WARNING_THRESHOLD: 60 * 60 * 1000, // 1 hour before expiry
  
  // Storage keys
  KEYS: {
    USER_DATA: 'tanktools_current_user',
    SESSION_DATA: 'tanktools_session_data',
    USERNAME: 'username',
    REDIRECT: 'tanktools_redirect'
  },

  /**
   * Create a new session
   * @param {Object} userData - User data from Firebase or admin login
   * @param {boolean} rememberMe - Whether to persist session (default: true)
   * @returns {Object} Session data
   */
  createSession(userData, rememberMe = true) {
    try {
      const now = Date.now();
      const sessionData = {
        id: crypto.randomUUID(),
        loginTimestamp: now,
        expiryTimestamp: now + this.SESSION_DURATION,
        lastActivity: now,
        rememberMe: rememberMe
      };

      // Save user data
      localStorage.setItem(this.KEYS.USER_DATA, JSON.stringify(userData));
      
      // Save session data
      localStorage.setItem(this.KEYS.SESSION_DATA, JSON.stringify(sessionData));
      
      // Save username separately for Firebase Auth compatibility
      if (userData.username) {
        localStorage.setItem(this.KEYS.USERNAME, userData.username);
      }

      // Set session as active in sessionStorage
      sessionStorage.setItem('tanktools_session', 'active');

      console.log('✅ Session created:', {
        sessionId: sessionData.id,
        username: userData.username,
        expiresAt: new Date(sessionData.expiryTimestamp).toLocaleString('ar-KW')
      });

      return sessionData;
    } catch (error) {
      console.error('❌ Error creating session:', error);
      return null;
    }
  },

  /**
   * Validate current session
   * @returns {Object|null} User data if session is valid, null otherwise
   */
  validateSession() {
    try {
      // Check if session exists
      const userDataStr = localStorage.getItem(this.KEYS.USER_DATA);
      const sessionDataStr = localStorage.getItem(this.KEYS.SESSION_DATA);
      
      if (!userDataStr) {
        console.log('❌ No user data found');
        return null;
      }

      const userData = JSON.parse(userDataStr);

      // If no session data exists (old sessions), create one
      if (!sessionDataStr) {
        console.log('⚠️ Old session detected, migrating...');
        this.createSession(userData);
        return userData;
      }

      const sessionData = JSON.parse(sessionDataStr);
      const now = Date.now();

      // Check if session has expired
      if (now > sessionData.expiryTimestamp) {
        console.log('❌ Session expired at:', new Date(sessionData.expiryTimestamp).toLocaleString('ar-KW'));
        this.destroySession();
        return null;
      }

      // Update last activity
      sessionData.lastActivity = now;
      localStorage.setItem(this.KEYS.SESSION_DATA, JSON.stringify(sessionData));

      // Check if session is about to expire
      const timeRemaining = sessionData.expiryTimestamp - now;
      if (timeRemaining < this.WARNING_THRESHOLD) {
        console.log('⚠️ Session expiring soon:', Math.floor(timeRemaining / (60 * 1000)), 'minutes remaining');
      }

      return userData;
    } catch (error) {
      console.error('❌ Error validating session:', error);
      return null;
    }
  },

  /**
   * Get current user data
   * @returns {Object|null} User data or null
   */
  getCurrentUser() {
    try {
      const userDataStr = localStorage.getItem(this.KEYS.USER_DATA);
      return userDataStr ? JSON.parse(userDataStr) : null;
    } catch (error) {
      console.error('❌ Error getting current user:', error);
      return null;
    }
  },

  /**
   * Update user data in session
   * @param {Object} userData - Updated user data
   * @returns {boolean} Success status
   */
  updateSession(userData) {
    try {
      localStorage.setItem(this.KEYS.USER_DATA, JSON.stringify(userData));
      
      if (userData.username) {
        localStorage.setItem(this.KEYS.USERNAME, userData.username);
      }

      console.log('✅ Session updated for user:', userData.username);
      return true;
    } catch (error) {
      console.error('❌ Error updating session:', error);
      return false;
    }
  },

  /**
   * Destroy current session
   * @param {boolean} clearAll - Whether to clear all localStorage (default: false)
   */
  destroySession(clearAll = false) {
    try {
      // Remove session-specific data
      localStorage.removeItem(this.KEYS.USER_DATA);
      localStorage.removeItem(this.KEYS.SESSION_DATA);
      localStorage.removeItem(this.KEYS.USERNAME);
      sessionStorage.removeItem('tanktools_session');

      // If clearAll is true, remove everything
      if (clearAll) {
        localStorage.clear();
        sessionStorage.clear();
        console.log('🗑️ All storage cleared');
      } else {
        console.log('🗑️ Session destroyed (settings preserved)');
      }
    } catch (error) {
      console.error('❌ Error destroying session:', error);
    }
  },

  /**
   * Get session time remaining
   * @returns {Object} Time remaining in different units
   */
  getSessionTimeRemaining() {
    try {
      const sessionDataStr = localStorage.getItem(this.KEYS.SESSION_DATA);
      if (!sessionDataStr) {
        return null;
      }

      const sessionData = JSON.parse(sessionDataStr);
      const now = Date.now();
      const remaining = sessionData.expiryTimestamp - now;

      if (remaining <= 0) {
        return { expired: true };
      }

      const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
      const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

      return {
        expired: false,
        milliseconds: remaining,
        days: days,
        hours: hours,
        minutes: minutes,
        formatted: `${days} يوم و ${hours} ساعة و ${minutes} دقيقة`
      };
    } catch (error) {
      console.error('❌ Error getting session time remaining:', error);
      return null;
    }
  },

  /**
   * Renew session (extend expiry by 7 days)
   * @returns {boolean} Success status
   */
  renewSession() {
    try {
      const sessionDataStr = localStorage.getItem(this.KEYS.SESSION_DATA);
      if (!sessionDataStr) {
        console.log('❌ No session to renew');
        return false;
      }

      const sessionData = JSON.parse(sessionDataStr);
      const now = Date.now();
      
      sessionData.expiryTimestamp = now + this.SESSION_DURATION;
      sessionData.lastActivity = now;
      
      localStorage.setItem(this.KEYS.SESSION_DATA, JSON.stringify(sessionData));

      console.log('✅ Session renewed, new expiry:', new Date(sessionData.expiryTimestamp).toLocaleString('ar-KW'));
      return true;
    } catch (error) {
      console.error('❌ Error renewing session:', error);
      return false;
    }
  },

  /**
   * Check if session is about to expire
   * @returns {boolean} True if session expires within warning threshold
   */
  isSessionExpiringSoon() {
    try {
      const sessionDataStr = localStorage.getItem(this.KEYS.SESSION_DATA);
      if (!sessionDataStr) {
        return false;
      }

      const sessionData = JSON.parse(sessionDataStr);
      const now = Date.now();
      const timeRemaining = sessionData.expiryTimestamp - now;

      return timeRemaining > 0 && timeRemaining < this.WARNING_THRESHOLD;
    } catch (error) {
      console.error('❌ Error checking session expiry:', error);
      return false;
    }
  },

  /**
   * Get session info for display
   * @returns {Object|null} Session information
   */
  getSessionInfo() {
    try {
      const sessionDataStr = localStorage.getItem(this.KEYS.SESSION_DATA);
      const userData = this.getCurrentUser();
      
      if (!sessionDataStr || !userData) {
        return null;
      }

      const sessionData = JSON.parse(sessionDataStr);
      const timeRemaining = this.getSessionTimeRemaining();

      return {
        username: userData.username,
        role: userData.role,
        loginTime: new Date(sessionData.loginTimestamp).toLocaleString('ar-KW'),
        expiryTime: new Date(sessionData.expiryTimestamp).toLocaleString('ar-KW'),
        timeRemaining: timeRemaining,
        sessionId: sessionData.id
      };
    } catch (error) {
      console.error('❌ Error getting session info:', error);
      return null;
    }
  },

  /**
   * Redirect to login page with optional return URL
   * @param {string} returnUrl - URL to return to after login
   */
  redirectToLogin(returnUrl = null) {
    if (returnUrl) {
      sessionStorage.setItem(this.KEYS.REDIRECT, returnUrl);
    }
    window.location.href = 'login.html';
  },

  /**
   * Get and clear redirect URL
   * @returns {string|null} Redirect URL or null
   */
  getRedirectUrl() {
    const url = sessionStorage.getItem(this.KEYS.REDIRECT);
    if (url) {
      sessionStorage.removeItem(this.KEYS.REDIRECT);
    }
    return url;
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SessionManager;
}

console.log('✅ Session Manager v1.0.0 loaded');
