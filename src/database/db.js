const fs = require('fs');
const path = require('path');
const Guild = require('./models/Guild');
const User = require('./models/User');
const History = require('./models/History');
const { getDatabaseStatus } = require('./connect');
const logger = require('../utils/logger');
const config = require('../config');

const DATA_DIR = path.join(__dirname, '../../data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const LIKED_FILE = path.join(DATA_DIR, 'liked.json');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadJson(file, defaultVal = {}) {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  } catch (err) {
    logger.error(`Error loading file ${file}:`, err.message);
  }
  return defaultVal;
}

function saveJson(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    logger.error(`Error saving file ${file}:`, err.message);
  }
}

class DatabaseService {
  constructor() {
    this.guildCache = new Map();
    this.userCache = new Map();
    this.historyCache = new Map();

    // Pre-populate cache from local files
    const localSettings = loadJson(SETTINGS_FILE, {});
    for (const [k, v] of Object.entries(localSettings)) {
      this.guildCache.set(k, v);
    }

    const localLiked = loadJson(LIKED_FILE, {});
    for (const [k, v] of Object.entries(localLiked)) {
      this.userCache.set(k, v);
    }

    const localHist = loadJson(HISTORY_FILE, {});
    for (const [k, v] of Object.entries(localHist)) {
      this.historyCache.set(k, v);
    }
  }

  getDefaultSettings() {
    return {
      prefix: config.discord.defaultPrefix,
      defaultVolume: config.audio.defaultVolume,
      voteSkipPercent: config.audio.voteSkipPercent,
      stayInVC24_7: config.audio.stayInVC24_7,
      announceNowPlaying: config.audio.announceNowPlaying,
      djRoleId: null
    };
  }

  // --- Guild Settings ---
  getGuildSettings(guildId) {
    if (!guildId) return this.getDefaultSettings();
    if (!this.guildCache.has(guildId)) {
      this.guildCache.set(guildId, this.getDefaultSettings());
      // Attempt async fetch from MongoDB
      if (getDatabaseStatus()) {
        Guild.findOne({ guildId })
          .then((doc) => {
            if (doc) {
              this.guildCache.set(guildId, {
                prefix: doc.prefix,
                defaultVolume: doc.defaultVolume,
                voteSkipPercent: doc.voteSkipPercent,
                stayInVC24_7: doc.stayInVC24_7,
                announceNowPlaying: doc.announceNowPlaying,
                djRoleId: doc.djRoleId
              });
            }
          })
          .catch((err) => logger.debug('MongoDB guild find error:', err.message));
      }
    }
    return { ...this.getDefaultSettings(), ...this.guildCache.get(guildId) };
  }

  setGuildSetting(guildId, key, value) {
    const current = this.getGuildSettings(guildId);
    current[key] = value;
    this.guildCache.set(guildId, current);

    // Save local backup
    const all = Object.fromEntries(this.guildCache);
    saveJson(SETTINGS_FILE, all);

    // Save to MongoDB if connected
    if (getDatabaseStatus()) {
      Guild.findOneAndUpdate(
        { guildId },
        { $set: { [key]: value } },
        { upsert: true, new: true }
      ).catch((err) => logger.error('MongoDB Guild update error:', err.message));
    }

    return current;
  }

  updateGuildSettings(guildId, newSettings) {
    const current = { ...this.getGuildSettings(guildId), ...newSettings };
    this.guildCache.set(guildId, current);

    const all = Object.fromEntries(this.guildCache);
    saveJson(SETTINGS_FILE, all);

    if (getDatabaseStatus()) {
      Guild.findOneAndUpdate(
        { guildId },
        { $set: newSettings },
        { upsert: true, new: true }
      ).catch((err) => logger.error('MongoDB Guild update error:', err.message));
    }

    return current;
  }

  // --- User Liked Tracks ---
  getLikedSongs(userId) {
    if (!userId) return [];
    if (!this.userCache.has(userId)) {
      this.userCache.set(userId, []);
      if (getDatabaseStatus()) {
        User.findOne({ userId })
          .then((doc) => {
            if (doc && Array.isArray(doc.likedTracks)) {
              this.userCache.set(userId, doc.likedTracks);
            }
          })
          .catch((err) => logger.debug('MongoDB User find error:', err.message));
      }
    }
    return this.userCache.get(userId) || [];
  }

  isLiked(userId, trackUrl) {
    const list = this.getLikedSongs(userId);
    return list.some((item) => item.url === trackUrl);
  }

  toggleLike(userId, track) {
    const list = [...this.getLikedSongs(userId)];
    const index = list.findIndex((item) => item.url === track.url);
    let liked = false;

    if (index > -1) {
      list.splice(index, 1);
      liked = false;
    } else {
      list.unshift({
        url: track.url,
        title: track.title,
        duration: track.duration,
        durationFormatted: track.durationFormatted,
        thumbnail: track.thumbnail,
        author: track.author,
        addedAt: new Date()
      });
      liked = true;
    }

    this.userCache.set(userId, list);
    const all = Object.fromEntries(this.userCache);
    saveJson(LIKED_FILE, all);

    if (getDatabaseStatus()) {
      User.findOneAndUpdate(
        { userId },
        { $set: { likedTracks: list } },
        { upsert: true, new: true }
      ).catch((err) => logger.error('MongoDB User liked update error:', err.message));
    }

    return { liked, count: list.length };
  }

  // --- Listening History ---
  addHistory(guildId, userId, track) {
    if (!guildId) return;

    let guildHistory = this.historyCache.get(guildId) || [];
    const entry = {
      guildId,
      userId,
      title: track.title,
      url: track.url,
      duration: track.duration,
      durationFormatted: track.durationFormatted,
      thumbnail: track.thumbnail,
      author: track.author,
      playedAt: new Date()
    };

    guildHistory.unshift(entry);
    if (guildHistory.length > 100) guildHistory.pop();
    this.historyCache.set(guildId, guildHistory);

    const all = Object.fromEntries(this.historyCache);
    saveJson(HISTORY_FILE, all);

    if (getDatabaseStatus()) {
      History.create(entry).catch((err) => logger.error('MongoDB History insert error:', err.message));
    }
  }

  getGuildHistory(guildId, limit = 20) {
    if (!guildId) return [];
    return (this.historyCache.get(guildId) || []).slice(0, limit);
  }

  getUserHistory(userId, limit = 20) {
    if (!userId) return [];
    const all = [];
    for (const [, list] of this.historyCache) {
      const userList = list.filter((t) => t.userId === userId);
      all.push(...userList);
    }
    all.sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt));
    return all.slice(0, limit);
  }
}

module.exports = new DatabaseService();
