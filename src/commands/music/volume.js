const { SlashCommandBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
  name: 'volume',
  description: 'Adjust the music playback volume (1% - 200%)',
  category: 'music',
  aliases: ['vol'],
  slashData: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Adjust volume')
    .addIntegerOption((option) =>
      option
        .setName('percent')
        .setDescription('Volume level (1-200)')
        .setMinValue(1)
        .setMaxValue(200)
        .setRequired(false)
    ),

  /**
   * @param {import('../../utils/commandContext')} ctx
   */
  async execute(ctx) {
    const queue = ctx.client.distube.getQueue(ctx.guild.id);
    if (!queue) {
      return ctx.sendError('Nothing Playing', 'There is no music session active in this server.');
    }

    const vol = ctx.getInteger('percent', 0);
    if (vol === null) {
      return ctx.sendSuccess('🔊 Current Volume', `The current playback volume is **\`${queue.volume}%\`**.`);
    }

    if (!ctx.voiceChannel || ctx.voiceChannel.id !== queue.voiceChannel?.id) {
      return ctx.sendError('Voice Channel Mismatch', 'You must be in the same voice channel to change the volume.');
    }

    const newVol = Math.max(1, Math.min(vol, config.audio.maxVolume));
    queue.setVolume(newVol);

    const emoji = newVol >= 100 ? config.emojis.volumeUp : newVol > 0 ? config.emojis.volumeDown : config.emojis.volumeMute;
    return ctx.sendSuccess(`${emoji} Volume Adjusted`, `Set playback volume to **\`${newVol}%\`**.`);
  }
};
