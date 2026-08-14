const { SlashCommandBuilder } = require('discord.js');
const { parseTimeString, formatDuration } = require('../../utils/timeFormat');

module.exports = {
  name: 'seek',
  description: 'Seek to a position in the current track (e.g. 1:30, 90s)',
  category: 'music',
  aliases: [],
  slashData: new SlashCommandBuilder()
    .setName('seek')
    .setDescription('Seek to a position in the current track')
    .addStringOption((option) =>
      option
        .setName('position')
        .setDescription('Timestamp to seek to (e.g. 1:30, 2m, 90s)')
        .setRequired(true)
    ),

  /**
   * @param {import('../../utils/commandContext')} ctx
   */
  async execute(ctx) {
    const queue = ctx.client.distube.getQueue(ctx.guild.id);
    if (!queue || !queue.songs[0]) {
      return ctx.sendError('Nothing Playing', 'There is no track currently playing.');
    }

    if (!ctx.voiceChannel || ctx.voiceChannel.id !== queue.voiceChannel?.id) {
      return ctx.sendError('Voice Channel Mismatch', 'You must be in the same voice channel to seek.');
    }

    const posInput = ctx.getString('position', 0);
    if (!posInput) {
      return ctx.sendError('Invalid Timestamp', 'Please specify a timestamp (e.g. `1:30`, `90s`, `2m`).');
    }

    const seconds = parseTimeString(posInput);
    if (seconds === null || seconds < 0) {
      return ctx.sendError('Invalid Format', 'Please enter a valid time format like `1:30`, `45s`, or `2m15s`.');
    }

    const trackDurationSec = queue.songs[0].duration || 0;
    if (trackDurationSec > 0 && seconds >= trackDurationSec) {
      return ctx.sendError('Timestamp Out of Bounds', `The track duration is \`${formatDuration(trackDurationSec)}\`. You cannot seek past the end.`);
    }

    queue.seek(seconds);
    return ctx.sendSuccess('⏩ Seek Successful', `Seeked position to **\`${formatDuration(seconds)}\`**.`);
  }
};
