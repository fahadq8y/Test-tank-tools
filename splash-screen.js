/**
 * Splash Screen v1.0
 * Professional loading screen for Tank Tools PWA
 * Shows on page load and fades out when content is ready
 * Developer: Fahad - 17877
 */

(function() {
  'use strict';
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSplash);
  } else {
    initSplash();
  }
  
  function initSplash() {
  // Create splash screen HTML
  const splashHTML = `
    <div id="splash-screen" class="splash-screen">
      <div class="splash-content">
        <div class="splash-logo">
          <img src="icon.png" alt="Tank Tools" class="splash-icon">
        </div>
        <h1 class="splash-title">Tank Tools</h1>
        <p class="splash-subtitle">KNPC System</p>
        <div class="splash-loader">
          <div class="loader-bar"></div>
        </div>
        <p class="splash-footer">By Fahad - 17877</p>
      </div>
    </div>
  `;
  
  // Create splash screen styles
  const splashStyles = `
    <style>
      .splash-screen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        transition: opacity 0.5s ease-out, visibility 0.5s ease-out;
      }
      
      .splash-screen.fade-out {
        opacity: 0;
        visibility: hidden;
      }
      
      .splash-content {
        text-align: center;
        animation: splashFadeIn 0.6s ease-out;
      }
      
      @keyframes splashFadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .splash-logo {
        margin-bottom: 20px;
        animation: splashBounce 1s ease-in-out infinite;
      }
      
      @keyframes splashBounce {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-10px);
        }
      }
      
      .splash-icon {
        width: 120px;
        height: 120px;
        border-radius: 24px;
        box-shadow: 0 8px 32px rgba(184, 134, 11, 0.3);
        background: linear-gradient(135deg, #B8860B 0%, #8B6914 100%);
        padding: 8px;
      }
      
      .splash-title {
        font-size: 32px;
        font-weight: 700;
        color: #B8860B;
        margin: 0 0 8px 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        text-shadow: 0 2px 8px rgba(184, 134, 11, 0.3);
      }
      
      .splash-subtitle {
        font-size: 16px;
        color: rgba(255, 255, 255, 0.7);
        margin: 0 0 32px 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .splash-loader {
        width: 200px;
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
        margin: 0 auto 24px;
        overflow: hidden;
      }
      
      .loader-bar {
        width: 40%;
        height: 100%;
        background: linear-gradient(90deg, #B8860B 0%, #DAA520 50%, #B8860B 100%);
        border-radius: 2px;
        animation: loaderSlide 1.5s ease-in-out infinite;
        box-shadow: 0 0 10px rgba(184, 134, 11, 0.5);
      }
      
      @keyframes loaderSlide {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(350%);
        }
      }
      
      .splash-footer {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.5);
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      /* Responsive */
      @media (max-width: 480px) {
        .splash-icon {
          width: 96px;
          height: 96px;
        }
        
        .splash-title {
          font-size: 28px;
        }
        
        .splash-subtitle {
          font-size: 14px;
        }
        
        .splash-loader {
          width: 160px;
        }
      }
    </style>
  `;
  
  // Inject styles first
  if (document.head) {
    document.head.insertAdjacentHTML('beforeend', splashStyles);
  }
  
  // Inject splash screen
  if (document.body) {
    document.body.insertAdjacentHTML('afterbegin', splashHTML);
  } else {
    console.warn('⚠️ document.body not ready for splash screen');
    return;
  }
  
  // Get splash screen element
  const splashScreen = document.getElementById('splash-screen');
  
  // Hide splash screen when page is fully loaded
  function hideSplash() {
    splashScreen.classList.add('fade-out');
    setTimeout(() => {
      splashScreen.remove();
    }, 500);
  }
  
  // Wait for page load
  if (document.readyState === 'complete') {
    // Page already loaded
    setTimeout(hideSplash, 2000); // Show for at least 2 seconds
  } else {
    // Wait for load event
    window.addEventListener('load', () => {
      setTimeout(hideSplash, 2000); // Show for at least 2 seconds
    });
  }
  
  // Fallback: hide after 6 seconds max
  setTimeout(hideSplash, 6000);
  
  console.log('✅ Splash Screen loaded - Tank Tools v1.0');
  }
  
})();
