# ProjectFlow — Hosting Guide
## Frontend: Netlify | Backend: Render | Database: Neon

---

## STEP 1 — Set Up Neon Database (2 min)

1. Go to https://neon.tech → Sign up free
2. Click **New Project** → name it `projectflow` → Create
3. On the dashboard, click **Connection string** tab
4. Copy the full string — looks like:
   `postgresql://alex:password@ep-cool-fog.us-east-2.aws.neon.tech/neondb?sslmode=require`
5. **Save this** — you'll need it in Step 2

---

## STEP 2 — Deploy Backend on Render (5 min)

Render gives you a free Node.js server.

1. Go to https://render.com → Sign up with GitHub
2. Click **New +** → **Web Service**
3. Choose **"Deploy an existing repository"**  
   — OR — click **"Public Git repository"** and paste a GitHub repo URL  
   *(first push your source code to a GitHub repo — see Step 2a below)*

### Step 2a — Push backend to GitHub
```bash
# From inside the projectflow/ folder:
cd backend
git init
git add .
git commit -m "ProjectFlow backend"
# Create a repo at github.com/new, then:
git remote add origin https://github.com/YOUR_USERNAME/projectflow-backend.git
git push -u origin main
```

### Step 2b — Configure on Render
- **Name:** `projectflow-api`
- **Root Directory:** *(leave blank — repo root is the backend folder)*
- **Runtime:** Node
- **Build Command:** `npm install`
- **Start Command:** `node server.js`

### Step 2c — Add Environment Variables on Render
Click **Environment** → add these:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | your Neon connection string from Step 1 |
| `JWT_SECRET` | any long random string e.g. `xK9#mP2$qL8nR5vT` |
| `FRONTEND_URL` | `https://projectflow.netlify.app` *(update after Step 3)* |
| `PORT` | `5000` |

4. Click **Create Web Service** → wait ~2 min for deploy
5. Your backend URL will be: `https://projectflow-api.onrender.com`
   (copy this for Step 3)

---

## STEP 3 — Deploy Frontend on Netlify (3 min)

### Option A — Drag & Drop (Easiest, no account needed)

1. Go to https://app.netlify.com/drop
2. **Drag the `projectflow-netlify-deploy.zip` file** onto the page
3. Netlify instantly deploys and gives you a URL like `https://amazing-name-123.netlify.app`
4. **Update the API URL** (see Step 3c)

### Option B — Connect GitHub (Recommended for auto-deploys)

1. Push frontend to GitHub:
```bash
cd frontend
git init && git add . && git commit -m "ProjectFlow frontend"
git remote add origin https://github.com/YOUR_USERNAME/projectflow-frontend.git
git push -u origin main
```

2. Go to https://netlify.com → **Add new site** → **Import from Git**
3. Choose GitHub → select your repo
4. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `build`
5. Add environment variable:
   - `REACT_APP_API_URL` = `https://projectflow-api.onrender.com/api`
6. Click **Deploy site**

### Step 3c — Update the API URL in your live site

After deploying on Netlify:
- Go to **Site settings** → **Environment variables**
- Add: `REACT_APP_API_URL` = `https://YOUR-APP.onrender.com/api`
- Go to **Deploys** → click **Trigger deploy** → **Deploy site**

---

## STEP 4 — Update CORS on Backend

Once you know your Netlify URL, go back to Render:
- **Environment** → update `FRONTEND_URL` to your Netlify URL
- Render auto-restarts

---

## ✅ Done! Your app is live at your Netlify URL.

Default test flow:
1. Visit your Netlify URL
2. Click **Create Account** → register
3. Create a project → add tasks → drag them across the board

---

## Troubleshooting

**"Network Error" on login** → Backend not running yet (Render free tier sleeps after 15min inactivity — first request takes ~30s to wake up)

**"CORS error"** → Make sure `FRONTEND_URL` on Render matches your Netlify URL exactly

**Tasks not loading** → Check that `REACT_APP_API_URL` ends with `/api` (e.g. `https://xxx.onrender.com/api`)

---

## Alternative: GitHub Pages (Frontend only, static)

GitHub Pages only hosts static files — works for the frontend but you still need Render for the backend.

```bash
cd frontend
npm install gh-pages --save-dev
# Add to package.json scripts:
#   "predeploy": "npm run build",
#   "deploy": "gh-pages -d build"
# Add homepage to package.json:
#   "homepage": "https://YOUR_USERNAME.github.io/projectflow"
npm run deploy
```
