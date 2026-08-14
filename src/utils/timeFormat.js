/**
 * Convert seconds or milliseconds to formatted string (e.g. 03:45 or 01:12:30)
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
function formatDuration(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const sec = Math.floor(seconds % 60);
  const min = Math.floor((seconds / 60) % 60);
  const hrs = Math.floor(seconds / 3600);

  const pad = (n) => n.toString().padStart(2, '0');

  if (hrs > 0) {
    return `${pad(hrs)}:${pad(min)}:${pad(sec)}`;
  }
  return `${pad(min)}:${pad(sec)}`;
}

/**
 * Parse time strings like "1:30", "90s", "1m30s", "01:20:00" to total seconds
 * @param {string} input - User time string
 * @returns {number|null} Total seconds or null if invalid
 */
function parseTimeString(input) {
  if (!input || typeof input !== 'string') return null;
  const str = input.trim().toLowerCase();

  // If pure number (seconds)
  if (/^\d+$/.test(str)) {
    return parseInt(str, 10);
  }

  // If formatted like 1h20m30s, 30s, 2m
  let total = 0;
  let matched = false;
  const hMatch = str.match(/(\d+)\s*h/);
  const mMatch = str.match(/(\d+)\s*m(?!s)/);
  const sMatch = str.match(/(\d+)\s*s/);

  if (hMatch) { total += parseInt(hMatch[1], 10) * 3600; matched = true; }
  if (mMatch) { total += parseInt(mMatch[1], 10) * 60; matched = true; }
  if (sMatch) { total += parseInt(sMatch[1], 10); matched = true; }

  if (matched) return total;

  // If formatted like HH:MM:SS or MM:SS
  const parts = str.split(':').map((p) => parseInt(p, 10));
  if (parts.some((p) => isNaN(p))) return null;

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }

  return null;
}

/**
 * Create a sleek Discord progress bar
 * @param {number} current - Current seconds
 * @param {number} total - Total seconds
 * @param {number} [barLength=15] - Length of bar in segments
 * @returns {string} Formatted progress bar
 */
function createProgressBar(current, total, barLength = 15) {
  if (!total || total <= 0) {
    return `🔘${'▬'.repeat(barLength)} (Live)`;
  }
  const progress = Math.min(Math.max(current / total, 0), 1);
  const filledLength = Math.round(barLength * progress);
  const emptyLength = barLength - filledLength;

  const filledBar = '▬'.repeat(Math.max(0, filledLength - 1));
  const emptyBar = '▬'.repeat(Math.max(0, emptyLength));

  return `${filledBar}🔘${emptyBar}`;
}

module.exports = {
  formatDuration,
  parseTimeString,
  createProgressBar
};
