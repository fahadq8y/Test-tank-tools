/**
 * Last Page Tracker
 * Saves the current page to localStorage for PWA redirect
 * Developer: Fahad - 17877
 */

(function() {
  // Get current page filename
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  // Don't track login page
  if (currentPage === 'login.html') {
    return;
  }
  
  // Save to localStorage
  try {
    localStorage.setItem('tanktools_last_page', currentPage);
    console.log('📍 Last page saved:', currentPage);
  } catch (error) {
    console.error('❌ Error saving last page:', error);
  }
})();
