# 🚀 Wiring Live AI & Database to LaunchAI

Follow this guide to get your AI features and professional authentication working for real.

## 1. Get Your AI API Keys

### 💎 Google Gemini (Best Free Tier)
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Click **Create API Key** on the left.
3. Click **Create API Key in new project**.
4. Copy your key.

---

## 2. Connect Your Database (Supabase)

LaunchAI now uses **Supabase** for professional authentication and project persistence. This enables multi-user support and data isolation.

### Step 1: Create a Supabase Project
1. Go to [Supabase](https://supabase.com/) and sign up/in.
2. Create a new project.
3. Once created, go to **Project Settings** > **API**.
4. Copy the `Project URL` and `anon public` key.

### Step 2: Set Up the Database
1. In your Supabase Dashboard, go to the **SQL Editor** on the left.
2. Open a new query and paste the contents of `supabase_setup.sql` (located in the project root).
3. Click **Run**. This will create the `projects` table and enable Row Level Security (RLS).

---

## 3. Configure Your Environment

1. Find the `.env.example` file in the project folder.
2. Duplicate it and rename the copy to `.env`.
3. Fill in your keys:
   ```bash
   # Supabase Credentials
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

   # AI Engines
   VITE_GOOGLE_API_KEY=your_gemini_key_here
   VITE_ANTHROPIC_API_KEY=your_anthropic_key_here
   ```
4. Restart your development server (`npm run dev`).

---

## 4. Professional Features

### 🔐 Authentication
LaunchAI supports **Email/Password** login out of the box. Users can sign up, sign in, and reset their passwords securely.

### 🛡️ Data Isolation (RLS)
The `supabase_setup.sql` script enables **Row Level Security**. This means that even though all projects are in one table, a user can *only* see and edit their own projects. This is "strict isolation" used in professional SaaS applications.

### ☁️ Multi-User Cloud
Your projects are no longer trapped in your browser's local cache. Log in from any device, and your workspace will be exactly where you left it.

---

> [!TIP]
> **Authentication Redirects**: Ensure that in your Supabase Auth settings, the "Site URL" is set to your development URL (e.g., `http://localhost:5173`) so that magic links and password resets redirect correctly.
