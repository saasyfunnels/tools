// api/generate-image.js
// Generates an image via Replicate (FLUX) and returns a public URL.
// Called by the Page Builder's "Add AI Images" step.

export const config = {
  runtime: 'edge',
};

// FLUX Schnell — fast, high quality, great for marketing/lifestyle imagery
const FLUX_MODEL = 'black-forest-labs/flux-schnell';

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

  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    return new Response(JSON.stringify({ error: 'REPLICATE_API_TOKEN not configured' }), {
      status: 500,
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

  const { prompt, aspect_ratio = '16:9' } = body;

  if (!prompt) {
    return new Response(JSON.stringify({ error: 'prompt is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Enhance prompt for marketing/landing page quality
  const enhancedPrompt = `${prompt}, professional marketing photography, clean composition, high quality, commercial photography style, soft natural lighting`;

  try {
    // Start the prediction
    const startRes = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait', // Ask Replicate to wait up to 60s and return synchronously
      },
      body: JSON.stringify({
        input: {
          prompt: enhancedPrompt,
          aspect_ratio,
          output_format: 'webp',
          output_quality: 90,
          num_outputs: 1,
        },
      }),
    });

    if (!startRes.ok) {
      const err = await startRes.text();
      return new Response(JSON.stringify({ error: `Replicate error: ${err}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const prediction = await startRes.json();

    // If synchronous wait succeeded and output is ready
    if (prediction.status === 'succeeded' && prediction.output?.[0]) {
      return new Response(JSON.stringify({
        success: true,
        url: prediction.output[0],
        prompt: enhancedPrompt,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Otherwise poll until done (max ~50s)
    const pollUrl = prediction.urls?.get;
    if (!pollUrl) {
      return new Response(JSON.stringify({ error: 'No poll URL returned from Replicate' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    let attempts = 0;
    while (attempts < 25) {
      await new Promise(r => setTimeout(r, 2000));
      const pollRes = await fetch(pollUrl, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const result = await pollRes.json();

      if (result.status === 'succeeded' && result.output?.[0]) {
        return new Response(JSON.stringify({
          success: true,
          url: result.output[0],
          prompt: enhancedPrompt,
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      if (result.status === 'failed' || result.status === 'canceled') {
        return new Response(JSON.stringify({ error: `Image generation ${result.status}: ${result.error || 'unknown'}` }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      attempts++;
    }

    return new Response(JSON.stringify({ error: 'Image generation timed out' }), {
      status: 504,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: `Request failed: ${err.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
