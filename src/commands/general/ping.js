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
const config = require('../../config');

const BRAND_FOOTER = config.bot.footer;

module.exports = {
  name: 'ping',
  description: "Checks the bot's response time to Discord and audio latency",
  category: 'general',
  aliases: [],
  slashData: new SlashCommandBuilder()
    .setName('ping')
    .setDescription("Checks the bot's response time to Discord"),

  /**
   * @param {import('../../utils/commandContext')} ctx
   */
  async execute(ctx) {
    const wsPing = Math.max(0, Math.round(ctx.client.ws.ping));
    const start = Date.now();
    const activeQueues = ctx.client.distube.queues?.collection?.size || 0;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('component_dismiss')
        .setLabel('✕ Dismiss')
        .setStyle(ButtonStyle.Secondary)
    );

    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `-# **S Y S T E M   L A T E N C Y**\n` +
          `## **🏓 Pong! • Performance Telemetry**\n` +
          `Gateway: **${wsPing}ms** • Voice Streams: **${activeQueues}**\n` +
          `\`WebSocket: ${wsPing}ms\`    \`Engine: DisTube v5\`    \`Status: Optimal\``
        )
      )
      .addSeparatorComponents(new SeparatorBuilder().setSpacing(1))
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(BRAND_FOOTER)
      )
      .addActionRowComponents(row);

    const replyMsg = await ctx.reply({ flags: [MessageFlags.IsComponentsV2], components: [container] });
    const roundtrip = Math.max(1, Date.now() - start);

    const updatedContainer = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `-# **S Y S T E M   L A T E N C Y**\n` +
          `## **🏓 Pong! • Performance Telemetry**\n` +
          `Gateway: **${wsPing}ms** • Round-Trip: **${roundtrip}ms** • Voice Streams: **${activeQueues}**\n` +
          `\`Gateway: ${wsPing}ms\`    \`Round-Trip: ${roundtrip}ms\`    \`Engine: DisTube v5\`    \`Status: Operational\``
        )
      )
      .addSeparatorComponents(new SeparatorBuilder().setSpacing(1))
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(BRAND_FOOTER)
      )
      .addActionRowComponents(row);

    if (ctx.isInteraction) {
      await ctx.interaction.editReply({ flags: [MessageFlags.IsComponentsV2], components: [updatedContainer] });
    } else if (replyMsg && typeof replyMsg.edit === 'function') {
      await replyMsg.edit({ flags: [MessageFlags.IsComponentsV2], components: [updatedContainer] });
    }
  }
};
