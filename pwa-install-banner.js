/**
 * PWA Install Banner v1.0
 * Professional install prompt for Tank Tools PWA
 * Shows only on mobile when PWA is not installed
 * Auto-hides when PWA is installed or user closes it
 */

(function() {
  'use strict';
  
  // Check if already dismissed
  if (localStorage.getItem('pwa_banner_dismissed') === 'true') {
    return;
  }
  
  // Check if running as PWA
  if (window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone === true) {
    return;
  }
  
  // Check if mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (!isMobile) {
    return;
  }
  
  let deferredPrompt;
  
  // Capture the beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showBanner();
  });
  
  function showBanner() {
    // Create banner HTML
    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.innerHTML = `
      <div class="pwa-banner-content">
        <div class="pwa-banner-icon">
          <img src="icon.png" alt="Tank Tools" width="48" height="48">
        </div>
        <div class="pwa-banner-text">
          <div class="pwa-banner-title">Tank Tools</div>
          <div class="pwa-banner-subtitle">ثبّت التطبيق للوصول السريع</div>
        </div>
        <button class="pwa-banner-install" id="pwa-install-btn">
          <span>تثبيت</span>
        </button>
        <button class="pwa-banner-close" id="pwa-close-btn" aria-label="Close">
          ✕
        </button>
      </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      #pwa-install-banner {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #B8860B 0%, #8B6914 100%);
        color: white;
        padding: 12px 16px;
        box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.3);
        z-index: 999999;
        animation: slideUp 0.4s ease-out;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      @keyframes slideUp {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      
      .pwa-banner-content {
        display: flex;
        align-items: center;
        gap: 12px;
        max-width: 600px;
        margin: 0 auto;
      }
      
      .pwa-banner-icon {
        flex-shrink: 0;
      }
      
      .pwa-banner-icon img {
        display: block;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }
      
      .pwa-banner-text {
        flex: 1;
        min-width: 0;
      }
      
      .pwa-banner-title {
        font-size: 16px;
        font-weight: 700;
        margin-bottom: 2px;
        color: white;
      }
      
      .pwa-banner-subtitle {
        font-size: 13px;
        opacity: 0.95;
        color: rgba(255, 255, 255, 0.9);
      }
      
      .pwa-banner-install {
        background: white;
        color: #B8860B;
        border: none;
        padding: 10px 24px;
        border-radius: 8px;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        flex-shrink: 0;
      }
      
      .pwa-banner-install:active {
        transform: scale(0.96);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
      }
      
      .pwa-banner-close {
        background: transparent;
        border: none;
        color: white;
        font-size: 24px;
        line-height: 1;
        cursor: pointer;
        padding: 4px 8px;
        opacity: 0.8;
        transition: opacity 0.2s;
        flex-shrink: 0;
      }
      
      .pwa-banner-close:hover {
        opacity: 1;
      }
      
      @media (max-width: 400px) {
        #pwa-install-banner {
          padding: 10px 12px;
        }
        
        .pwa-banner-content {
          gap: 8px;
        }
        
        .pwa-banner-icon img {
          width: 40px;
          height: 40px;
        }
        
        .pwa-banner-title {
          font-size: 14px;
        }
        
        .pwa-banner-subtitle {
          font-size: 12px;
        }
        
        .pwa-banner-install {
          padding: 8px 16px;
          font-size: 14px;
        }
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(banner);
    
    // Install button click
    document.getElementById('pwa-install-btn').addEventListener('click', async () => {
      if (!deferredPrompt) {
        return;
      }
      
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('✅ PWA installed successfully');
      }
      
      deferredPrompt = null;
      hideBanner();
    });
    
    // Close button click
    document.getElementById('pwa-close-btn').addEventListener('click', () => {
      localStorage.setItem('pwa_banner_dismissed', 'true');
      hideBanner();
    });
  }
  
  function hideBanner() {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      banner.style.animation = 'slideDown 0.3s ease-in';
      setTimeout(() => banner.remove(), 300);
    }
  }
  
  // Add slideDown animation
  const slideDownStyle = document.createElement('style');
  slideDownStyle.textContent = `
    @keyframes slideDown {
      from {
        transform: translateY(0);
        opacity: 1;
      }
      to {
        transform: translateY(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(slideDownStyle);
  
})();
