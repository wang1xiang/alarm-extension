// Notification utility functions

/**
 * Send a browser notification
 * @param {Object} options
 * @param {string} options.type - 'alarm' or 'timer'
 * @param {string} options.id - Alarm/Timer ID
 * @param {string} options.title - Notification title
 * @param {string} options.message - Notification message
 */
async function sendNotification(options) {
  const notificationOptions = {
    type: 'basic',
    iconUrl: 'assets/icon.png',
    title: options.title,
    message: options.message,
    priority: 2,
    requireInteraction: true,
    silent: false
  };

  // Request permission if needed
  if (Notification.permission !== 'granted') {
    await Notification.requestPermission();
  }

  // Create Chrome notification
  chrome.notifications.create(options.id, notificationOptions);

  // Also show browser notification as fallback
  if (Notification.permission === 'granted') {
    new Notification(options.title, {
      body: options.message,
      icon: 'assets/icon.png'
    });
  }
}

/**
 * Play alert sound
 * @param {string} soundFile - Sound file name
 */
function playSound(soundFile = 'default.mp3') {
  const audio = new Audio(chrome.runtime.getURL(`assets/sounds/${soundFile}`));
  audio.play().catch(() => {
    // Fallback: use silent default if sound fails
    console.log('Sound playback failed, using silent fallback');
  });
}

/**
 * Handle notification click
 * @param {string} notificationId
 */
function onNotificationClick(notificationId) {
  chrome.notifications.clear(notificationId);
  // Could open popup or focus window here
}
