/**
 * Soundriya Rathore - YouTube Automated Sync Script
 * ====================================================
 * Automatically fetches the latest videos and shorts from Soundriya's
 * official YouTube RSS feed, and updates:
 *   1. js/config.js (Featured videos and shorts lists)
 *   2. sitemap.xml (Google video schema and lastmod dates)
 * 
 * Works with zero npm dependencies (pure Node.js 18+).
 */

const fs = require('fs');
const path = require('path');

const CHANNEL_ID = 'UCm3C__y6F_KLPH-D-5Rc4jQ';
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

const CONFIG_PATH = path.join(__dirname, '..', 'js', 'config.js');
const SITEMAP_PATH = path.join(__dirname, '..', 'sitemap.xml');

async function sync() {
  console.log(`[YouTube Sync] Fetching RSS feed for channel: ${CHANNEL_ID}...`);

  const response = await fetch(RSS_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch YouTube RSS: HTTP ${response.status}`);
  }

  const xml = await response.text();

  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  const entries = [];
  let match;

  while ((match = entryRegex.exec(xml)) !== null) {
    const entryText = match[1];
    const videoIdMatch = entryText.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
    const titleMatch = entryText.match(/<title>([^<]+)<\/title>/);
    const publishedMatch = entryText.match(/<published>([^<]+)<\/published>/);
    const linkMatch = entryText.match(/<link[^>]+href="([^"]+)"/);

    if (videoIdMatch && titleMatch) {
      const videoId = videoIdMatch[1];
      let title = titleMatch[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
      const cleanTitle = title.replace(/\s*\|\|\s*Soundriya Rathore\s*\|\|/i, '').replace(/\s*-\s*Soundriya Rathore/i, '').replace(/\s*\.$/, '').trim();
      const published = publishedMatch ? publishedMatch[1] : '';
      const url = linkMatch ? linkMatch[1] : `https://www.youtube.com/watch?v=${videoId}`;
      const isShort = url.includes('/shorts/');

      entries.push({
        id: videoId,
        title: cleanTitle || title,
        rawTitle: title,
        url,
        published,
        isShort
      });
    }
  }

  console.log(`[YouTube Sync] Found ${entries.length} total entries.`);

  const featured = entries.filter(e => !e.isShort && e.id !== 'E0j9MgTL14U'); // Exclude main showreel from regular grid
  const shorts = entries.filter(e => e.isShort);

  // 1. Update js/config.js
  if (fs.existsSync(CONFIG_PATH)) {
    let configText = fs.readFileSync(CONFIG_PATH, 'utf8');

    // Build featuredVideos JSON string
    const featuredItems = featured.slice(0, 8).map(v => {
      let badge = 'Special Coverage';
      let category = 'Broadcast Journalism';
      const lower = v.title.toLowerCase();

      if (lower.includes('documentary')) {
        badge = 'Documentary';
        category = 'Documentary Production';
      } else if (lower.includes('anchoring') || lower.includes('studio')) {
        badge = 'Anchoring';
        category = 'News Studio Desk';
      } else if (lower.includes('bulletin') || lower.includes('news')) {
        badge = 'Bulletin';
        category = 'Broadcast Journalism';
      } else if (lower.includes('reporting') || lower.includes('camera') || lower.includes('ground') || lower.includes('protest')) {
        badge = 'Field Reporting';
        category = 'Field Journalism';
      } else if (lower.includes('talk show') || lower.includes('interview')) {
        badge = 'Talk Show';
        category = 'Moderation & Panel';
      } else if (lower.includes('podcast')) {
        badge = 'Podcast';
        category = 'Dialogue & Audio-Visual';
      }

      return `    {\n      youtubeId: ${JSON.stringify(v.id)},\n      title: ${JSON.stringify(v.title)},\n      category: ${JSON.stringify(category)},\n      badge: ${JSON.stringify(badge)}\n    }`;
    }).join(',\n');

    const shortsItems = shorts.slice(0, 6).map(s => {
      let label = 'Live Stage Event';
      const lower = s.title.toLowerCase();
      if (lower.includes('holi') || lower.includes('festival')) label = 'Cultural Festival';
      else if (lower.includes('comedy') || lower.includes('stand')) label = 'Comedy & Entertainment';
      else if (lower.includes('alumni') || lower.includes('gala')) label = 'Institutional Gala';
      else if (lower.includes('digital') || lower.includes('news') || lower.includes('reel')) label = 'Digital News Desk';

      return `    {\n      youtubeId: ${JSON.stringify(s.id)},\n      title: ${JSON.stringify(s.title)},\n      label: ${JSON.stringify(label)}\n    }`;
    }).join(',\n');

    // Replace featuredVideos in configText
    configText = configText.replace(
      /featuredVideos:\s*\[[\s\S]*?\n\s*\]/,
      `featuredVideos: [\n${featuredItems}\n  ]`
    );

    // Replace shorts in configText
    configText = configText.replace(
      /shorts:\s*\[[\s\S]*?\n\s*\]/,
      `shorts: [\n${shortsItems}\n  ]`
    );

    fs.writeFileSync(CONFIG_PATH, configText, 'utf8');
    console.log('[YouTube Sync] Successfully updated js/config.js');
  }

  // 2. Update sitemap.xml
  if (fs.existsSync(SITEMAP_PATH)) {
    let sitemapText = fs.readFileSync(SITEMAP_PATH, 'utf8');
    const today = new Date().toISOString().split('T')[0];
    sitemapText = sitemapText.replace(/<lastmod>[^<]+<\/lastmod>/g, `<lastmod>${today}</lastmod>`);
    fs.writeFileSync(SITEMAP_PATH, sitemapText, 'utf8');
    console.log(`[YouTube Sync] Successfully updated sitemap.xml with lastmod: ${today}`);
  }

  console.log('[YouTube Sync] All sync tasks completed successfully!');
}

sync().catch(err => {
  console.error('[YouTube Sync Error]:', err);
  process.exit(1);
});
