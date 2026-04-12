// api/fetch-page.js
// Vercel serverless function — fetches a URL server-side and extracts
// colours, fonts, and basic content for the Page Builder branding step

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { url } = body;
  if (!url) {
    return new Response(JSON.stringify({ error: 'URL is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Normalise URL
  let targetUrl = url.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'https://' + targetUrl;
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SaaSyFunnels/1.0; +https://saasyfunnels.com)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return new Response(JSON.stringify({
        error: `Could not fetch page — status ${response.status}`,
        url: targetUrl,
      }), {
        status: 200, // return 200 so the tool can handle gracefully
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const html = await response.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // Extract meta description
    const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
    const description = descMatch ? descMatch[1].trim() : '';

    // Extract all inline colours from style attributes and <style> tags
    const colours = extractColours(html);

    // Extract font families
    const fonts = extractFonts(html);

    // Extract Google Fonts imports
    const googleFonts = extractGoogleFonts(html);

    // Extract primary CTA button text (first button or a.btn)
    const ctaMatch = html.match(/<(?:button|a)[^>]*class=["'][^"']*(?:btn|button|cta)[^"']*["'][^>]*>([^<]{3,60})<\/(?:button|a)>/i);
    const primaryCTA = ctaMatch ? ctaMatch[1].trim() : '';

    // Extract h1
    const h1Match = html.match(/<h1[^>]*>([^<]{5,200})<\/h1>/i);
    const h1 = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : '';

    return new Response(JSON.stringify({
      success: true,
      url: targetUrl,
      title,
      description,
      h1,
      primaryCTA,
      colours: colours.slice(0, 20),
      fonts: fonts.slice(0, 10),
      googleFonts,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (err) {
    return new Response(JSON.stringify({
      error: `Failed to fetch page: ${err.message}`,
      url: targetUrl,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

function extractColours(html) {
  const colours = new Set();

  // Hex colours
  const hexMatches = html.matchAll(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g);
  for (const m of hexMatches) {
    const hex = m[0].toUpperCase();
    // Skip very light (near white) and very dark (near black) unless prominent
    colours.add(hex);
  }

  // RGB/RGBA
  const rgbMatches = html.matchAll(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g);
  for (const m of rgbMatches) {
    const r = parseInt(m[1]);
    const g = parseInt(m[2]);
    const b = parseInt(m[3]);
    const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
    colours.add(hex);
  }

  // Filter out pure white, pure black, and very common greys
  const filtered = [...colours].filter(c => {
    const clean = c.replace('#', '');
    const full = clean.length === 3
      ? clean.split('').map(x => x + x).join('')
      : clean;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    // Skip pure white
    if (r > 250 && g > 250 && b > 250) return false;
    // Skip pure black
    if (r < 5 && g < 5 && b < 5) return false;
    return true;
  });

  return filtered;
}

function extractFonts(html) {
  const fonts = new Set();

  // font-family in style attributes and style blocks
  const fontMatches = html.matchAll(/font-family\s*:\s*([^;}"'}{]+)/gi);
  for (const m of fontMatches) {
    const raw = m[1].trim();
    // Split on commas, clean up quotes and fallbacks
    raw.split(',').forEach(f => {
      const clean = f.trim().replace(/['"]/g, '').trim();
      if (clean && clean !== 'inherit' && clean !== 'initial' && clean !== 'unset') {
        fonts.add(clean);
      }
    });
  }

  return [...fonts];
}

function extractGoogleFonts(html) {
  const fonts = [];
  const matches = html.matchAll(/fonts\.googleapis\.com\/css[^"']*family=([^"'&]+)/gi);
  for (const m of matches) {
    const raw = decodeURIComponent(m[1]);
    raw.split('|').forEach(f => {
      const name = f.split(':')[0].replace(/\+/g, ' ').trim();
      if (name) fonts.push(name);
    });
  }
  return [...new Set(fonts)];
}
