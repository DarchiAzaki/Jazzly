const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createSettingsMenu } = require('../../components/settingsMenu');
const db = require('../../database/db');

module.exports = {
  name: 'settings',
  description: "Configure Jazzly settings for this server",
  category: 'settings',
  aliases: ['setting'],
  slashData: new SlashCommandBuilder()
    .setName('settings')
    .setDescription("Change bot settings")
    .addStringOption((opt) =>
      opt
        .setName('prefix')
        .setDescription('Set custom text prefix for this server')
        .setRequired(false)
    )
    .addIntegerOption((opt) =>
      opt
        .setName('volume')
        .setDescription('Default volume level (1-200)')
        .setMinValue(1)
        .setMaxValue(200)
        .setRequired(false)
    )
    .addIntegerOption((opt) =>
      opt
        .setName('voteskip')
        .setDescription('Vote skip percentage (1-100)')
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(false)
    )
    .addBooleanOption((opt) =>
      opt
        .setName('247')
        .setDescription('Keep bot in voice channel 24/7')
        .setRequired(false)
    )
    .addBooleanOption((opt) =>
      opt
        .setName('announce')
        .setDescription('Announce now playing songs in text channel')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  /**
   * @param {import('../../utils/commandContext')} ctx
   */
  async execute(ctx) {
    const hasAdmin = ctx.member?.permissions.has(PermissionFlagsBits.ManageGuild);
    if (!hasAdmin) {
      return ctx.sendError('Permission Denied', 'You need the `Manage Server` permission to configure bot settings.');
    }

    const prefix = ctx.getString('prefix');
    const volume = ctx.getInteger('volume');
    const voteskip = ctx.getInteger('voteskip');
    const stayInVC = ctx.getBoolean ? ctx.getBoolean('247') : null;
    const announce = ctx.getBoolean ? ctx.getBoolean('announce') : null;

    if (prefix) {
      db.setGuildSetting(ctx.guild.id, 'prefix', prefix);
    }
    if (volume !== null) {
      db.setGuildSetting(ctx.guild.id, 'defaultVolume', volume);
    }
    if (voteskip !== null) {
      db.setGuildSetting(ctx.guild.id, 'voteSkipPercent', voteskip);
    }
    if (stayInVC !== null) {
      db.setGuildSetting(ctx.guild.id, 'stayInVC24_7', stayInVC);
    }
    if (announce !== null) {
      db.setGuildSetting(ctx.guild.id, 'announceNowPlaying', announce);
    }

    const payload = createSettingsMenu(ctx.guild);
    return ctx.reply(payload);
  }
};
