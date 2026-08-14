const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  version: djsVersion
} = require('discord.js');
const os = require('os');
const config = require('../../config');
const { formatDuration } = require('../../utils/timeFormat');

const BRAND_FOOTER = config.bot.footer;

module.exports = {
  name: 'info',
  description: 'Learn about Jazzly and view bot performance stats',
  category: 'general',
  aliases: [],
  slashData: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Learn about Jazzly'),

  /**
   * @param {import('../../utils/commandContext')} ctx
   */
  async execute(ctx) {
    const uptimeSec = process.uptime();
    const memoryUsageMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
    const totalMemoryMB = (os.totalmem() / 1024 / 1024).toFixed(0);

    const totalGuilds = ctx.client.guilds.cache.size;
    const totalUsers = ctx.client.guilds.cache.reduce((acc, g) => acc + (g.memberCount || 0), 0);
    const activeStreams = ctx.client.distube.queues?.collection?.size || 0;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('component_dismiss')
        .setLabel('✕ Dismiss')
        .setStyle(ButtonStyle.Secondary)
    );

    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `-# **A B O U T   J A Z Z L Y**\n` +
          `## **Jazzly Audio System**\n` +
          `High-fidelity, ultra-low latency music streaming crafted for Discord communities.\n` +
          `\`Servers: ${totalGuilds}\`    \`Users: ${totalUsers.toLocaleString()}\`    \`Active Streams: ${activeStreams}\``
        )
      )
      .addSeparatorComponents(new SeparatorBuilder().setSpacing(1))
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Performance & Architecture**\n` +
          `Uptime: \`${formatDuration(uptimeSec)}\`  •  Memory: \`${memoryUsageMB} MB / ${totalMemoryMB} MB\`\n` +
          `Audio Engine: \`DisTube Standalone\`  •  DSP: \`32-Bit Float Equalizer\`\n` +
          `-# Built on Node.js ${process.version} and Discord.js v${djsVersion}\n\n` +
          `${BRAND_FOOTER}`
        )
      )
      .addSeparatorComponents(new SeparatorBuilder().setSpacing(1))
      .addActionRowComponents(row);

    return ctx.reply({ flags: [MessageFlags.IsComponentsV2], components: [container] });
  }
};
