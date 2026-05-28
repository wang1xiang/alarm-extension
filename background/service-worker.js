// Service Worker - Background process for alarm/timer management

importScripts('../utils/alarm.js');
importScripts('../utils/timer.js');

// State
let alarms = [];
let activeTimers = [];

/**
 * Load data from storage on startup
 */
async function initialize() {
  const result = await chrome.storage.local.get(['alarms', 'timers', 'settings']);
  alarms = result.alarms || [];
  activeTimers = result.timers || [];

  // Start the check loops
  startAlarmChecker();
  startTimerChecker();
}

/**
 * Check alarms every second
 */
function startAlarmChecker() {
  setInterval(async () => {
    const now = new Date();

    for (const alarm of alarms) {
      if (shouldTriggerAlarm(alarm, now)) {
        await triggerAlarm(alarm);
      }
    }
  }, 1000);
}

/**
 * Trigger an alarm
 */
async function triggerAlarm(alarm) {
  const label = alarm.label || '闹钟';

  // Request permission for Chrome notifications
  if (chrome.notifications) {
    chrome.notifications.create(`alarm_${alarm.id}_${Date.now()}`, {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('assets/icon.png'),
      title: `⏰ ${label}`,
      message: `时间到了 ${formatTime(new Date())}！`,
      priority: 2,
      requireInteraction: true
    });
  }

  playSound(alarm.sound || 'default.mp3');
}

/**
 * Update timers every 100ms
 */
function startTimerChecker() {
  let lastUpdate = Date.now();

  setInterval(async () => {
    const now = Date.now();
    const delta = now - lastUpdate;
    lastUpdate = now;

    let changed = false;

    // Update running timers
    activeTimers = activeTimers.filter(timer => {
      if (timer.running && !timer.paused) {
        timer.remaining -= delta;
        changed = true;

        if (timer.remaining <= 0) {
          triggerTimer(timer);
          return false; // Remove completed timer
        }
      }
      return timer.running;
    });

    // Update badge count
    const activeCount = activeTimers.filter(t => t.running && !t.paused).length;
    chrome.action.setBadgeText({
      text: activeCount.toString()
    });

    if (changed) {
      await chrome.storage.local.set({ timers: activeTimers });
    }
  }, 100);
}

/**
 * Trigger timer completion
 */
async function triggerTimer(timer) {
  const label = timer.label || '倒计时';

  if (chrome.notifications) {
    chrome.notifications.create(`timer_${timer.id}_${Date.now()}`, {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('assets/icon.png'),
      title: `⏱️ ${label} 结束`,
      message: '倒计时已结束！',
      priority: 2,
      requireInteraction: true
    });
  }

  playSound('timer.mp3');
}

/**
 * Handle messages from popup
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message).then(sendResponse);
  return true; // Keep channel open for async response
});

async function handleMessage(message) {
  console.log('Service Worker received message:', message);

  switch (message.type) {
    case 'GET_STATE':
      return { alarms, timers: activeTimers };

    case 'ADD_ALARM':
      console.log('Adding alarm:', message.alarm);
      alarms.push(message.alarm);
      await chrome.storage.local.set({ alarms });
      console.log('Alarm added, storage updated:', alarms);
      return { success: true, alarms };

    case 'REMOVE_ALARM':
      console.log('Removing alarm:', message.id);
      const beforeCount = alarms.length;
      alarms = alarms.filter(a => a.id !== message.id);
      console.log('After filter:', alarms.length, 'alarms');
      await chrome.storage.local.set({ alarms });
      console.log('Alarm removed, storage updated');
      return { success: true, alarms };

    case 'UPDATE_ALARM':
      const index = alarms.findIndex(a => a.id === message.alarm.id);
      console.log('Update alarm index:', index);
      if (index !== -1) {
        alarms[index] = message.alarm;
        await chrome.storage.local.set({ alarms });
      }
      return { success: true, alarms };

    case 'START_TIMER':
      const timer = createTimer(message.duration, message.label);
      activeTimers.push(timer);
      await chrome.storage.local.set({ timers: activeTimers });
      return { success: true, timer, timers: activeTimers };

    case 'PAUSE_TIMER':
      const pauseTimer = activeTimers.find(t => t.id === message.id);
      if (pauseTimer) {
        pauseTimer.paused = message.paused;
        await chrome.storage.local.set({ timers: activeTimers });
      }
      return { success: true, timers: activeTimers };

    case 'DELETE_TIMER':
      activeTimers = activeTimers.filter(t => t.id !== message.id);
      await chrome.storage.local.set({ timers: activeTimers });
      return { success: true, timers: activeTimers };

    case 'TEST_NOTIFICATION':
      if (chrome.notifications) {
        chrome.notifications.create(`test_${Date.now()}`, {
          type: 'basic',
          iconUrl: chrome.runtime.getURL('assets/icon.png'),
          title: '测试通知',
          message: '通知功能正常工作！',
          priority: 2,
          requireInteraction: true
        });
        return { success: true };
      }
      return { success: false, error: 'Notifications API not available' };

    case 'REQUEST_PERMISSIONS':
      return { success: true };

    default:
      return { error: '未知消息类型' };
  }
}

// Initialize on startup
initialize();
