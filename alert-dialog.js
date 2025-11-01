/**
 * Tank Alert Dialog System
 * Handles foreground notifications with custom sound loop and snooze/dismiss
 */

// Global variables for alert management
let currentAlertAudio = null;
let currentAlertInterval = null;
let currentAlertDialog = null;

/**
 * Show tank alert dialog with custom sound loop
 */
function showTankAlert(payload) {
  console.log('🚨 Showing tank alert:', payload);
  
  // Extract data from payload
  const title = payload.notification?.title || 'Tank Alert';
  const body = payload.notification?.body || '';
  const soundFile = payload.data?.soundFile || 'sound1';
  const tankNumber = payload.data?.tankNumber || '';
  const department = payload.data?.department || '';
  const notificationId = payload.data?.notificationId || '';
  
  // Close any existing alert
  closeAlert();
  
  // Create alert dialog
  const dialog = document.createElement('div');
  dialog.id = 'tankAlertDialog';
  dialog.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
  `;
  
  dialog.innerHTML = `
    <div style="
      background: linear-gradient(135deg, #003366 0%, #004080 100%);
      border-radius: 20px;
      padding: 40px;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      border: 3px solid #FFD700;
      animation: slideUp 0.3s ease;
    ">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="font-size: 80px; margin-bottom: 20px; animation: pulse 1s infinite;">
          🔔
        </div>
        <h2 style="color: #FFD700; font-size: 28px; margin-bottom: 15px; font-weight: bold;">
          ${title}
        </h2>
        <p style="color: white; font-size: 18px; line-height: 1.6; margin-bottom: 20px;">
          ${body}
        </p>
        <div style="background: rgba(255, 255, 255, 0.1); padding: 15px; border-radius: 10px; margin-top: 20px;">
          <p style="color: #FFD700; font-size: 16px; margin: 5px 0;">
            <strong>Tank:</strong> ${tankNumber}
          </p>
          <p style="color: #FFD700; font-size: 16px; margin: 5px 0;">
            <strong>Department:</strong> ${department}
          </p>
        </div>
      </div>
      
      <div style="display: flex; gap: 15px; flex-wrap: wrap; justify-content: center;">
        <button onclick="snoozeAlert('${notificationId}')" style="
          flex: 1;
          min-width: 140px;
          padding: 15px 25px;
          background: linear-gradient(45deg, #ff9800, #f57c00);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(255, 152, 0, 0.4);
        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(255, 152, 0, 0.6)';" onmouseout="this.style.transform=''; this.style.boxShadow='0 4px 15px rgba(255, 152, 0, 0.4)';">
          ⏰ Snooze (5 min)
        </button>
        
        <button onclick="dismissAlert('${notificationId}')" style="
          flex: 1;
          min-width: 140px;
          padding: 15px 25px;
          background: linear-gradient(45deg, #4CAF50, #45a049);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(76, 175, 80, 0.6)';" onmouseout="this.style.transform=''; this.style.boxShadow='0 4px 15px rgba(76, 175, 80, 0.4)';">
          ✓ Dismiss
        </button>
      </div>
      
      <div style="margin-top: 20px; text-align: center;">
        <button onclick="viewTankDetails('${tankNumber}')" style="
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.1);
          color: #FFD700;
          border: 2px solid #FFD700;
          border-radius: 8px;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        " onmouseover="this.style.background='rgba(255, 215, 0, 0.2)';" onmouseout="this.style.background='rgba(255, 255, 255, 0.1)';">
          📊 View Tank Details
        </button>
      </div>
    </div>
  `;
  
  // Add CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateY(50px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
  `;
  document.head.appendChild(style);
  
  // Add dialog to page
  document.body.appendChild(dialog);
  currentAlertDialog = dialog;
  
  // Start sound loop
  startSoundLoop(soundFile);
  
  // Vibrate if supported
  if ('vibrate' in navigator) {
    navigator.vibrate([200, 100, 200, 100, 200]);
  }
}

/**
 * Start sound loop
 */
function startSoundLoop(soundFile) {
  console.log('🔊 Starting sound loop:', soundFile);
  
  // Play sound immediately
  playAlertSound(soundFile);
  
  // Repeat every 3 seconds
  currentAlertInterval = setInterval(() => {
    playAlertSound(soundFile);
  }, 3000);
}

/**
 * Play alert sound using Web Audio API
 */
function playAlertSound(soundFile) {
  try {
    switch(soundFile) {
      case 'sound1':
        // Gentle bell sound
        playTone(800, 200);
        break;
      case 'sound2':
        // Alert tone
        playTone(1000, 300);
        setTimeout(() => playTone(800, 300), 350);
        break;
      case 'sound3':
        // Urgent alarm
        playTone(1200, 200);
        setTimeout(() => playTone(1200, 200), 250);
        setTimeout(() => playTone(1200, 200), 500);
        break;
      default:
        playTone(800, 200);
    }
  } catch (error) {
    console.error('Error playing sound:', error);
  }
}

/**
 * Play tone using Web Audio API
 */
function playTone(frequency, duration) {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  } catch (error) {
    console.error('Error playing tone:', error);
  }
}

/**
 * Stop sound loop
 */
function stopSoundLoop() {
  if (currentAlertInterval) {
    clearInterval(currentAlertInterval);
    currentAlertInterval = null;
  }
  
  if (currentAlertAudio) {
    currentAlertAudio.pause();
    currentAlertAudio = null;
  }
}

/**
 * Close alert dialog
 */
function closeAlert() {
  stopSoundLoop();
  
  if (currentAlertDialog) {
    currentAlertDialog.remove();
    currentAlertDialog = null;
  }
}

/**
 * Snooze alert (5 minutes)
 */
async function snoozeAlert(notificationId) {
  console.log('⏰ Snoozing alert:', notificationId);
  
  closeAlert();
  
  // Update notification in Firestore
  if (notificationId && window.db) {
    try {
      const notificationRef = window.doc(window.db, 'notificationsManager', notificationId);
      const notificationDoc = await window.getDoc(notificationRef);
      
      if (notificationDoc.exists()) {
        const data = notificationDoc.data();
        const newFinishTime = new Date(data.finishDateTime.toDate().getTime() + 5 * 60 * 1000);
        
        await window.updateDoc(notificationRef, {
          finishDateTime: window.Timestamp.fromDate(newFinishTime),
          sent: false,
          sentAt: null,
          fcmResponse: null
        });
        
        console.log('✅ Notification snoozed for 5 minutes');
        
        // Show message
        if (window.showMessage) {
          window.showMessage('⏰ Alert snoozed for 5 minutes', 'info');
        }
        
        // Reload notifications
        if (window.loadNotifications) {
          window.loadNotifications();
        }
      }
    } catch (error) {
      console.error('Error snoozing notification:', error);
    }
  }
}

/**
 * Dismiss alert
 */
async function dismissAlert(notificationId) {
  console.log('✓ Dismissing alert:', notificationId);
  
  closeAlert();
  
  // Mark notification as inactive in Firestore
  if (notificationId && window.db) {
    try {
      const notificationRef = window.doc(window.db, 'notificationsManager', notificationId);
      await window.updateDoc(notificationRef, {
        active: false
      });
      
      console.log('✅ Notification dismissed');
      
      // Show message
      if (window.showMessage) {
        window.showMessage('✓ Alert dismissed', 'success');
      }
      
      // Reload notifications
      if (window.loadNotifications) {
        window.loadNotifications();
      }
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  }
}

/**
 * View tank details
 */
function viewTankDetails(tankNumber) {
  console.log('📊 Viewing tank details:', tankNumber);
  
  closeAlert();
  
  // Navigate to live tanks page
  window.location.href = `/live-tanks.html?tank=${tankNumber}`;
}

// Export functions to window
window.showTankAlert = showTankAlert;
window.closeAlert = closeAlert;
window.snoozeAlert = snoozeAlert;
window.dismissAlert = dismissAlert;
window.viewTankDetails = viewTankDetails;

console.log('✅ Alert Dialog System loaded!');
