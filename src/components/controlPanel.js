const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config');

/**
 * Creates 2 ActionRows with music controller buttons for DisTube
 * @param {import('distube').Queue} queue
 * @returns {ActionRowBuilder[]}
 */
function createControlPanelRow(queue) {
  const isPaused = queue ? queue.paused : false;
  const loopStyle = queue && queue.repeatMode !== 0 ? ButtonStyle.Success : ButtonStyle.Secondary;
  const loopLabel = queue && queue.repeatMode === 1 ? 'Loop: SONG' : queue && queue.repeatMode === 2 ? 'Loop: QUEUE' : 'Loop: OFF';

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('music_replay')
      .setLabel('Replay')
      .setEmoji(config.emojis.replay)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('music_pause_resume')
      .setLabel(isPaused ? 'Resume' : 'Pause')
      .setEmoji(isPaused ? config.emojis.play : config.emojis.pause)
      .setStyle(isPaused ? ButtonStyle.Success : ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('music_skip')
      .setLabel('Skip')
      .setEmoji(config.emojis.skip)
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('music_stop')
      .setLabel('Stop')
      .setEmoji(config.emojis.stop)
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId('music_like')
      .setLabel('Like')
      .setEmoji(config.emojis.heart)
      .setStyle(ButtonStyle.Secondary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('music_loop')
      .setLabel(loopLabel)
      .setEmoji(config.emojis.loopQueue)
      .setStyle(loopStyle),
    new ButtonBuilder()
      .setCustomId('music_voldown')
      .setLabel('-10%')
      .setEmoji(config.emojis.volumeDown)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('music_volup')
      .setLabel('+10%')
      .setEmoji(config.emojis.volumeUp)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('music_effects_panel')
      .setLabel('Effects')
      .setEmoji(config.emojis.effects)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('music_show_queue')
      .setLabel('Queue')
      .setEmoji(config.emojis.queue)
      .setStyle(ButtonStyle.Secondary)
  );

  return [row1, row2];
}

module.exports = {
  createControlPanelRow
};
