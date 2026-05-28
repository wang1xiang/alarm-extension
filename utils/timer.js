// Timer utility functions

/**
 * Generate a unique ID for timers
 * @returns {string} UUID
 */
function generateTimerId() {
  return 'timer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Format milliseconds to HH:MM:SS
 * @param {number} ms
 * @returns {string}
 */
function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Create a new timer object
 * @param {number} durationMs
 * @param {string} label
 * @returns {Object}
 */
function createTimer(durationMs, label = '') {
  return {
    id: generateTimerId(),
    duration: durationMs,
    remaining: durationMs,
    label,
    running: true,
    paused: false,
    createdAt: Date.now()
  };
}
