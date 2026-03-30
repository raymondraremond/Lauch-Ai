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

  if (req.method === 'POST' && req.url === '/api/chat') {
    setCorsHeaders(res);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Dummy chat endpoint' }));
    return;
  }

  if (req.method === 'POST' && req.url === '/api/critique') {
    setCorsHeaders(res);
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

      // Call Gemini 1.5 Flash endpoint (Free Tier Optimization)
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
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

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ critique, tier, projectTitle }));
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
