const { SlashCommandBuilder } = require('discord.js');
const { parseTimeString, formatDuration } = require('../../utils/timeFormat');

module.exports = {
  name: 'rewind',
  description: 'Rewinds by a certain amount of time in the current track (e.g. 15s, 1m)',
  category: 'music',
  aliases: ['rwd'],
  slashData: new SlashCommandBuilder()
    .setName('rewind')
    .setDescription('Rewinds by a certain amount of time in the current track')
    .addStringOption((option) =>
      option
        .setName('amount')
        .setDescription('Amount of time to rewind (e.g. 15s, 30, 1m) [Default: 10s]')
        .setRequired(false)
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
      return ctx.sendError('Voice Channel Mismatch', 'You must be in the same voice channel.');
    }

    const input = ctx.getString('amount', 0, '10s');
    const seconds = parseTimeString(input) || 10;

    const currentSec = Math.floor(queue.currentTime || 0);
    const targetSec = Math.max(0, currentSec - seconds);

    queue.seek(targetSec);
    return ctx.sendSuccess('⏪ Rewound', `Rewound by **${seconds}s** to **\`${formatDuration(targetSec)}\`**.`);
  }
};
