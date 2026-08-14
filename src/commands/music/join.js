const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'join',
  description: 'Joins the voice channel you are in',
  category: 'music',
  aliases: ['summon', 'start'],
  slashData: new SlashCommandBuilder()
    .setName('join')
    .setDescription('Joins the voice channel you are in'),

  /**
   * @param {import('../../utils/commandContext')} ctx
   */
  async execute(ctx) {
    if (!ctx.voiceChannel) {
      return ctx.sendError('Voice Channel Required', 'You need to be in a voice channel to summon the bot!');
    }

    const permissions = ctx.voiceChannel.permissionsFor(ctx.client.user);
    if (permissions && !permissions.has(['Connect', 'Speak'])) {
      return ctx.sendError('Missing Permissions', 'I do not have permission to join your voice channel!');
    }

    await ctx.client.distube.voices.join(ctx.voiceChannel);
    return ctx.sendSuccess('🔊 Voice Channel Joined', `Connected to <#${ctx.voiceChannel.id}>. Ready to play your favorite tracks!`);
  }
};
