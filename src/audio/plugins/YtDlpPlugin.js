const { PlayableExtractorPlugin, Playlist, Song, DisTubeError } = require('distube');
const { spawn } = require('child_process');
const path = require('path');
const dargs = require('dargs');

const YTDLP_IS_WINDOWS = process.platform === 'win32';
const YTDLP_DIR = path.join(__dirname, '..', '..', '..', 'node_modules', '@distube', 'yt-dlp', 'bin');
const YTDLP_FILENAME = `yt-dlp${YTDLP_IS_WINDOWS ? '.exe' : ''}`;
const YTDLP_PATH = path.join(YTDLP_DIR, YTDLP_FILENAME);

function buildArgs(url, flags = {}) {
  return [url].concat(dargs(flags, { useEquals: false })).filter(Boolean);
}

function runYtDlpJson(url, flags = {}, options = {}) {
  return new Promise((resolve, reject) => {
    const defaultFlags = {
      dumpSingleJson: true,
      noWarnings: true,
      noCallHome: true,
      preferFreeFormats: true,
      skipDownload: true,
      simulate: true,
      ...flags
    };

    const process = spawn(YTDLP_PATH, buildArgs(url, defaultFlags), options);
    let stdout = '';
    let stderr = '';

    process.stdout?.on('data', (chunk) => {
      stdout += chunk;
    });

    process.stderr?.on('data', (chunk) => {
      stderr += chunk;
    });

    process.on('close', (code) => {
      if (code === 0) {
        try {
          const trimmed = stdout.trim();
          const firstBrace = trimmed.indexOf('{');
          const lastBrace = trimmed.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1) {
            const cleanJson = trimmed.slice(firstBrace, lastBrace + 1);
            return resolve(JSON.parse(cleanJson));
          }
          return resolve(JSON.parse(trimmed));
        } catch (parseErr) {
          reject(new DisTubeError('YTDLP_PARSE_ERROR', `Failed to parse yt-dlp JSON: ${parseErr.message}\nRaw output: ${stdout.substring(0, 200)}`));
        }
      } else {
        reject(new DisTubeError('YTDLP_ERROR', stderr || stdout || `Process exited with code ${code}`));
      }
    });

    process.on('error', (err) => {
      reject(new DisTubeError('YTDLP_SPAWN_ERROR', err.message));
    });
  });
}

class CustomYtDlpSong extends Song {
  constructor(plugin, info, options = {}) {
    super(
      {
        plugin,
        source: info.extractor || 'youtube',
        playFromSource: true,
        id: info.id,
        name: info.title || info.fulltitle || 'Unknown Title',
        url: info.webpage_url || info.original_url || info.url,
        isLive: Boolean(info.is_live),
        thumbnail: info.thumbnail || info.thumbnails?.[0]?.url,
        duration: info.is_live ? 0 : (info.duration || 0),
        uploader: {
          name: info.uploader || info.channel || 'Artist',
          url: info.uploader_url || info.channel_url
        },
        views: info.view_count || 0,
        likes: info.like_count || 0,
        dislikes: info.dislike_count || 0,
        reposts: info.repost_count || 0,
        ageRestricted: Boolean(info.age_limit && info.age_limit >= 18)
      },
      options
    );
  }
}

class CustomYtDlpPlugin extends PlayableExtractorPlugin {
  constructor() {
    super();
  }

  init(distube) {
    super.init(distube);
  }

  validate() {
    return true;
  }

  async resolve(url, options) {
    const info = await runYtDlpJson(url);

    if (Array.isArray(info.entries)) {
      if (info.entries.length === 0) {
        throw new DisTubeError('YTDLP_ERROR', 'The playlist is empty');
      }
      return new Playlist(
        {
          source: info.extractor || 'youtube',
          songs: info.entries.map((i) => new CustomYtDlpSong(this, i, options)),
          id: info.id ? info.id.toString() : 'playlist',
          name: info.title || 'Playlist',
          url: info.webpage_url || url,
          thumbnail: info.thumbnails?.[0]?.url
        },
        options
      );
    }

    return new CustomYtDlpSong(this, info, options);
  }

  async getStreamURL(song) {
    if (!song.url) {
      throw new DisTubeError('YTDLP_PLUGIN_INVALID_SONG', 'Cannot get stream URL from invalid song.');
    }

    const info = await runYtDlpJson(song.url, { format: 'ba/ba*' });
    if (Array.isArray(info.entries)) {
      throw new DisTubeError('YTDLP_ERROR', 'Cannot get stream URL of an entire playlist');
    }

    return info.url;
  }

  getRelatedSongs() {
    return [];
  }
}

module.exports = {
  CustomYtDlpPlugin,
  CustomYtDlpSong,
  runYtDlpJson
};
