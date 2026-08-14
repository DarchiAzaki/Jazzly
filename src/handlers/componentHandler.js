const {
  buildNowPlayingComponentsV2,
  buildQueueContainer,
  buildEffectsContainer,
  buildHelpComponentsV2,
  buildSuccessContainer,
  buildErrorContainer
} = require('../components/componentsV2');
const { createLikedPagination } = require('../components/likedPagination');
const { createSettingsMenu } = require('../components/settingsMenu');
const db = require('../database/db');
const config = require('../config');
const logger = require('../utils/logger');
const { MessageFlags, ContainerBuilder, TextDisplayBuilder } = require('discord.js');

/**
 * Handle all interactive components for DisTube with Discord Components V2
 * @param {import('../client')} client
 * @param {import('discord.js').Interaction} interaction
 */
async function handleComponentInteraction(client, interaction) {
  if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

  const { customId, guild, user, member } = interaction;
  const queue = client.distube.getQueue(guild?.id);

  try {
    // -------------------------------------------------------------
    // Universal Dismiss Button
    // -------------------------------------------------------------
    if (customId === 'component_dismiss') {
      if (interaction.message && interaction.message.deletable) {
        return interaction.message.delete().catch(() => {});
      }
      const dismissed = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('✖️ Message dismissed.'));
      return interaction.update({ components: [dismissed], flags: [MessageFlags.IsComponentsV2] });
    }

    // -------------------------------------------------------------
    // Interactive Help Tabs ([Music] [Queue] [Controls] [Utility])
    // -------------------------------------------------------------
    if (customId.startsWith('help_tab_')) {
      const category = customId.replace('help_tab_', '');
      const payload = buildHelpComponentsV2(category);
      return interaction.update(payload);
    }

    // -------------------------------------------------------------
    // 1. Music Control Panel Buttons
    // -------------------------------------------------------------
    if (customId === 'music_pause_resume') {
      if (!queue || !queue.songs[0]) {
        return interaction.reply({
          ...buildErrorContainer('Nothing Playing', 'There is no track currently playing.'),
          flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
        });
      }
      if (!member?.voice?.channel || member.voice.channel.id !== queue.voiceChannel?.id) {
        return interaction.reply({
          ...buildErrorContainer('Voice Channel Mismatch', 'You must be in the same voice channel as the bot.'),
          flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
        });
      }

      if (queue.paused) {
        queue.resume();
      } else {
        queue.pause();
      }

      const payload = buildNowPlayingComponentsV2(queue, queue.songs[0], user.id);
      return interaction.update(payload);
    }

    if (customId === 'music_skip') {
      if (!queue || !queue.songs[0]) {
        return interaction.reply({
          ...buildErrorContainer('Nothing Playing', 'There is no track currently playing.'),
          flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
        });
      }
      if (!member?.voice?.channel || member.voice.channel.id !== queue.voiceChannel?.id) {
        return interaction.reply({
          ...buildErrorContainer('Voice Channel Mismatch', 'You must be in the same voice channel.'),
          flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
        });
      }

      const skipped = queue.songs[0];
      if (queue.songs.length <= 1) {
        queue.stop();
      } else {
        queue.skip();
      }

      return interaction.reply(buildSuccessContainer('Track Skipped', `Skipped **[${skipped.name}](${skipped.url})** by <@${user.id}>.`));
    }

    if (customId === 'music_replay') {
      if (!queue || !queue.songs[0]) {
        return interaction.reply({
          ...buildErrorContainer('Nothing Playing', 'There is no track currently playing.'),
          flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
        });
      }
      if (!member?.voice?.channel || member.voice.channel.id !== queue.voiceChannel?.id) {
        return interaction.reply({
          ...buildErrorContainer('Voice Channel Mismatch', 'You must be in the same voice channel.'),
          flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
        });
      }

      queue.seek(0);
      const payload = buildNowPlayingComponentsV2(queue, queue.songs[0], user.id);
      return interaction.update(payload);
    }

    if (customId === 'music_stop') {
      if (!queue) {
        return interaction.reply({
          ...buildErrorContainer('No Active Session', 'There is no music session active.'),
          flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
        });
      }
      if (!member?.voice?.channel || member.voice.channel.id !== queue.voiceChannel?.id) {
        return interaction.reply({
          ...buildErrorContainer('Voice Channel Mismatch', 'You must be in the same voice channel.'),
          flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
        });
      }

      queue.stop();
      return interaction.reply(buildSuccessContainer('Playback Stopped', `Stopped music playback and cleared queue by <@${user.id}>.`));
    }

    if (customId === 'music_like') {
      if (!queue || !queue.songs[0]) {
        return interaction.reply({
          ...buildErrorContainer('Nothing Playing', 'There is no track currently playing to like.'),
          flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
        });
      }

      const current = queue.songs[0];
      const { liked, count } = db.toggleLike(user.id, {
        url: current.url,
        title: current.name,
        duration: current.duration || 0,
        durationFormatted: current.formattedDuration || '00:00',
        thumbnail: current.thumbnail,
        author: current.uploader?.name || 'Artist'
      });

      if (liked) {
        return interaction.reply({
          ...buildSuccessContainer('Added to Favorites', `Saved **[${current.name}](${current.url})** to your liked songs! (Total: ${count})`),
          flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
        });
      } else {
        return interaction.reply({
          ...buildSuccessContainer('Removed from Favorites', `Removed **[${current.name}](${current.url})** from your liked songs.`),
          flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
        });
      }
    }

    if (customId === 'music_loop') {
      if (!queue || !queue.songs[0]) {
        return interaction.reply({
          ...buildErrorContainer('Nothing Playing', 'There is no track currently playing.'),
          flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
        });
      }
      if (!member?.voice?.channel || member.voice.channel.id !== queue.voiceChannel?.id) {
        return interaction.reply({
          ...buildErrorContainer('Voice Channel Mismatch', 'You must be in the same voice channel.'),
          flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
        });
      }

      const nextLoop = (queue.repeatMode + 1) % 3; // 0 (off) -> 1 (song) -> 2 (queue) -> 0
      queue.setRepeatMode(nextLoop);

      const payload = buildNowPlayingComponentsV2(queue, queue.songs[0], user.id);
      return interaction.update(payload);
    }

    if (customId === 'music_volup' || customId === 'music_voldown') {
      if (!queue || !queue.songs[0]) {
        return interaction.reply({
          ...buildErrorContainer('Nothing Playing', 'There is no track currently playing.'),
          flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
        });
      }
      if (!member?.voice?.channel || member.voice.channel.id !== queue.voiceChannel?.id) {
        return interaction.reply({
          ...buildErrorContainer('Voice Channel Mismatch', 'You must be in the same voice channel.'),
          flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
        });
      }

      const delta = customId === 'music_volup' ? 10 : -10;
      const newVol = Math.max(1, Math.min(queue.volume + delta, config.audio.maxVolume));
      queue.setVolume(newVol);

      const payload = buildNowPlayingComponentsV2(queue, queue.songs[0], user.id);
      return interaction.update(payload);
    }

    if (customId === 'music_effects_panel' || customId === 'help_quick_effects') {
      if (!queue || !queue.songs[0]) {
        return interaction.reply({
          ...buildErrorContainer('Nothing Playing', 'Play a track first to customize audio effects.'),
          flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
        });
      }
      const payload = buildEffectsContainer(queue);
      return interaction.reply({ ...payload, flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2] });
    }

    if (customId === 'music_show_queue') {
      if (!queue || queue.songs.length === 0) {
        return interaction.reply({
          ...buildErrorContainer('Queue Empty', 'Queue is currently empty.'),
          flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
        });
      }
      const payload = buildQueueContainer(queue, guild, 1, 10);
      return interaction.reply({ ...payload, flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2] });
    }

    // -------------------------------------------------------------
    // 2. Audio Effects Controls
    // -------------------------------------------------------------
    if (customId === 'select_effect' || customId.startsWith('effect_')) {
      if (!queue || !queue.songs[0]) {
        return interaction.reply({
          ...buildErrorContainer('Nothing Playing', 'Nothing is playing.'),
          flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
        });
      }

      const effectName = customId === 'select_effect' ? interaction.values[0] : customId.replace('effect_', '');

      if (effectName === 'clear_all') {
        queue.filters.clear();
      } else if (queue.filters.has(effectName)) {
        queue.filters.remove(effectName);
      } else {
        queue.filters.add(effectName);
      }

      const payload = buildEffectsContainer(queue);
      return interaction.update(payload);
    }

    // -------------------------------------------------------------
    // 3. Queue Pagination
    // -------------------------------------------------------------
    if (customId.startsWith('queue_page_')) {
      if (!queue) {
        return interaction.reply({
          ...buildErrorContainer('Queue Ended', 'Queue has ended.'),
          flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
        });
      }
      const parts = customId.split('_');
      let targetPage = 1;
      const totalPages = Math.max(1, Math.ceil((queue.songs.length - 1) / 10));

      if (parts[2] === 'first') targetPage = 1;
      else if (parts[2] === 'prev') targetPage = parseInt(parts[3], 10) || 1;
      else if (parts[2] === 'next') targetPage = parseInt(parts[3], 10) || 1;
      else if (parts[2] === 'last') targetPage = parseInt(parts[3], 10) || totalPages;

      const payload = buildQueueContainer(queue, guild, targetPage, 10);
      return interaction.update(payload);
    }

    if (customId === 'queue_shuffle') {
      if (!queue || queue.songs.length <= 2) {
        return interaction.reply({
          ...buildErrorContainer('Not Enough Tracks', 'Not enough tracks in queue to shuffle.'),
          flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
        });
      }
      queue.shuffle();
      const payload = buildQueueContainer(queue, guild, 1, 10);
      return interaction.update(payload);
    }

    if (customId === 'queue_clear') {
      if (!queue || queue.songs.length <= 1) {
        return interaction.reply({
          ...buildErrorContainer('Queue Empty', 'Queue is already empty.'),
          flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
        });
      }
      queue.songs.splice(1);
      const payload = buildQueueContainer(queue, guild, 1, 10);
      return interaction.update(payload);
    }

    // -------------------------------------------------------------
    // 4. Search Select Menu
    // -------------------------------------------------------------
    if (customId.startsWith('search_select_')) {
      const sessionId = customId.replace('search_select_', '');
      const session = client.searchSessions.get(sessionId);

      if (!session) {
        return interaction.reply({
          ...buildErrorContainer('Session Expired', 'This search session has expired. Please run `/search` again.'),
          flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
        });
      }
      if (session.user.id !== user.id) {
        return interaction.reply({
          ...buildErrorContainer('Access Denied', 'Only the user who initiated this search can select a song.'),
          flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
        });
      }

      const selectedIndex = parseInt(interaction.values[0], 10);
      const selectedTrack = session.tracks[selectedIndex];
      client.searchSessions.delete(sessionId);

      await interaction.deferUpdate();

      await client.distube.play(session.voiceChannel, selectedTrack.url, {
        member: member,
        textChannel: session.textChannel
      });

      const confirmed = new ContainerBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`✅ Enqueued **[${selectedTrack.title}](${selectedTrack.url})**!`)
        );

      return interaction.editReply({ components: [confirmed], flags: [MessageFlags.IsComponentsV2] });
    }

    if (customId.startsWith('search_cancel_')) {
      const sessionId = customId.replace('search_cancel_', '');
      client.searchSessions.delete(sessionId);
      const cancelled = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('✖️ Search cancelled.'));
      return interaction.update({ components: [cancelled], flags: [MessageFlags.IsComponentsV2] });
    }

    // -------------------------------------------------------------
    // 5. Liked Songs Pagination & Play All
    // -------------------------------------------------------------
    if (customId.startsWith('liked_')) {
      const parts = customId.split('_');
      const action = parts[1];
      const targetUserId = parts[2];

      if (action === 'play' && parts[2] === 'all') {
        const uid = parts[3];
        const likedTracks = db.getLikedSongs(uid);
        if (likedTracks.length === 0) {
          return interaction.reply({
            ...buildErrorContainer('No Liked Songs', 'No liked songs to play.'),
            flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
          });
        }
        if (!member?.voice?.channel) {
          return interaction.reply({
            ...buildErrorContainer('Voice Channel Required', 'Please join a voice channel first.'),
            flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
          });
        }

        for (const item of likedTracks) {
          await client.distube.play(member.voice.channel, item.url, {
            member: member,
            textChannel: interaction.channel
          });
        }

        return interaction.reply(buildSuccessContainer('Enqueued Favorites', `Enqueued **${likedTracks.length}** favorite track(s) for <@${user.id}>!`));
      }

      if (action === 'prev' || action === 'next') {
        const targetPage = parseInt(parts[3], 10) || 1;
        const likedTracks = db.getLikedSongs(targetUserId);
        const payload = createLikedPagination({ id: targetUserId, username: user.username }, likedTracks, targetPage, 10);
        return interaction.update(payload);
      }
    }

    // -------------------------------------------------------------
    // 6. Settings Panel
    // -------------------------------------------------------------
    if (customId === 'settings_default_volume') {
      const vol = parseInt(interaction.values[0], 10);
      db.setGuildSetting(guild.id, 'defaultVolume', vol);
      const payload = createSettingsMenu(guild);
      return interaction.update(payload);
    }

    if (customId === 'settings_toggle_247') {
      const cur = db.getGuildSettings(guild.id);
      db.setGuildSetting(guild.id, 'stayInVC24_7', !cur.stayInVC24_7);
      const payload = createSettingsMenu(guild);
      return interaction.update(payload);
    }

    if (customId === 'settings_toggle_announce') {
      const cur = db.getGuildSettings(guild.id);
      db.setGuildSetting(guild.id, 'announceNowPlaying', !cur.announceNowPlaying);
      const payload = createSettingsMenu(guild);
      return interaction.update(payload);
    }

    if (customId === 'settings_voteskip_threshold') {
      const cur = db.getGuildSettings(guild.id);
      const thresholds = [25, 50, 75, 100];
      const nextIdx = (thresholds.indexOf(cur.voteSkipPercent) + 1) % thresholds.length;
      db.setGuildSetting(guild.id, 'voteSkipPercent', thresholds[nextIdx]);
      const payload = createSettingsMenu(guild);
      return interaction.update(payload);
    }

    if (customId === 'help_quick_play') {
      if (!queue || !queue.songs[0]) {
        return interaction.reply({
          ...buildErrorContainer('No Active Session', 'No active music session. Use `/play <song>` to start!'),
          flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
        });
      }
      const payload = buildNowPlayingComponentsV2(queue, queue.songs[0], user.id);
      return interaction.reply({ ...payload, flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2] });
    }
  } catch (err) {
    logger.error('Component interaction error:', err);
    if (!interaction.replied && !interaction.deferred) {
      return interaction.reply({
        ...buildErrorContainer('Interaction Error', 'An error occurred processing this action.'),
        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
      });
    }
  }
}

module.exports = {
  handleComponentInteraction
};
