const {
  ContainerBuilder,
  TextDisplayBuilder,
  SectionBuilder,
  ThumbnailBuilder,
  SeparatorBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags
} = require('discord.js');
const db = require('../database/db');
const config = require('../config');

const BRAND_FOOTER = config.bot.footer;

/**
 * Creates an ultra-clean, Spotify-grade Settings Components V2 container
 * @param {import('discord.js').Guild} guild
 */
function createSettingsMenu(guild) {
  const settings = db.getGuildSettings(guild.id);

  const container = new ContainerBuilder();
  const textContent =
    `-# **S E R V E R   P R E F E R E N C E S**\n` +
    `## **${guild.name}**\n` +
    `Audio pipeline, default master volume, and playback automation.\n` +
    `\`Prefix: ${settings.prefix}\`    \`Master Vol: ${settings.defaultVolume}%\`    \`Vote Skip: ${settings.voteSkipPercent}%\``;

  const iconUrl = typeof guild.iconURL === 'function' ? guild.iconURL() : null;
  if (iconUrl && iconUrl.startsWith('http')) {
    const section = new SectionBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(textContent))
      .setThumbnailAccessory(new ThumbnailBuilder().setURL(iconUrl));
    container.addSectionComponents(section);
  } else {
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(textContent));
  }

  // Row 1: Volume Select Menu
  const volSelect = new StringSelectMenuBuilder()
    .setCustomId('settings_default_volume')
    .setPlaceholder(`🔊 Default Master Volume (${settings.defaultVolume}%)`)
    .addOptions([
      new StringSelectMenuOptionBuilder().setLabel('25% Volume').setDescription('Quiet background audio').setValue('25').setEmoji('🔈'),
      new StringSelectMenuOptionBuilder().setLabel('50% Volume').setDescription('Moderate volume').setValue('50').setEmoji('🔉'),
      new StringSelectMenuOptionBuilder().setLabel('75% Volume').setDescription('Comfortable listening').setValue('75').setEmoji('🔉'),
      new StringSelectMenuOptionBuilder().setLabel('80% Volume (Default)').setDescription('Standard recommended volume').setValue('80').setEmoji('🔊'),
      new StringSelectMenuOptionBuilder().setLabel('100% Volume').setDescription('Full dynamic range').setValue('100').setEmoji('🔊'),
      new StringSelectMenuOptionBuilder().setLabel('125% Volume').setDescription('Boosted level').setValue('125').setEmoji('📢'),
      new StringSelectMenuOptionBuilder().setLabel('150% Volume').setDescription('Maximum output level').setValue('150').setEmoji('📢')
    ]);

  const selectRow = new ActionRowBuilder().addComponents(volSelect);

  // Row 2: Toggles
  const buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('settings_toggle_247')
      .setLabel('24/7 Mode')
      .setEmoji('📻')
      .setStyle(settings.stayInVC24_7 ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('settings_toggle_announce')
      .setLabel('Announcements')
      .setEmoji('📢')
      .setStyle(settings.announceNowPlaying ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('settings_voteskip_threshold')
      .setLabel(`Vote Skip: ${settings.voteSkipPercent}%`)
      .setEmoji('🗳️')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('component_dismiss')
      .setLabel('✕')
      .setStyle(ButtonStyle.Secondary)
  );

  const status247 = settings.stayInVC24_7 ? '`ENABLED`' : '`DISABLED`';
  const statusAnnounce = settings.announceNowPlaying ? '`ENABLED`' : '`DISABLED`';

  container
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(1))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**24/7 Voice Channel Connection** — ${status247}\n` +
        `-# Keeps the bot connected in voice channel even when playback finishes.\n\n` +
        `**Now Playing Card Announcements** — ${statusAnnounce}\n` +
        `-# Automatically posts rich Now Playing cards when each new track starts.\n\n` +
        `${BRAND_FOOTER}`
      )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(1))
    .addActionRowComponents(selectRow, buttonRow);

  return {
    flags: [MessageFlags.IsComponentsV2],
    components: [container]
  };
}

module.exports = {
  createSettingsMenu
};
