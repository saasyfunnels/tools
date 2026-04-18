// api/save-page.js
// Saves an HTML string to Vercel Blob and returns a public URL.
// Called by the Page Builder after AI generates a full HTML page.

import { put } from '@vercel/blob';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

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

  const { html, filename } = body;

  if (!html) {
    return new Response(JSON.stringify({ error: 'html is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Generate a unique filename with timestamp + random suffix
  const slug = (filename || 'page')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);

  const timestamp = Date.now();
  const rand = Math.random().toString(36).slice(2, 7);
  const blobPath = `pages/${slug}-${timestamp}-${rand}.html`;

  try {
    const blob = await put(blobPath, html, {
      access: 'public',
      contentType: 'text/html; charset=utf-8',
      cacheControlMaxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return new Response(JSON.stringify({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (err) {
    return new Response(JSON.stringify({
      error: `Failed to save page: ${err.message}`,
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
