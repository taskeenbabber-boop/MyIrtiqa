# 🚀 IRTIQA Website — Full Deployment Guide

## Step 1: Push Code to GitHub

### First time (new repo)
1. Go to [github.com/new](https://github.com/new) → create a new repo (e.g. `irtiqa-main`)
2. Open terminal in your project folder and run:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/irtiqa-main.git
git push -u origin main
```

### Subsequent pushes
```bash
git add .
git commit -m "Your message"
git push
```

---

## Step 2: Set Up Supabase (Backend)

### 2a. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) → Sign Up / Log In
2. Click **"New Project"**
3. Choose your organization
4. Pick a **project name** (e.g. `irtiqa`)
5. Set a **database password** (save this somewhere!)
6. Choose **region** closest to you → Click **"Create new project"**
7. Wait ~2 minutes for the project to be ready

### 2b. Run the Database Migration
1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open the file `supabase/migrations/001_symposium_tables.sql` from your project
4. **Copy ALL the SQL** and paste it into the query editor
5. Click **"Run"** — you should see "Success. No rows returned"
6. Go to **Table Editor** → you should now see 3 tables:
   - `symposium_registrations`
   - `symposium_pitch_submissions`  
   - `symposium_poster_submissions`

### 2c. Create Storage Bucket
1. In Supabase dashboard → **Storage** (left sidebar)
2. Click **"New bucket"**
3. Name it exactly: `symposium-uploads`
4. Toggle **"Public bucket"** ON
5. Click **"Create bucket"**

### 2d. Get Your API Keys
1. Go to **Settings** → **API** (left sidebar)
2. Copy these two values:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

### 2e. Update Your Code
1. Open `src/integrations/supabase/client.ts`
2. Replace the URL and key:
```ts
const SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co";
const SUPABASE_ANON_KEY = "eyJ...YOUR_ANON_KEY_HERE";
```
3. Save the file

### 2f. Email Notifications (Optional but Recommended)
1. Go to [resend.com](https://resend.com) → Sign up
2. Get your **API key** from Settings
3. In Supabase dashboard → **Settings** → **Edge Functions** → **Secrets**
4. Add secret: name = `RESEND_API_KEY`, value = your Resend key
5. Install Supabase CLI: `npm install -g supabase`
6. Login: `supabase login`
7. Deploy: `supabase functions deploy send-symposium-email --project-ref YOUR_PROJECT_ID`

---

## Step 3: Build for Production

Run this command in your project folder:
```bash
npm run build
```

This creates a `dist/` folder with all your optimized files ready for hosting.

---

## Step 4: Host on Hostinger

> ⚠️ **IMPORTANT**: Hostinger's built-in "Git Deployment" feature **does NOT work** for React/Vite apps.
> It only works for PHP projects (it looks for `composer.json`). If you see it saying "Looking for composer.lock file... not found", that's why.
> Use one of the two methods below instead.

### Method A: Automated Deploy via GitHub Actions (Recommended)
This is already set up! The file `.github/workflows/deploy.yml` automatically builds and deploys on every `git push`.

1. In Hostinger dashboard → **Hosting** → **FTP Accounts**
2. Note your FTP credentials:
   - **FTP Server** (hostname, e.g., `ftp.yourdomain.com` or from Hostinger panel)
   - **FTP Username**
   - **FTP Password**
3. In your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
4. Add these 3 secrets:
   - `FTP_SERVER` = your FTP hostname
   - `FTP_USERNAME` = your FTP username
   - `FTP_PASSWORD` = your FTP password
5. Now push your code:
```bash
git add .
git commit -m "Deploy site"
git push origin main
```
6. Go to your GitHub repo → **Actions** tab → watch the deploy run
7. Once green ✅, your site is live!

### Method B: Manual Upload (One-Time or Backup)
1. Run `npm run build` locally
2. Open Hostinger → **File Manager** → navigate to `public_html/`
3. **Delete everything** inside `public_html/`
4. Upload the **contents** of your `dist/` folder:
   - `index.html`
   - `assets/` folder
   - `.htaccess` (critical for SPA routing!)
5. Your site is live

### 4c. Connect Custom Domain (if needed)
1. In Hostinger → **Domains** → select your domain
2. Make sure DNS points to Hostinger's nameservers
3. Enable **SSL certificate** (free in Hostinger dashboard)

---

## Quick Checklist

- [ ] GitHub repo created and code pushed
- [ ] Supabase project created
- [ ] SQL migration run (3 tables created)
- [ ] Storage bucket `symposium-uploads` created
- [ ] Supabase URL + anon key updated in code
- [ ] `npm run build` succeeds
- [ ] `dist/` contents uploaded to Hostinger `public_html/`
- [ ] Website loads at your domain
- [ ] Registration form works (check Supabase Table Editor)
- [ ] SSL enabled on Hostinger

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Pages show 404 when refreshing | Make sure `.htaccess` is in `public_html/` |
| Forms don't save data | Check Supabase URL and anon key in `client.ts` |
| Images not loading | Clear browser cache, re-upload `assets/` folder |
| Build fails | Run `npm install` first, then `npm run build` |

---

## Step 5: Smooth Hosting Automation (CI/CD)

To automatically deploy from GitHub to Hostinger every time you push:
1. Make sure you pushed the `.github/workflows/deploy.yml` file created by Antigravity.
2. In your GitHub repository, go to **Settings** > **Secrets and variables** > **Actions**.
3. Click **New repository secret** and add:
   - `FTP_SERVER`: Your Hostinger FTP hostname (e.g., `ftp.yourdomain.com`)
   - `FTP_USERNAME`: Your Hostinger FTP username
   - `FTP_PASSWORD`: Your Hostinger FTP password
4. Now, every time you run `git push origin main`, GitHub Actions will automatically build your app and deploy it to Hostinger!

---

## Step 6: Antigravity Management & Migration

### Fixing the GitHub MCP Error
If you are getting `"Error: exec: "docker": executable file not found in %PATH%"` when adding the GitHub MCP:
This means the MCP is trying to run via Docker. You can fix this by changing the Antigravity MCP command to use Node instead of Docker:
Use the command: `npx -y @modelcontextprotocol/server-github`
Make sure you have Node.js installed, and this will run the GitHub MCP seamlessly without requiring Docker.

### Migrating to a New Laptop
To perfectly resume everything (conversations, artifacts, brain context) when you get your new laptop:
1. **Push your code**: Ensure your `irtiqa-main` folder is fully pushed to GitHub.
2. **Copy the Brain**: Copy the entire `C:\Users\Hasnain\.gemini\antigravity` folder from your old laptop to a USB drive.
3. **Paste on New Laptop**: Place that folder in the exact same location (`C:\Users\Hasnain\.gemini\antigravity`) on the new laptop.
4. **Clone Code**: Clone your GitHub repo to the exact same path (`C:\Users\Hasnain\Downloads\irtiqa-main`).
5. When you open Antigravity on the new laptop, it will automatically load all your previous context, knowledge items, and chat history.
