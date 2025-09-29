// 🚫 Hide Vercel Toolbar for PWA Users
// Developer: Fahad - 17877
// This prevents Vercel development toolbar from showing in PWA

(function hideVercelToolbar() {
  // Hide Vercel Toolbar elements
  function removeVercelUI() {
    // Target Vercel Toolbar selectors
    const vercelSelectors = [
      '[data-vercel-toolbar]',
      '.vercel-toolbar',
      '#vercel-toolbar',
      '[class*="vercel-toolbar"]',
      '[id*="vercel-toolbar"]',
      '[class*="VercelToolbar"]',
      'vercel-toolbar',
      // Vercel Live Edit elements
      '[data-vercel-live-edit]',
      '.vercel-live-edit',
      '[class*="vercel-live"]',
      // Other Vercel UI elements
      '[data-vercel]',
      '.vercel-overlay',
      '[class*="__vercel"]'
    ];

    vercelSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          element.style.display = 'none';
          element.style.visibility = 'hidden';
          element.style.opacity = '0';
          element.style.pointerEvents = 'none';
          element.remove();
        });
      } catch (e) {
        // Ignore errors for invalid selectors
      }
    });

    // Hide any elements with Vercel in their text or attributes
    document.querySelectorAll('*').forEach(element => {
      if (element.textContent && element.textContent.toLowerCase().includes('vercel')) {
        if (element.tagName !== 'SCRIPT' && element.tagName !== 'STYLE') {
          const rect = element.getBoundingClientRect();
          // If it's a small floating element (likely toolbar)
          if (rect.width < 200 && rect.height < 200) {
            element.style.display = 'none';
          }
        }
      }
    });
  }

  // CSS to hide Vercel elements
  function addVercelHideCSS() {
    const style = document.createElement('style');
    style.textContent = `
      /* Hide Vercel Toolbar - PWA Clean Mode */
      [data-vercel-toolbar],
      .vercel-toolbar,
      #vercel-toolbar,
      [class*="vercel-toolbar"],
      [id*="vercel-toolbar"],
      [class*="VercelToolbar"],
      vercel-toolbar,
      [data-vercel-live-edit],
      .vercel-live-edit,
      [class*="vercel-live"],
      [data-vercel],
      .vercel-overlay,
      [class*="__vercel"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        position: absolute !important;
        left: -9999px !important;
        top: -9999px !important;
        width: 0 !important;
        height: 0 !important;
        z-index: -1 !important;
      }
      
      /* Hide any floating dev tools */
      body > div[style*="position: fixed"],
      body > div[style*="position: absolute"] {
        pointer-events: none !important;
      }
      
      /* Ensure main content is not affected */
      .container, .main-content, .nav-bar {
        pointer-events: auto !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Check if we're in PWA mode or production
  function isPWAMode() {
    return window.matchMedia && 
           window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true ||
           window.location.hostname === 'test-tank-tools.vercel.app';
  }

  // Only run if we're in PWA mode or production
  if (isPWAMode()) {
    console.log('🚫 PWA Mode: Hiding Vercel development tools');
    
    // Add CSS immediately
    addVercelHideCSS();
    
    // Remove elements when DOM loads
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', removeVercelUI);
    } else {
      removeVercelUI();
    }
    
    // Continuously monitor and remove Vercel UI (in case it loads async)
    setInterval(removeVercelUI, 2000);
    
    // Monitor DOM mutations to catch dynamically added Vercel elements
    if (window.MutationObserver) {
      const observer = new MutationObserver(removeVercelUI);
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true
      });
    }
  }

  console.log('🔒 Vercel Toolbar Blocker loaded - PWA User Experience Protected');
})();