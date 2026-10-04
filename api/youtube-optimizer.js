export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');

  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return res.status(500).json({
      success: false,
      error: 'YouTube OAuth environment variables not configured on Vercel.'
    });
  }

  try {
    // 1. Refresh OAuth Access Token
    const tokenParams = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    });

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams.toString()
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      throw new Error(`Token refresh failed: ${errText}`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    const authHeaders = {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    };

    // 2. Fetch Channel Uploads Playlist
    const chRes = await fetch('https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true', {
      headers: authHeaders
    });
    const chData = await chRes.json();
    if (!chData.items || chData.items.length === 0) {
      throw new Error('No YouTube channel found for authenticated account.');
    }

    const uploadsPlaylistId = chData.items[0].contentDetails.relatedPlaylists.uploads;

    // 3. Fetch Playlist Items
    const plRes = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=30`, {
      headers: authHeaders
    });
    const plData = await plRes.json();
    const videoIds = (plData.items || []).map(it => it.contentDetails.videoId).join(',');

    if (!videoIds) {
      return res.status(200).json({ success: true, message: 'No videos found in uploads playlist.' });
    }

    // 4. Fetch Full Video Details
    const vidRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}`, {
      headers: authHeaders
    });
    const vidData = await vidRes.json();

    let updatedCount = 0;
    const actions = [];

    for (const v of (vidData.items || [])) {
      const id = v.id;
      let title = v.snippet.title;
      let desc = v.snippet.description || '';
      let tags = v.snippet.tags || [];

      let needsUpdate = false;

      // Check if description contains outdated manager phone number
      if (desc.includes('95718 59038') || desc.includes('Direct Bookings & Management:')) {
        needsUpdate = true;
      }

      // Check if official website is missing
      if (!desc.includes('soundriyarathore.vercel.app')) {
        needsUpdate = true;
      }

      // Check if socials are missing
      if (!desc.includes('no_but.seriously') || !desc.includes('Soundriya_rathore')) {
        needsUpdate = true;
      }

      // Check if tags are sparse
      if (tags.length < 10) {
        needsUpdate = true;
      }

      if (needsUpdate) {
        // Clean narrative
        let cleanNarrative = desc;
        const markers = [
          'Official Website & Media Portfolio:',
          'Official Website & Portfolio:',
          'Official Website:',
          'Direct Bookings & Management:',
          'Manager (WhatsApp & Calls):',
          'Connect on Social Media & Official Channels:',
          'Connect on Social Media:',
          'Follow & Connect Across Platforms:',
          'https://soundriyarathore.vercel.app/'
        ];
        for (const m of markers) {
          if (cleanNarrative.includes(m)) {
            cleanNarrative = cleanNarrative.split(m)[0].trim();
          }
        }
        cleanNarrative = cleanNarrative.replace(/(?m)^#\S+\s*/g, '').trim();
        if (!cleanNarrative) {
          cleanNarrative = 'Television Journalist, News Anchor, and Live Event Host Soundriya Rathore.';
        }

        const isShort = title.includes('#Shorts') || (v.contentDetails && v.contentDetails.duration && v.contentDetails.duration.includes('S') && !v.contentDetails.duration.includes('M'));
        const hashtags = isShort
          ? '#SoundriyaRathore #Journalism #NewsAnchor #MediaHost #Shorts #ShortsFeed'
          : '#SoundriyaRathore #Journalism #NewsAnchor #MediaHost';

        const standardizedDesc = `${cleanNarrative}

Official Website & Media Portfolio:
https://soundriyarathore.vercel.app/

Connect on Social Media & Official Channels:
Journalism, Anchoring & Stage Hosting Instagram: https://www.instagram.com/no_but.seriously/
Personal Instagram: https://www.instagram.com/Soundriya_rathore/
LinkedIn: https://www.linkedin.com/in/soundriya-rathore-060988316/
YouTube Channel: https://www.youtube.com/@soundriya.rathore
Email: soundriyarathore221@gmail.com

${hashtags}`;

        // Enriched tags
        const defaultTags = ['Soundriya Rathore', 'Indian Journalist', 'TV News Anchor', 'Live Event Host', 'Emcee India', 'Stage Presenter'];
        const tagSet = new Set([...tags, ...defaultTags]);
        if (isShort) {
          tagSet.add('Shorts');
          tagSet.add('YouTube Shorts');
        }

        const updatedSnippet = {
          ...v.snippet,
          description: standardizedDesc,
          tags: Array.from(tagSet)
        };

        const updateRes = await fetch('https://www.googleapis.com/youtube/v3/videos?part=snippet', {
          method: 'PUT',
          headers: {
            ...authHeaders,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: id,
            snippet: updatedSnippet
          })
        });

        if (updateRes.ok) {
          updatedCount++;
          actions.push({ id, status: 'updated' });
        } else {
          const errText = await updateRes.text();
          actions.push({ id, status: 'error', error: errText });
        }
      }
    }

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      videosChecked: (vidData.items || []).length,
      updatedCount,
      actions
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal error during YouTube optimization'
    });
  }
}
