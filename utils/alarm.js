// Alarm utility functions

/**
 * Generate a unique ID for alarms
 * @returns {string} UUID
 */
function generateAlarmId() {
  return 'alarm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Check if an alarm should trigger at the given time
 * @param {Object} alarm - Alarm object
 * @param {Date} now - Current time
 * @returns {boolean}
 */
function shouldTriggerAlarm(alarm, now) {
  if (!alarm.enabled) return false;

  const [alarmHour, alarmMinute] = alarm.time.split(':').map(Number);
  const currentDay = now.getDay();

  // Check if current day matches repeat schedule
  if (!alarm.repeat.includes(currentDay)) return false;

  // Check if time matches (within current minute)
  return now.getHours() === alarmHour &&
         now.getMinutes() === alarmMinute &&
         now.getSeconds() === 0;
}

/**
 * Format time for display
 * @param {Date} date
 * @returns {string} Formatted time (e.g., "7:30 AM")
 */
function formatTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Get next trigger date for an alarm
 * @param {Object} alarm
 * @returns {Date|null}
 */
function getNextTriggerDate(alarm) {
  const now = new Date();
  const [alarmHour, alarmMinute] = alarm.time.split(':').map(Number);

  for (let i = 0; i < 7; i++) {
    const candidate = new Date(now);
    candidate.setDate(now.getDate() + i);
    candidate.setHours(alarmHour, alarmMinute, 0, 0);

    const day = candidate.getDay();
    if (alarm.repeat.includes(day) && candidate > now) {
      return candidate;
    }
  }
  return null;
}
