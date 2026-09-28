export default async function handler(req, res) {
  // CORS & 30-minute Edge caching with 24-hour stale-while-revalidate
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=86400');

  const CHANNEL_ID = 'UCm3C__y6F_KLPH-D-5Rc4jQ';
  const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

  try {
    const response = await fetch(RSS_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`YouTube RSS returned status ${response.status}`);
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
          isShort,
          thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
        });
      }
    }

    const featuredVideos = entries.filter(e => !e.isShort);
    const shorts = entries.filter(e => e.isShort);

    return res.status(200).json({
      success: true,
      channelId: CHANNEL_ID,
      count: entries.length,
      updatedAt: new Date().toISOString(),
      featuredVideos,
      shorts
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch YouTube feed'
    });
  }
}
