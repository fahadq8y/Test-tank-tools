/**
 * Debug Banner - Shows localStorage status
 * TEMPORARY - Will be removed after testing
 */

(function() {
  // Create debug banner
  const banner = document.createElement('div');
  banner.id = 'debug-banner';
  banner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #ff6b35;
    color: white;
    padding: 10px;
    font-size: 12px;
    z-index: 999999;
    font-family: monospace;
    line-height: 1.5;
    max-height: 200px;
    overflow-y: auto;
  `;

  // Get localStorage data
  const userData = localStorage.getItem('tanktools_current_user');
  const sessionData = localStorage.getItem('tanktools_session_data');
  const username = localStorage.getItem('username');

  let html = '<strong>🔍 DEBUG MODE</strong><br>';
  
  if (userData) {
    try {
      const user = JSON.parse(userData);
      html += `✅ User: ${user.username || user.name}<br>`;
    } catch (e) {
      html += `⚠️ User data exists but invalid<br>`;
    }
  } else {
    html += `❌ No user data<br>`;
  }

  if (sessionData) {
    try {
      const session = JSON.parse(sessionData);
      const now = Date.now();
      const expiry = new Date(session.expiryTimestamp);
      const timeLeft = session.expiryTimestamp - now;
      const daysLeft = Math.floor(timeLeft / (24 * 60 * 60 * 1000));
      const hoursLeft = Math.floor((timeLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      
      html += `✅ Session ID: ${session.id.substring(0, 8)}...<br>`;
      html += `✅ Expires: ${expiry.toLocaleString('ar-KW')}<br>`;
      html += `✅ Time left: ${daysLeft}d ${hoursLeft}h<br>`;
      
      if (now > session.expiryTimestamp) {
        html += `❌ SESSION EXPIRED!<br>`;
      }
    } catch (e) {
      html += `⚠️ Session data exists but invalid<br>`;
    }
  } else {
    html += `❌ No session data<br>`;
  }

  // Show last page
  const lastPage = localStorage.getItem('tanktools_last_page');
  if (lastPage) {
    html += `✅ Last page: ${lastPage}<br>`;
  } else {
    html += `❌ No last page saved<br>`;
  }

  html += `<br><small>localStorage keys: ${localStorage.length}</small>`;
  
  // Show redirect info (only on login page)
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  if (currentPage === 'login.html' && userData && sessionData) {
    const redirectTo = lastPage || 'dashboard.html';
    html += `<br><strong style="color: yellow;">🔄 Will redirect to: ${redirectTo}</strong>`;
  }

  banner.innerHTML = html;

  // Add to page when DOM is ready
  if (document.body) {
    document.body.insertBefore(banner, document.body.firstChild);
    // Add padding to body to prevent content overlap
    document.body.style.paddingTop = (banner.offsetHeight + 10) + 'px';
  } else {
    window.addEventListener('DOMContentLoaded', () => {
      document.body.insertBefore(banner, document.body.firstChild);
      document.body.style.paddingTop = (banner.offsetHeight + 10) + 'px';
    });
  }

  // Log to console as well
  console.log('%c🔍 DEBUG INFO', 'color: #ff6b35; font-size: 16px; font-weight: bold');
  console.log('User data:', userData ? '✅ EXISTS' : '❌ MISSING');
  console.log('Session data:', sessionData ? '✅ EXISTS' : '❌ MISSING');
  console.log('Username:', username || '❌ MISSING');
  console.log('localStorage keys:', localStorage.length);
  console.log('Full localStorage:', localStorage);
})();
