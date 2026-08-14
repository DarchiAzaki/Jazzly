const { DisTube } = require('distube');
const { CustomYtDlpPlugin } = require('./plugins/YtDlpPlugin');
const { SpotifyPlugin } = require('@distube/spotify');
const { SoundCloudPlugin } = require('@distube/soundcloud');
const ffmpegPath = require('ffmpeg-static');
const { getCustomFilters } = require('./filters');
const {
  buildNowPlayingComponentsV2,
  buildTrackEnqueuedContainer,
  buildPlaylistEnqueuedContainer
} = require('../components/componentsV2');
const db = require('../database/db');
const config = require('../config');
const logger = require('../utils/logger');

class DisTubeManager {
  /**
   * @param {import('../client')} client
   */
  constructor(client) {
    this.client = client;

    const plugins = [];

    // 1. Spotify Plugin
    if (config.spotify.clientId && config.spotify.clientSecret) {
      plugins.push(
        new SpotifyPlugin({
          api: {
            clientId: config.spotify.clientId,
            clientSecret: config.spotify.clientSecret
          }
        })
      );
      logger.info('Spotify plugin enabled for DisTube.');
    } else {
      plugins.push(new SpotifyPlugin());
    }

    // 2. SoundCloud Plugin
    plugins.push(new SoundCloudPlugin());

    // 3. Robust Custom YtDlpPlugin (Separates stderr, parses clean JSON, prevents deprecation crashes)
    plugins.push(new CustomYtDlpPlugin());

    this.distube = new DisTube(client, {
      plugins: plugins,
      customFilters: getCustomFilters(),
      emitNewSongOnly: true,
      savePreviousSongs: true,
      joinNewVoiceChannel: true,
      ffmpeg: {
        path: ffmpegPath
      }
    });

    this.setupListeners();
  }

  setupListeners() {
    this.distube.on('playSong', async (queue, song) => {
      logger.audio(`Track started in guild [${queue.id}]: ${song.name}`);

      // Initialize vote skips set
      if (!queue.data) queue.data = {};
      queue.data.voteSkips = new Set();

      // Record to MongoDB History
      if (song.user) {
        db.addHistory(queue.id, song.user.id, {
          title: song.name,
          url: song.url,
          duration: song.duration || 0,
          durationFormatted: song.formattedDuration || '00:00',
          thumbnail: song.thumbnail,
          author: song.uploader?.name || 'Artist'
        });
      }

      // Announce Now Playing if enabled in Components V2 container
      const settings = db.getGuildSettings(queue.id);
      if (settings.announceNowPlaying && queue.textChannel) {
        try {
          const payload = buildNowPlayingComponentsV2(queue, song, song.user?.id);
          const msg = await queue.textChannel.send(payload);
          queue.data.nowPlayingMessage = msg;
        } catch (err) {
          logger.debug('Error sending Now Playing announcement:', err.message);
        }
      }
    });

    this.distube.on('addSong', async (queue, song) => {
      logger.debug(`Song enqueued in guild [${queue.id}]: ${song.name}`);
      // Only announce if queue already has an active song playing
      if (queue.songs.length > 1 && queue.textChannel) {
        try {
          const payload = buildTrackEnqueuedContainer(song, queue.songs.length, queue);
          await queue.textChannel.send(payload);
        } catch (err) {
          logger.debug('Error sending addSong announcement:', err.message);
        }
      }
    });

    this.distube.on('addList', async (queue, playlist) => {
      logger.debug(`Playlist enqueued in guild [${queue.id}]: ${playlist.name} (${playlist.songs.length} songs)`);
      if (queue.textChannel) {
        try {
          const payload = buildPlaylistEnqueuedContainer(playlist, playlist.user || queue.songs[0]?.user);
          await queue.textChannel.send(payload);
        } catch (err) {
          logger.debug('Error sending addList announcement:', err.message);
        }
      }
    });

    this.distube.on('error', (channel, error) => {
      logger.error('DisTube stream error:', error?.message || error);
      if (channel && typeof channel.send === 'function') {
        channel.send(`❌ An audio error occurred: \`${error?.message || 'Playback error'}\``).catch(() => {});
      }
    });

    this.distube.on('finish', (queue) => {
      logger.audio(`Queue finished in guild [${queue.id}]`);
    });

    this.distube.on('empty', (queue) => {
      logger.info(`Voice channel empty in guild [${queue.id}]`);
    });
  }

  /**
   * Get active queue
   * @param {string} guildId
   */
  getQueue(guildId) {
    return this.distube.getQueue(guildId) || null;
  }
}

module.exports = DisTubeManager;
