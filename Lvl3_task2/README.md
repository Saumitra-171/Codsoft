# 🚀 ProjectFlow — Full-Stack Project Management Tool

A modern project management application with Kanban boards, task tracking, team collaboration, and deadline management.

**Stack:** React · Node.js/Express · PostgreSQL (Neon) · JWT Auth

---

## ✨ Features

- 📁 **Projects** — Create/manage projects with color labels & deadlines
- 📋 **Kanban Board** — Drag-and-drop tasks across To Do → In Progress → Review → Done
- 👥 **Team Members** — Invite teammates by email
- ✅ **Task Management** — Title, description, priority, assignee, deadline
- 💬 **Comments** — Discuss tasks with team
- 📊 **Progress Tracking** — Visual progress bars & stats
- 🔒 **Auth** — Secure JWT-based login/register
- 📅 **My Tasks** — Personalized task view filtered by status

---

## 🗂 Project Structure

```
projectflow/
├── backend/                  # Node.js + Express API
│   ├── db/index.js           # Neon PostgreSQL connection + schema
│   ├── middleware/auth.js    # JWT middleware
│   ├── routes/
│   │   ├── auth.js           # Register, Login, Me
│   │   ├── projects.js       # CRUD + members + stats
│   │   └── tasks.js          # CRUD + comments + my tasks
│   ├── server.js             # Express app entry point
│   ├── .env.example          # Environment variables template
│   └── package.json
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── context/AuthContext.js
│   │   ├── utils/api.js      # Axios client
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js  # Project grid + stats
│   │   │   ├── ProjectBoard.js # Kanban + members + comments
│   │   │   └── MyTasks.js    # Personal task view
│   │   ├── components/Layout.js # Sidebar + nav
│   │   └── styles/globals.css
│   └── package.json
├── .gitlab-ci.yml            # GitLab CI/CD pipeline
├── netlify.toml              # Netlify deployment config
└── README.md
```

---

## ⚡ Quick Start (Local)

### 1. Clone from GitLab

```bash
git clone https://gitlab.com/YOUR_USERNAME/projectflow.git
cd projectflow
```

### 2. Set up Neon Database

1. Go to [neon.tech](https://neon.tech) → Create a free account
2. Create a new project named `projectflow`
3. Copy the **Connection String** (it looks like `postgresql://user:pass@ep-xxx.neon.tech/neondb`)

### 3. Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your_random_secret_here_make_it_long
PORT=5000
FRONTEND_URL=http://localhost:3000
```

```bash
npm install
npm run dev
# API running at http://localhost:5000
```

### 4. Configure Frontend

```bash
cd ../frontend
# Create .env.local
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env.local
npm install
npm start
# App running at http://localhost:3000
```

---

## 🌐 Deployment

### Backend → Railway (Free tier)

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitLab
2. Select the `backend/` folder (or set root dir)
3. Add environment variables:
   - `DATABASE_URL` → your Neon connection string
   - `JWT_SECRET` → your secret key
   - `FRONTEND_URL` → your Netlify URL
4. Railway auto-detects Node.js and deploys

### Frontend → Netlify (Free tier)

1. Go to [netlify.com](https://netlify.com) → Add new site → Import from GitLab
2. Build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/build`
3. Environment variables:
   - `REACT_APP_API_URL` → `https://your-app.railway.app/api`
4. Deploy!

### GitLab CI/CD Setup

1. In GitLab: Settings → CI/CD → Variables
2. Add:
   - `NETLIFY_AUTH_TOKEN` → from Netlify user settings
   - `NETLIFY_SITE_ID` → from Netlify site settings
   - `NETLIFY_SITE_URL` → your Netlify URL

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Get current user |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project + members |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| POST | `/api/projects/:id/members` | Add member by email |
| GET | `/api/projects/:id/stats` | Task stats |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks/project/:id` | Tasks for project |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| POST | `/api/tasks/:id/comments` | Add comment |
| GET | `/api/tasks/my/assigned` | My assigned tasks |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6 |
| Styling | Custom CSS (Space Mono + Syne fonts) |
| Backend | Node.js 18, Express 4 |
| Database | PostgreSQL via Neon (serverless) |
| Auth | JWT + bcrypt |
| Hosting (FE) | Netlify |
| Hosting (BE) | Railway |
| CI/CD | GitLab CI |

---

## 📝 GitLab Setup

```bash
# Initialize and push to GitLab
git init
git add .
git commit -m "feat: initial ProjectFlow implementation"
git remote add origin https://gitlab.com/YOUR_USERNAME/projectflow.git
git push -u origin main
```

---

## 🔒 Security Notes

- Never commit `.env` files (they are gitignored)
- Use strong random strings for `JWT_SECRET`
- Neon SSL is enforced (`?sslmode=require`)
- Passwords are hashed with bcrypt (10 rounds)
