import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Very basic manual parsing of .env since we cannot install dotenv per rules
try {
  const envPath = path.resolve(__dirname, '../.env');
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      process.env[key] = value;
    }
  });
} catch (e) {
  // Ignore if .env doesn't exist
}

// Support the user's instruction about GEMINI_API_KEY or use the existing VITE_GOOGLE_API_KEY
const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GOOGLE_API_KEY;

const PORT = 4000;

const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    res.writeHead(204);
    res.end();
    return;
  }

  // Helper to parse JSON body
  const getBody = async () => {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try { resolve(body ? JSON.parse(body) : {}); }
        catch (e) { resolve({}); }
      });
      req.on('error', reject);
    });
  };

  // --- User Credit & Profile Helper ---
  const handleUserCredits = async (userId, amount = -1) => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) return { error: 'Environment unconfigured' };

    // Fetch credits
    const getRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=credits`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    });
    const profiles = await getRes.json();
    const userCredits = profiles?.[0]?.credits ?? 0;

    if (amount < 0 && userCredits < Math.abs(amount)) {
      return { error: 'Insufficient credits', credits: userCredits };
    }

    // Update credits
    const upRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ credits: userCredits + amount })
    });
    const updated = await upRes.json();
    return { success: true, credits: updated?.[0]?.credits };
  };

  // --- Auth Middleware Helper ---
  const getUserIdFromToken = async (token) => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    if (!token) return null;
    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { 'apikey': supabaseKey, 'Authorization': token }
    });
    const user = await res.json();
    return user?.id || null;
  };

  if (req.method === 'GET' && req.url === '/api/user/credits') {
    setCorsHeaders(res);
    const userId = await getUserIdFromToken(req.headers.authorization);
    if (!userId) {
      res.writeHead(401); res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }
    const result = await handleUserCredits(userId, 0);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ credits: result.credits || 0 }));
    return;
  }

  if (req.method === 'POST' && req.url === '/api/generate') {
    setCorsHeaders(res);
    const userId = await getUserIdFromToken(req.headers.authorization);
    if (!userId) {
      res.writeHead(401); res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }

    const { prompt, parts, model = 'gemini-2.5-flash' } = await getBody();
    
    // Check & Decrement Credit
    const creditCheck = await handleUserCredits(userId, -1);
    if (creditCheck.error) {
      res.writeHead(402); res.end(JSON.stringify({ error: 'Insufficient credits (NGN top-up required)', credits: creditCheck.credits }));
      return;
    }

    try {
      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: parts || [{ text: prompt }] }] })
      });
      const data = await geminiRes.json();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ...data, remainingCredits: creditCheck.credits }));
    } catch (err) {
      console.error('[AI Proxy] Error:', err);
      res.writeHead(500); res.end(JSON.stringify({ error: 'AI Generation Failed' }));
    }
    return;
  }

  // Paystack Webhook Placeholder
  if (req.method === 'POST' && req.url === '/api/paystack/webhook') {
    setCorsHeaders(res);
    console.log('[Paystack Webhook] Received event (NGN Transition Ready)');
    res.writeHead(200); res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  if (req.method === 'POST' && req.url === '/api/critique') {
    setCorsHeaders(res);
    const userId = await getUserIdFromToken(req.headers.authorization);
    if (!userId) {
      res.writeHead(401); res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }

    const body = await getBody();
    const { tier } = body;

    // Check & Decrement Credit (Pro audits cost 3, free cost 1)
    const cost = tier === 'pro' ? 3 : 1;
    const creditCheck = await handleUserCredits(userId, -cost);
    if (creditCheck.error) {
      res.writeHead(402); res.end(JSON.stringify({ error: `Insufficient credits for ${tier} audit (NGN top-up required)`, credits: creditCheck.credits }));
      return;
    }

    try {
      const body = await getBody();
      const { submissionType, projectTitle, projectDescription, targetAudience, aiFeatures, fileContent, fileType, url, additionalContext, tier } = body;

      let systemPrompt = '';
      if (tier === 'free') {
        systemPrompt = "You are a sharp, honest AI product critic. Give a brief critique in exactly 4 parts. Use headers exactly like this: '### SCORE: X/100 ###', '### STRONGEST POINT ###', '### BIGGEST RISK ###', and '### TOP SUGGESTION ###'.\n0. SCORE: Rate the concept out of 100 based on market potential and execution (e.g., 75/100)\n1. STRONGEST POINT: One thing this project does well (2 sentences max)\n2. BIGGEST RISK: The most critical problem or gap (2 sentences max)\n3. TOP SUGGESTION: The single most impactful improvement they should make (2 sentences max)\nBe direct, specific, and constructive. No fluff.";
      } else {
        systemPrompt = "You are a senior AI product strategist and critic. Give a comprehensive critique with these sections, using headers like '### SECTION NAME ###':\n0. SCORE: Provide a total score in the format '### SCORE: X/100 ###' based on all criteria below.\n1. CONCEPT SCORE: Rate the idea out of 10 with justification\n2. MARKET FIT: Assess target audience and demand (3-4 sentences)\n3. AI FEATURE ANALYSIS: Evaluate their AI feature choices — are they the right ones? (3-4 sentences)\n4. UX & FLOW CRITIQUE: Assess user experience and product flow (3-4 sentences)\n5. COMPETITIVE LANDSCAPE: Name 2-3 competitors and how this project differentiates (3-4 sentences)\n6. IMPROVEMENT ROADMAP: Give 5 specific, prioritized action items to make this product stronger\n7. VERDICT: Final honest recommendation in 2 sentences\nBe brutally honest, specific, and valuable. This is a paid critique.";
      }

      let contents = [];
      if (submissionType === 'file' && fileType === 'pdf') {
        contents = [{
          role: 'user',
          parts: [
            { text: `Please critique this AI project titled "${projectTitle || 'N/A'}". Analyze the attached PDF for project details and context.` },
            { inline_data: { mime_type: 'application/pdf', data: fileContent } }
          ]
        }];
      } else {
        let promptText = '';
        if (submissionType === 'file') {
          promptText = `Please critique this AI project submitted as a document file.\nTitle: ${projectTitle || 'N/A'}\nDocument contents:\n---\n${fileContent || 'No content provided'}\n---\nBased on the above, give a full critique covering what this project is, who it's for, and how strong it is.`;
        } else if (submissionType === 'link') {
          promptText = `Please critique this AI project based on the link provided.\nTitle: ${projectTitle || 'N/A'}\nProject URL: ${url || 'N/A'}\nAdditional context from the user: ${additionalContext || 'None provided'}\n\nSearch and analyze the project from the URL, infer what it does, who it targets, and what AI features it likely uses. Then give a full critique.`;
        } else {
          promptText = `Please critique this AI project:\nTitle: ${projectTitle || 'N/A'}\nDescription: ${projectDescription || 'N/A'}\nTarget Audience: ${targetAudience || 'N/A'}\nAI Features Used: ${aiFeatures || 'N/A'}`;
        }
        contents = [{ role: 'user', parts: [{ text: promptText }] }];
      }

      console.log(`[Critique] Generating ${tier} critique for "${projectTitle}" using Gemini 3.1 Pro-preview...`);

      if (!apiKey) {
         console.error('[Critique] API key not configured');
         res.writeHead(500, { 'Content-Type': 'application/json' });
         res.end(JSON.stringify({ error: 'API key not configured' }));
         return;
      }

      // Call Gemini 3.1 Pro Preview endpoint for advanced reasoning capability
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: contents,
        })
      });

      const data = await response.json();
      
      if (data.error) {
        console.error('[Critique] Gemini API Error:', data.error.message || data.error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: data.error.message || 'Gemini API Error' }));
        return;
      }

      console.log('[Critique] Successfully generated critique');

      const critique = data.candidates?.[0]?.content?.parts?.[0]?.text || "No critique returned.";

      // --- SUPABASE PERSISTENCE ---
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && supabaseKey) {
        try {
          await fetch(`${supabaseUrl}/rest/v1/critiques`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              user_id: userId,
              project_title: projectTitle || 'Untitled',
              project_description: projectDescription || '',
              submission_type: submissionType || 'manual',
              critique_text: critique,
              tier: tier || 'free',
              created_at: new Date().toISOString()
            })
          });
          console.log('[Supabase] Critique persisted successfully');
        } catch (sErr) {
          console.error('[Supabase] Failed to persist critique:', sErr.message);
        }
      }
      // ----------------------------
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ critique, tier, projectTitle, remainingCredits: creditCheck.credits }));
    } catch (err) {
      console.error(err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
    return;
  }

  // Fallback 404
  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
