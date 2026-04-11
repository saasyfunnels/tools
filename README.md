# SaaSy Funnels — Design & Construct Tools
## Deployment Guide

---

### What's in this project

A React app containing the Design & Construct dashboard and all AI-powered planning tools.

Routes:
- `/` — Dashboard (tool selector)
- `/ghl-page-builder` — GHL Page Builder (live)
- `/kajabi-page-builder` — Kajabi Page Builder (live)
- `/ghl-workflow-builder` — GHL Workflow Builder (placeholder, ready to add)
- `/kajabi-automation-builder` — Kajabi Automation Builder (placeholder, ready to add)

---

### Step 1 — Add your Anthropic API key to Vercel

Before deploying, you need to add your API key as an environment variable.

1. Go to vercel.com and create a new project
2. When prompted for environment variables, add:
   - Key: `VITE_ANTHROPIC_API_KEY`
   - Value: your Anthropic API key (starts with sk-ant-)
3. This key is used by the Page Builder tools to call Claude

---

### Step 2 — Deploy to Vercel

Option A — Via GitHub (recommended):
1. Push this folder to a GitHub repository
2. Go to vercel.com → New Project → Import your repo
3. Framework: Vite (auto-detected)
4. Add the environment variable above
5. Click Deploy

Option B — Via Vercel CLI:
```
npm install -g vercel
cd saasyfunnels-tools
vercel
```

---

### Step 3 — Connect your domain

To have the tools at saasyfunnels.com/tools:

Option A — Subdomain (simplest):
Point tools.saasyfunnels.com to Vercel in your DNS settings.
Vercel will handle the SSL cert automatically.

Option B — Subfolder on root domain:
If your main site is on another platform (Kajabi, GHL etc),
use a reverse proxy. In your DNS/CDN provider (Cloudflare recommended):

Add a Page Rule or Transform Rule:
- URL matches: saasyfunnels.com/tools/*
- Forward to: your-vercel-app.vercel.app/*

This lets your main domain stay on Kajabi/GHL while /tools
routes to Vercel. Cloudflare's free plan supports this.

---

### Step 4 — Update the API key reference in the tools

The Page Builder tools currently use the Anthropic API directly
from the browser (for development). For production, the API key
is already read from the environment variable VITE_ANTHROPIC_API_KEY.

Search both tool files for `process.env` or `import.meta.env`
to confirm the key is wired correctly before going live.

---

### Adding the Workflow Builder tools

When ready to add the real Workflow Builder and Automation Builder:

1. Replace the placeholder content in:
   - src/pages/GHLWorkflowBuilder.jsx
   - src/pages/KajabiAutomationBuilder.jsx

2. Add the same `import { useNavigate } from 'react-router-dom'`
   and `const navigate = useNavigate()` pattern

3. Add `onBack={() => navigate('/')}` to the TopNav in each tool

4. Redeploy — Vercel picks up changes automatically on git push

---

### Local development

```
npm install
npm run dev
```

Opens at http://localhost:5173
