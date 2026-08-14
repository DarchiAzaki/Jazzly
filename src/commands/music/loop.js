const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'loop',
  description: 'Toggles repeat mode for the current song or sets mode (off/track/queue)',
  category: 'music',
  aliases: ['repeat'],
  slashData: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Loop the current song')
    .addStringOption((option) =>
      option
        .setName('mode')
        .setDescription('Loop mode')
        .setRequired(false)
        .addChoices(
          { name: '🔂 Song (Repeat Current)', value: '1' },
          { name: '🔁 Queue (Repeat All)', value: '2' },
          { name: '❌ Off (No Loop)', value: '0' }
        )
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

    let modeChoice = ctx.getString('mode', 0);
    let nextMode;

    if (modeChoice !== null && ['0', '1', '2'].includes(modeChoice)) {
      nextMode = parseInt(modeChoice, 10);
    } else {
      nextMode = (queue.repeatMode + 1) % 3;
    }

    queue.setRepeatMode(nextMode);

    const modeLabels = {
      0: '❌ Disabled',
      1: '🔂 Current Song Repeating',
      2: '🔁 Entire Queue Repeating'
    };

    return ctx.sendSuccess('🔁 Loop Mode Changed', `Loop mode is now set to **${modeLabels[nextMode]}**.`);
  }
};
