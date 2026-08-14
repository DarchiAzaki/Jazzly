const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('./logger');

/**
 * Fetch lyrics for a song query
 * Tries multiple sources: LRCLIB (free open lyrics API with synced & plain text) -> Genius scrape fallback
 * @param {string} title - Song title or search query
 * @param {string} [artist] - Artist name if known
 * @returns {Promise<{title: string, artist: string, lyrics: string, source: string}|null>}
 */
async function fetchLyrics(title, artist = '') {
  if (!title) return null;

  // Clean title from (Official Video), [MV], (Lyrics), etc.
  const cleanTitle = title
    .replace(/\[.*?\]|\(.*?\)/g, '')
    .replace(/official video|music video|official audio|lyric video|lyrics|audio/gi, '')
    .replace(/feat\..*|ft\..*/gi, '')
    .replace(/[|/\\_]/g, ' ')
    .trim();

  // 1. Try LRCLIB (Lrclib.net) - High quality, fast, no API key required
  try {
    const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(`${artist ? artist + ' ' : ''}${cleanTitle}`)}`;
    const response = await axios.get(searchUrl, {
      timeout: 5000,
      headers: { 'User-Agent': 'JazzlyMusic/1.0 (https://github.com/Jazzly-Music)' }
    });

    if (response.data && response.data.length > 0) {
      const topMatch = response.data[0];
      const lyrics = topMatch.plainLyrics || topMatch.syncedLyrics;
      if (lyrics) {
        return {
          title: topMatch.trackName || cleanTitle,
          artist: topMatch.artistName || artist || 'Unknown Artist',
          lyrics: lyrics.trim(),
          source: 'LRCLIB'
        };
      }
    }
  } catch (err) {
    logger.debug('LRCLIB search error:', err.message);
  }

  // 2. Fallback: Try Genius public search + web scrape
  try {
    const query = `${artist ? artist + ' ' : ''}${cleanTitle}`;
    const searchUrl = `https://genius.com/api/search/multi?per_page=5&q=${encodeURIComponent(query)}`;
    const res = await axios.get(searchUrl, {
      timeout: 5000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });

    const sections = res.data?.response?.sections || [];
    const songSection = sections.find((s) => s.type === 'song');
    const hit = songSection?.hits?.[0]?.result;

    if (hit && hit.path) {
      const songPageUrl = `https://genius.com${hit.path}`;
      const pageRes = await axios.get(songPageUrl, {
        timeout: 5000,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });

      const $ = cheerio.load(pageRes.data);
      let lyrics = '';

      // Genius lyric containers
      $('div[data-lyrics-container="true"]').each((_, elem) => {
        $(elem).find('br').replaceWith('\n');
        lyrics += $(elem).text() + '\n\n';
      });

      lyrics = lyrics.trim();
      if (lyrics) {
        return {
          title: hit.title || cleanTitle,
          artist: hit.primary_artist?.name || artist || 'Unknown Artist',
          lyrics: lyrics,
          source: 'Genius'
        };
      }
    }
  } catch (err) {
    logger.debug('Genius scrape error:', err.message);
  }

  return null;
}

module.exports = {
  fetchLyrics
};
