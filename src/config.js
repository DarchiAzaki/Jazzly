require('dotenv').config();

module.exports = {
  bot: {
    name: 'Jazzly',
    version: '1.0.0',
    color: '#3498db', 
    colorSuccess: '#2ecc71',
    colorWarning: '#f39c12',
    colorError: '#e74c3c',
    colorSecondary: '#9b59b6',
    website: 'https://hallofmalevolence.org/jazzly',
    byline: 'Jazzly by [Hall of Malevolence](<https://hallofmalevolence.org/jazzly>)',
    footer: '-# Jazzly by [Hall of Malevolence](<https://hallofmalevolence.org/jazzly>)'
  },
  discord: {
    token: process.env.DISCORD_TOKEN || '',
    clientId: process.env.CLIENT_ID || '',
    defaultPrefix: process.env.DEFAULT_PREFIX || '!'
  },
  spotify: {
    clientId: process.env.SPOTIFY_CLIENT_ID || '',
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET || ''
  },
  audio: {
    defaultVolume: parseInt(process.env.DEFAULT_VOLUME, 10) || 80,
    maxVolume: 200,
    voteSkipPercent: parseInt(process.env.VOTE_SKIP_PERCENT, 10) || 50,
    stayInVC24_7: process.env.STAY_IN_VC_24_7 === 'true',
    leaveOnEmptyTimeoutMs: (parseInt(process.env.LEAVE_ON_EMPTY_TIMEOUT_SECONDS, 10) || 60) * 1000,
    announceNowPlaying: process.env.ANNOUNCE_NOW_PLAYING !== 'false',
    youtubeCookie: process.env.YOUTUBE_COOKIE || ''
  },
  emojis: {
    play: '▶️',
    pause: '⏸️',
    resume: '▶️',
    stop: '⏹️',
    skip: '⏭️',
    previous: '⏮️',
    replay: '🔄',
    loop: '🔂',
    loopQueue: '🔁',
    shuffle: '🔀',
    volumeUp: '🔊',
    volumeDown: '🔉',
    volumeMute: '🔇',
    heart: '❤️',
    heartBroken: '💔',
    queue: '📜',
    effects: '🎛️',
    search: '🔍',
    settings: '⚙️',
    info: 'ℹ️',
    ping: '🏓',
    musicNote: '🎵',
    sparkles: '✨',
    disc: '💿',
    time: '⏳',
    user: '👤',
    equalizer: '📊',
    check: '✅',
    cross: '❌',
    dot: '•'
  }
};
