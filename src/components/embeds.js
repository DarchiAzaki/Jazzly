const { EmbedBuilder } = require('discord.js');
const config = require('../config');
const { formatDuration, createProgressBar } = require('../utils/timeFormat');

/**
 * Base embed creator with Jazzly branding
 */
function createBaseEmbed(title = '', description = '', color = config.bot.color) {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTimestamp();

  if (title) embed.setTitle(title);
  if (description) embed.setDescription(description);

  return embed;
}

/**
 * Embed for currently playing track
 * @param {import('distube').Queue} queue
 * @param {import('distube').Song} song
 */
function createNowPlayingEmbed(queue, song) {
  if (!song) {
    return createBaseEmbed('🎵 Now Playing', 'Nothing is currently playing.', config.bot.color);
  }

  const currentSec = Math.floor(queue?.currentTime || 0);
  const totalSec = song.duration || 0;
  const progressBar = createProgressBar(currentSec, totalSec, 16);

  const loopBadge = queue?.repeatMode === 1 ? '🔂 Song' : queue?.repeatMode === 2 ? '🔁 Queue' : 'Off';
  const activeFilters = queue?.filters?.names || [];
  const filtersBadge = activeFilters.length > 0
    ? activeFilters.map((f) => `\`${f}\``).join(', ')
    : 'None';

  const requesterId = song.user?.id || song.member?.id || '0';
  const requesterAvatar = typeof song.user?.displayAvatarURL === 'function'
    ? song.user.displayAvatarURL()
    : undefined;

  return new EmbedBuilder()
    .setColor(config.bot.color)
    .setAuthor({
      name: 'Now Playing 🎵',
      iconURL: config.bot.icon || 'https://cdn.discordapp.com/emojis/1100000000000000000.png'
    })
    .setTitle((song.name || song.title || 'Unknown Title').length > 250 ? (song.name || song.title).substring(0, 247) + '...' : (song.name || song.title))
    .setURL(song.url)
    .setThumbnail(song.thumbnail)
    .setDescription(
      `**Channel / Artist:** \`${song.uploader?.name || song.author || 'Artist'}\`\n` +
      `**Duration:** \`${formatDuration(currentSec)} / ${song.formattedDuration || formatDuration(totalSec)}\`\n\n` +
      `${progressBar}\n\n` +
      `**Requested by:** <@${requesterId}>\n` +
      `**Volume:** \`${queue?.volume || 80}%\` • **Loop:** \`${loopBadge}\` • **Filters:** ${filtersBadge}`
    )
    .setFooter({
      text: `${config.bot.name} • DisTube High Fidelity`,
      iconURL: requesterAvatar
    })
    .setTimestamp();
}

/**
 * Embed for track added to queue
 * @param {import('distube').Song} song
 * @param {number|null} position
 */
function createTrackAddedEmbed(song, position = null) {
  const positionText = position === 1
    ? '🔥 Playing Next (Top of Queue)'
    : position !== null
      ? `Position in queue: **#${position}**`
      : 'Added to Queue';

  const requesterId = song.user?.id || song.member?.id || '0';

  return new EmbedBuilder()
    .setColor(config.bot.colorSuccess)
    .setAuthor({ name: 'Added to Queue ✅' })
    .setTitle((song.name || song.title || 'Unknown Title').length > 250 ? (song.name || song.title).substring(0, 247) + '...' : (song.name || song.title))
    .setURL(song.url)
    .setThumbnail(song.thumbnail)
    .setDescription(
      `**Author:** \`${song.uploader?.name || song.author || 'Artist'}\`\n` +
      `**Duration:** \`${song.formattedDuration || formatDuration(song.duration || 0)}\`\n` +
      `**Requested by:** <@${requesterId}>\n\n` +
      `${positionText}`
    )
    .setFooter({ text: config.bot.name })
    .setTimestamp();
}

/**
 * Embed for playlist added
 */
function createPlaylistAddedEmbed(playlistName, count, durationSec, requester) {
  return new EmbedBuilder()
    .setColor(config.bot.colorSuccess)
    .setAuthor({ name: 'Playlist Enqueued 📜' })
    .setTitle(playlistName || 'Playlist')
    .setDescription(
      `Added **${count}** tracks (\`${formatDuration(durationSec)}\`) to the queue.\n` +
      `Requested by: <@${requester?.id || requester}>`
    )
    .setFooter({ text: config.bot.name })
    .setTimestamp();
}

/**
 * Embed for Queue listing
 * @param {import('distube').Queue} queue
 * @param {import('discord.js').Guild} guild
 * @param {number} page
 * @param {number} pageSize
 */
function createQueueEmbed(queue, guild, page = 1, pageSize = 10) {
  const upcomingSongs = queue.songs.slice(1);
  const totalTracks = upcomingSongs.length;
  const totalPages = Math.max(1, Math.ceil(totalTracks / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const pageTracks = upcomingSongs.slice(startIndex, startIndex + pageSize);

  let currentPlayingText = 'None';
  const current = queue.songs[0];
  if (current) {
    const cur = Math.floor(queue.currentTime || 0);
    const reqId = current.user?.id || current.member?.id || '0';
    currentPlayingText = `[${current.name}](${current.url}) \`[${formatDuration(cur)}/${current.formattedDuration}]\` - <@${reqId}>`;
  }

  let queueListText = '';
  if (pageTracks.length === 0) {
    queueListText = '*No upcoming tracks in queue.*';
  } else {
    queueListText = pageTracks
      .map((t, i) => {
        const reqId = t.user?.id || t.member?.id || '0';
        return `\`${startIndex + i + 1}.\` [${t.name}](${t.url}) \`[${t.formattedDuration}]\` - <@${reqId}>`;
      })
      .join('\n');
  }

  const loopLabel = queue.repeatMode === 1 ? '🔂 Song' : queue.repeatMode === 2 ? '🔁 Queue' : 'Off';

  return new EmbedBuilder()
    .setColor(config.bot.color)
    .setTitle(`🎶 Music Queue for ${guild.name}`)
    .setDescription(
      `__**Now Playing:**__\n${currentPlayingText}\n\n` +
      `__**Upcoming Tracks (${totalTracks}):**__\n${queueListText}`
    )
    .addFields([
      {
        name: 'Queue Stats',
        value: `**Total Duration:** \`${queue.formattedDuration}\`\n**Loop Mode:** \`${loopLabel}\`\n**Volume:** \`${queue.volume}%\``,
        inline: true
      },
      {
        name: 'Page',
        value: `**${currentPage}** of **${totalPages}**`,
        inline: true
      }
    ])
    .setFooter({ text: `${config.bot.name} • Use buttons below to paginate` })
    .setTimestamp();
}

module.exports = {
  createBaseEmbed,
  createNowPlayingEmbed,
  createTrackAddedEmbed,
  createPlaylistAddedEmbed,
  createQueueEmbed
};
