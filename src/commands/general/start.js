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
const db = require('../../database/db');

const BRAND_FOOTER = config.bot.footer;

module.exports = {
  name: 'start',
  description: 'Get started with Jazzly',
  category: 'general',
  aliases: [],
  slashData: new SlashCommandBuilder()
    .setName('start')
    .setDescription('Get started with Jazzly'),

  /**
   * @param {import('../../utils/commandContext')} ctx
   */
  async execute(ctx) {
    const prefix = db.getGuildSettings(ctx.guild.id).prefix || config.discord.defaultPrefix;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('help_quick_play')
        .setLabel('Controls')
        .setEmoji('🎛️')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('music_effects_panel')
        .setLabel('Audio DSP')
        .setEmoji('✨')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('component_dismiss')
        .setLabel('✕')
        .setStyle(ButtonStyle.Secondary)
    );

    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `-# **G E T T I N G   S T A R T E D**\n` +
          `## **Welcome to ${config.bot.name}**\n` +
          `High-fidelity audio streaming with Spotify-grade interface.\n` +
          `\`Prefix: ${prefix}\`    \`Slash: Enabled\`    \`Status: Online\``
        )
      )
      .addSeparatorComponents(new SeparatorBuilder().setSpacing(1))
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Playback**\n` +
          `Join a voice channel and type \`/play <song>\` or \`${prefix}p <query>\` to stream from YouTube, Spotify, or SoundCloud.\n\n` +
          `**DSP Equalizer & Effects**\n` +
          `Enable Bass Boost, Nightcore, 8D Audio, or Vaporwave using \`/effects\`.\n\n` +
          `**Personal Favorites Library**\n` +
          `Click ❤️ on any active song to save it to your library and play all anytime with \`/liked\`.\n\n` +
          `${BRAND_FOOTER}`
        )
      )
      .addSeparatorComponents(new SeparatorBuilder().setSpacing(1))
      .addActionRowComponents(row);

    return ctx.reply({ flags: [MessageFlags.IsComponentsV2], components: [container] });
  }
};
