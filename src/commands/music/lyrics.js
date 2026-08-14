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
const { fetchLyrics } = require('../../utils/lyricsFetcher');
const config = require('../../config');

const BRAND_FOOTER = config.bot.footer;

module.exports = {
  name: 'lyrics',
  description: 'Show lyrics for the currently playing track or a search query',
  category: 'music',
  aliases: ['ly'],
  slashData: new SlashCommandBuilder()
    .setName('lyrics')
    .setDescription('Show lyrics for the currently playing track')
    .addStringOption((option) =>
      option
        .setName('song')
        .setDescription('Song title (optional: defaults to currently playing song)')
        .setRequired(false)
    ),

  /**
   * @param {import('../../utils/commandContext')} ctx
   */
  async execute(ctx) {
    let songQuery = ctx.getString('song', 0);
    let artist = '';

    if (!songQuery) {
      const queue = ctx.client.distube.getQueue(ctx.guild.id);
      if (!queue || !queue.songs[0]) {
        return ctx.sendError('No Track Found', 'Nothing is currently playing. Please specify a song name with `/lyrics <song>`.');
      }
      songQuery = queue.songs[0].name;
      artist = queue.songs[0].uploader?.name || '';
    }

    await ctx.defer();

    const data = await fetchLyrics(songQuery, artist);
    if (!data || !data.lyrics) {
      return ctx.sendError('No Lyrics Found', `Could not find lyrics for \`${songQuery}\`.`);
    }

    const lyricsText = data.lyrics.length > 3500
      ? data.lyrics.substring(0, 3450) + '\n\n*...[Lyrics truncated due to length]*'
      : data.lyrics;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('component_dismiss')
        .setLabel('✕ Dismiss')
        .setStyle(ButtonStyle.Secondary)
    );

    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `-# **S P O T I F Y   L Y R I C S**\n` +
          `## **${data.title}**\n` +
          `Artist: **${data.artist}**\n` +
          `\`Genius Engine\`    \`Synced Text\`    \`Source: ${data.source}\``
        )
      )
      .addSeparatorComponents(new SeparatorBuilder().setSpacing(1))
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`${lyricsText}\n\n${BRAND_FOOTER}`)
      )
      .addSeparatorComponents(new SeparatorBuilder().setSpacing(1))
      .addActionRowComponents(row);

    return ctx.reply({ flags: [MessageFlags.IsComponentsV2], components: [container] });
  }
};
