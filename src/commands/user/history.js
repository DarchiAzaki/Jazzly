const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags
} = require('discord.js');
const db = require('../../database/db');
const config = require('../../config');

const BRAND_FOOTER = config.bot.footer;

module.exports = {
  name: 'history',
  description: "View your or the server's listening history",
  category: 'user',
  aliases: ['hist', 'recent'],
  slashData: new SlashCommandBuilder()
    .setName('history')
    .setDescription("View your or the server's listening history")
    .addStringOption((option) =>
      option
        .setName('scope')
        .setDescription('View history for server or yourself')
        .setRequired(false)
        .addChoices(
          { name: 'Server History', value: 'server' },
          { name: 'My History', value: 'user' }
        )
    ),

  /**
   * @param {import('../../utils/commandContext')} ctx
   */
  async execute(ctx) {
    const scope = ctx.getString('scope', 0, 'server');
    let historyTracks = [];
    let title = '';
    let subtitle = '';

    if (scope === 'user') {
      historyTracks = db.getUserHistory(ctx.user.id, 15);
      title = `${ctx.user.username}'s History`;
      subtitle = `Personal listening history for <@${ctx.user.id}>`;
    } else {
      historyTracks = db.getGuildHistory(ctx.guild.id, 15);
      title = `${ctx.guild.name}'s History`;
      subtitle = `Server listening history for **${ctx.guild.name}**`;
    }

    if (historyTracks.length === 0) {
      return ctx.sendError('No History', 'No songs have been played yet in this session.');
    }

    const description = historyTracks
      .map((t, i) => {
        const timeAgo = Math.floor((Date.now() - new Date(t.playedAt).getTime()) / 60000);
        const timeStr = timeAgo < 1 ? 'Just now' : `${timeAgo}m ago`;
        return `\`${i + 1}.\` **[${t.title}](${t.url})**\n⏱️ \`${t.durationFormatted || '00:00'}\` • 👤 \`${t.author || 'Artist'}\` • 🕒 *${timeStr}*`;
      })
      .join('\n\n');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('component_dismiss')
        .setLabel('✕ Dismiss')
        .setStyle(ButtonStyle.Secondary)
    );

    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `-# **L I S T E N I N G   H I S T O R Y**\n` +
          `## **${title}**\n` +
          `${subtitle}\n` +
          `\`Last 15 Sessions\`    \`MongoDB Archive\`    \`Auto-Logged\``
        )
      )
      .addSeparatorComponents(new SeparatorBuilder().setSpacing(1))
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Recent Audio Sessions**\n` +
          `${description}\n\n` +
          `-# Showing the last **${historyTracks.length}** played tracks\n` +
          `${BRAND_FOOTER}`
        )
      )
      .addSeparatorComponents(new SeparatorBuilder().setSpacing(1))
      .addActionRowComponents(row);

    return ctx.reply({ flags: [MessageFlags.IsComponentsV2], components: [container] });
  }
};
