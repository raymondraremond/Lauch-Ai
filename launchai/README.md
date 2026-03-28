# 🚀 LaunchAI — AI Product Builder Platform

Build AI-powered products without writing code. From idea to launch, guided by an AI copilot.

---

## What's Included

| Page | Route | Description |
|---|---|---|
| Landing Page | `/` | Marketing page with features, pricing, CTA |
| Onboarding | `/onboarding` | 4-step wizard (industry → goal → template → account) |
| Dashboard | `/dashboard` | Project manager with stats |
| AI Builder | `/builder` | Drag-and-drop UI builder + AI copilot sidebar |
| AI Copilot | `/copilot` | Full-page AI chat assistant |

---

## Quick Start (5 minutes)

### 1. Install dependencies

Make sure you have **Node.js 18+** installed. Then:

```bash
cd launchai
npm install
```

### 2. Set up your API key

```bash
cp .env.example .env
```

Open `.env` and replace `your_api_key_here` with your Anthropic API key.

> Get a free API key at: https://console.anthropic.com/settings/api-keys  
> Without a key, the app runs in **demo mode** — the copilot gives pre-written responses.

### 3. Run locally

```bash
npm run dev
```

Open http://localhost:5173 in your browser. ✅

---

## Build for Production

```bash
npm run build
```

This creates a `dist/` folder. Deploy it to any static host:

| Platform | Command / Steps |
|---|---|
| **Vercel** | `npx vercel` (or drag `dist/` to vercel.com) |
| **Netlify** | Drag `dist/` to netlify.com/drop |
| **GitHub Pages** | Push `dist/` to `gh-pages` branch |

> ⚠️ Add your `VITE_ANTHROPIC_API_KEY` as an environment variable in your deployment platform's settings panel — never hard-code it.

---

## Project Structure

```
launchai/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Navbar.jsx        # Top navigation
│   │   ├── Sidebar.jsx       # App sidebar (dashboard/builder/copilot)
│   │   └── ChatWidget.jsx    # Reusable AI chat component
│   ├── pages/
│   │   ├── Landing.jsx       # Marketing landing page
│   │   ├── Onboarding.jsx    # 4-step setup wizard
│   │   ├── Dashboard.jsx     # Project manager
│   │   ├── Builder.jsx       # Visual UI builder
│   │   └── Copilot.jsx       # Full AI copilot page
│   ├── App.jsx               # Router setup
│   ├── main.jsx              # React entry point
│   └── index.css             # Tailwind + global styles
├── .env.example              # Environment variable template
├── index.html                # HTML entry point
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

---

## Customisation Guide

### 🎨 Change brand name / colors
- Name: Search and replace `LaunchAI` across all files
- Colors: Edit `tailwind.config.js` → `colors.brand`

### 💬 Customise the AI Copilot personality
- Open `src/components/ChatWidget.jsx`
- Edit the `SYSTEM_PROMPT` constant at the top of the file

### 💳 Add real authentication
- Replace the `handleFinish()` function in `Onboarding.jsx` with your auth provider (Firebase, Supabase, Clerk, etc.)

### 📊 Add a real database
- Recommended: [Supabase](https://supabase.com) (free tier, Postgres + REST API)
- Replace the `DEMO_PROJECTS` array in `Dashboard.jsx` with a `useEffect` that fetches from your DB

### 💰 Add payments
- [Stripe](https://stripe.com) — integrate Stripe Checkout in the Pricing section of `Landing.jsx`

---

## Tech Stack

- **React 18** + **Vite** — fast dev server and build
- **React Router v6** — client-side routing
- **Tailwind CSS v3** — utility-first styling
- **Lucide React** — icons
- **Anthropic API** — Claude AI for the copilot

---

## Support

Built with ❤️ using LaunchAI.  
Questions? Open an issue or reach out.
