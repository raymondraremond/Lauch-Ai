# 🚀 Wiring Live AI to LaunchAI

Follow this guide to get your AI features working for real. We recommend **Google Gemini** as it has a very generous **Free Tier**.

## 1. Get Your API Keys

### 💎 Google Gemini (Best Free Tier)
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Click **Create API Key** on the left.
3. Click **Create API Key in new project**.
4. Copy your key.

### 🎭 Anthropic Claude (Premium)
1. Go to [Anthropic Console](https://console.anthropic.com/).
2. Navigate to **API Keys**.
3. Create a new key and copy it.

---

## 2. Configure Your Keys

You have two ways to add your keys:

### Option A: Use the Sidebar (Easiest)
We've added a **Settings** section in the app sidebar. You can paste your keys there, and they will be saved securely in your browser's local storage. This is the fastest way to get started!

### Option B: Use the `.env` file
If you prefer a more technical approach, follow these steps:
1. Find the `.env.example` file in the project folder.
2. Duplicate it and rename the copy to `.env`.
3. Open `.env` and paste your keys:
   ```bash
   VITE_GOOGLE_API_KEY=your_gemini_key_here
   VITE_ANTHROPIC_API_KEY=your_anthropic_key_here
   ```
4. Restart your development server (`npm run dev`).

---

## 3. How it Works
LaunchAI is designed to be smart about your connections:
1. **Gemini** will be used as the primary engine if you provide a key.
2. **Claude** will be used if Gemini is missing or fails.
3. **Demo Mode** will run automatically if no keys are found.

> [!TIP]
> **No Database Needed!** Your keys are stored either in your `.env` file or your browser's local cache. We never send your keys to our own servers.

---

## 4. 🗄️ When to connect a Database (Neon/Postgres)?

For now, LaunchAI uses **Local Persistence**, meaning your projects are saved directly in your browser. This is perfect for building and testing your own tools.

You should consider connecting a real database like **Neon** when:
1. **Multi-User Support**: You want users to create accounts and log in from any device.
2. **Data Sharing**: You need to share projects or data between different users.
3. **Scale**: You have thousands of projects or complex data relationships that need robust querying.
4. **Production SaaS**: You are ready to turn your LaunchAI project into a commercial product with recurring billing and user profiles.

*Stay tuned — we are building a one-click Neon integration for the next version!*
