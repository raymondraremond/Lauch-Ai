// api/index.js
// Vercel Serverless Function Bridge for LaunchAI AI Proxy & Credits
import { createServer } from 'http';

// We re-use exactly the same logic from your server, but adapted to Vercel's signature.
// Since Vercel works best with single handlers or Express, we'll keep the handler logic clean.

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GOOGLE_API_KEY;
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

const getUserIdFromToken = async (token) => {
  if (!token) return null;
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': token,
        'apikey': process.env.VITE_SUPABASE_ANON_KEY
      }
    });
    const data = await res.json();
    return data?.id || null;
  } catch (err) {
    return null;
  }
};

const handleUserCredits = async (userId, amount) => {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    const profile = (await res.json())[0];
    if (!profile) return { error: 'Profile not found' };
    
    // Admin/Founder Bypass - If tier is founder, never block them
    if (profile.tier === 'founder') {
      return { credits: 99999 };
    }

    const newCredits = (profile.credits || 0) + amount;
    if (newCredits < 0) return { error: 'Insufficient credits', credits: profile.credits };
    await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ credits: newCredits })
    });

    return { credits: newCredits };
  } catch (err) {
    return { error: 'Credit update failed' };
  }
};

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = req.url;

  // 1. AI Generation Proxy
  if (req.method === 'POST' && url.includes('/api/generate')) {
    const authHeader = req.headers.authorization;
    const userId = await getUserIdFromToken(authHeader);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Credits check (1 per generation)
    const creditCheck = await handleUserCredits(userId, -1);
    if (creditCheck.error) {
       res.status(402).json({ error: creditCheck.error, credits: creditCheck.credits });
       return;
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    try {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${body.model || 'gemini-2.5-flash'}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: body.parts }] })
        }
      );
      const data = await geminiRes.json();
      res.status(200).json({ ...data, remainingCredits: creditCheck.credits });
    } catch (err) {
      res.status(500).json({ error: 'AI Generation Failed' });
    }
  }

  // 2. Project Critique Proxy
  else if (req.method === 'POST' && url.includes('/api/critique')) {
    const authHeader = req.headers.authorization;
    const userId = await getUserIdFromToken(authHeader);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { tier, projectTitle, projectDescription, submissionType } = body;

    const cost = tier === 'pro' ? 3 : 1;
    const creditCheck = await handleUserCredits(userId, -cost);
    if (creditCheck.error) {
       res.status(402).json({ error: creditCheck.error, credits: creditCheck.credits });
       return;
    }

    // Specialized Critique prompt... (Simplified for the bridge)
    try {
       const geminiRes = await fetch(
         `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
         {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             contents: [{ parts: [{ text: `Critique this project: ${projectTitle}. Description: ${projectDescription}` }] }]
           })
         }
       );
       const data = await geminiRes.json();
       const critique = data.candidates?.[0]?.content?.parts?.[0]?.text;

       // Persist to Supabase
       await fetch(`${supabaseUrl}/rest/v1/critiques`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({
            user_id: userId,
            project_title: projectTitle,
            critique_text: critique,
            tier: tier || 'free'
          })
       });

       res.status(200).json({ critique, remainingCredits: creditCheck.credits });
    } catch (err) {
       res.status(500).json({ error: 'Critique Failed' });
    }
  }

  // 3. Get User Credits
  else if (req.method === 'GET' && url.includes('/api/user/credits')) {
    const authHeader = req.headers.authorization;
    const userId = await getUserIdFromToken(authHeader);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    try {
      const resProfile = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      const profile = (await resProfile.json())[0];
      res.status(200).json({ credits: profile?.credits || 0 });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch credits' });
    }
  }

  // 4. Paystack Webhook
  else if (req.method === 'POST' && url.includes('/api/paystack/webhook')) {
     // Webhook logic here... (Stub)
     res.status(200).json({ status: 'success' });
  }

  else {
    res.status(404).json({ error: 'Route not found' });
  }
}
