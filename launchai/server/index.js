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
const anthropicKey = process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;

const PORT = 4000;

const setCorsHeaders = (req, res) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://lauch-ai-fwx4.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean)

  const origin = req.headers.origin;
  if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
};

const server = http.createServer(async (req, res) => {
  // Global Error Boundary for the request
  try {
    if (req.method === 'OPTIONS') {
      setCorsHeaders(req, res);
      res.writeHead(204);
      res.end();
      return;
    }

    // Helper to parse JSON body (Safe parsing)
    const getBody = async () => {
      // Return cached body if already parsed to avoid stream double-read issues
      if (req._parsedBody) return req._parsedBody;

      return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try { 
            const parsed = body ? JSON.parse(body) : {};
            req._parsedBody = parsed; // Cache it
            resolve(parsed); 
          }
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

      try {
        // Fetch credits
        const getRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=credits`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        });
        
        if (!getRes.ok) throw new Error('Supabase Profile Fetch Failed');
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
      } catch (err) {
        console.error('[CREDITS] Error:', err.message);
        return { error: 'Database Connectivity Issue' };
      }
    };

    // --- Auth Middleware Helper ---
    const getUserIdFromToken = async (token) => {
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (!token) return null;

      try {
        const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
          headers: { 'apikey': supabaseKey, 'Authorization': token }
        });
        
        if (!res.ok) return null;
        const user = await res.json();
        return user?.id || null;
      } catch (err) {
        return null;
      }
    };

    if (req.method === 'GET' && (req.url === '/' || req.url === '')) {
      setCorsHeaders(req, res);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'LaunchAI server running ✅', timestamp: new Date().toISOString() }));
      return;
    }

    if (req.method === 'GET' && req.url === '/api/user/credits') {
      setCorsHeaders(req, res);
      const userId = await getUserIdFromToken(req.headers.authorization);
      if (!userId) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
      }
      const result = await handleUserCredits(userId, 0);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ credits: result.credits || 0 }));
      return;
    }

    if (req.method === 'POST' && req.url === '/api/generate') {
      setCorsHeaders(req, res);
      const userId = await getUserIdFromToken(req.headers.authorization);
      if (!userId) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
      }

      const { prompt, parts, model } = await getBody();
      
      // Credit Check
      const creditCheck = await handleUserCredits(userId, -1);
      if (creditCheck.error) {
        res.writeHead(402, { 'Content-Type': 'application/json' }); 
        res.end(JSON.stringify({ error: creditCheck.error, credits: creditCheck.credits }));
        return;
      }

      // Use the model provided by the client, defaulting to gemini-2.5-flash as per AIConfig.js
      const activeModel = model || 'gemini-2.5-flash';

      try {
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: parts || [{ text: prompt }] }] })
        });
        
        const data = await geminiRes.json();
        
        if (!geminiRes.ok) {
          throw new Error(data.error?.message || 'Google AI Error');
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ...data, remainingCredits: creditCheck.credits }));
      } catch (err) {
        console.error('[AI Proxy] Error:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'AI Generation Failed: ' + err.message }));
      }
      return;
    }

    if (req.method === 'POST' && req.url === '/api/critique') {
      setCorsHeaders(req, res);
      const userId = await getUserIdFromToken(req.headers.authorization);
      if (!userId) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
      }

      const body = await getBody();
      const { tier, submissionType, projectTitle, projectDescription, targetAudience, aiFeatures, fileContent, fileType, url, additionalContext } = body;

      const cost = tier === 'pro' ? 3 : 1;
      const creditCheck = await handleUserCredits(userId, -cost);
      if (creditCheck.error) {
        res.writeHead(402, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: creditCheck.error, credits: creditCheck.credits }));
        return;
      }

      try {
        // System Prompt Logic
        let systemPrompt = '';
        if (tier === 'free') {
          systemPrompt = "You are a sharp AI critic. Exactly 4 parts:SCORE: X/100, STRONGEST POINT, BIGGEST RISK, TOP SUGGESTION.";
        } else {
          systemPrompt = "You are a senior AI strategist. Detailed 7-part critique: SCORE, CONCEPT, MARKET FIT, AI FEATURES, UX, COMPETITIVE, ROADMAP.";
        }

        let contents = [];
        if (submissionType === 'file' && fileType === 'pdf') {
          contents = [{ role: 'user', parts: [
            { text: `Critique "${projectTitle}". Analyze PDF context.` },
            { inline_data: { mime_type: 'application/pdf', data: fileContent } }
          ]}];
        } else {
          contents = [{ role: 'user', parts: [{ text: `Critique "${projectTitle}": ${projectDescription}` }] }];
        }

        // Use Gemini 3.1 Pro for reasoning as per AIConfig.js
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: contents,
          })
        });

        const data = await response.json();
        
        if (data.error) throw new Error(data.error.message || 'Gemini Pro Error');

        const critique = data.candidates?.[0]?.content?.parts?.[0]?.text || "No critique returned.";
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ critique, remainingCredits: creditCheck.credits }));
      } catch (err) {
        console.error('[Critique] Error:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Critique Generation Failed' }));
      }
      return;
    }

    if (req.method === 'POST' && req.url === '/api/companion') {
      setCorsHeaders(req, res);
      const userId = await getUserIdFromToken(req.headers.authorization);
      if (!userId) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
      }

      const { systemPrompt, userMessage } = await getBody();
      const creditCheck = await handleUserCredits(userId, -1);
      if (creditCheck.error) {
        res.writeHead(402, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: creditCheck.error }));
        return;
      }

      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userMessage }] }]
        })
      });
      const data = await geminiRes.json();
      const aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.';

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ response: aiResponseText, remainingCredits: creditCheck.credits }));
      return;
    }

    // Default 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));

  } catch (criticalError) {
    console.error('🔥 [SERVER CRITICAL]:', criticalError);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal Server Disaster', details: criticalError.message }));
    }
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
