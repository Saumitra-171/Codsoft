#  ProjectFlow — Full-Stack Project Management Tool

A modern project management application built with React, Node.js, and PostgreSQL (Neon). Features Kanban boards, task tracking, team collaboration, and deadline management.

**Live Demo:** https://lambent-biscochitos-9bab6d.netlify.app  
**GitHub Repo:** https://github.com/Saumitra-171/Codsoft

---

##  Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6 |
| Styling | Custom CSS (Space Mono + Syne fonts) |
| Backend | Node.js 18, Express 4 |
| Database | PostgreSQL via Neon (serverless) |
| Auth | JWT + bcrypt |
| Frontend Hosting | Netlify |
| Backend Hosting | Render |

---

##  Features

-  **Projects** — Create and manage projects with color labels and deadlines
-  **Kanban Board** — Drag and drop tasks across To Do → In Progress → Review → Done
-  **Team Members** — Invite teammates by email
-  **Task Management** — Set title, description, priority, assignee, and deadline
-  **Comments** — Discuss tasks with your team
-  **Progress Tracking** — Visual progress bars and stats dashboard
-  **Authentication** — Secure JWT-based login and register
-  **My Tasks** — Personalized task view filtered by status

---

##  Folder Structure

```
Lvl3_task2/
├── .gitignore
├── netlify.toml                      # Netlify deploy config
├── package.json                      # Root scripts
├── README.md
│
├── backend/
│   ├── server.js                     # Express app entry point
│   ├── package.json
│   ├── Procfile                      # For Render deployment
│   ├── .env.example                  # Environment variables template
│   │
│   ├── db/
│   │   └── index.js                  # Neon PostgreSQL connection + schema
│   │
│   ├── middleware/
│   │   └── auth.js                   # JWT verification middleware
│   │
│   └── routes/
│       ├── auth.js                   # Register, Login, Me
│       ├── projects.js               # CRUD + members + stats
│       └── tasks.js                  # CRUD + comments + my tasks
│
└── frontend/
    ├── package.json
    │
    ├── public/
    │   └── index.html
    │
    └── src/
        ├── App.js                    # Routes + auth guards
        ├── index.js                  # React entry point
        │
        ├── context/
        │   └── AuthContext.js        # Global auth state
        │
        ├── components/
        │   └── Layout.js             # Sidebar + navigation
        │
        ├── pages/
        │   ├── Login.js
        │   ├── Register.js
        │   ├── Dashboard.js          # Project grid + stats
        │   ├── ProjectBoard.js       # Kanban board + comments
        │   └── MyTasks.js            # Personal task view
        │
        ├── utils/
        │   └── api.js                # Axios client + all API calls
        │
        └── styles/
            └── globals.css           # Full design system
```

---

##  Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/Saumitra-171/Codsoft.git
cd Codsoft/Lvl3_task2
```

### 2. Set up Neon Database

1. Go to https://neon.tech → Sign up free
2. Create a new project named `L3_task2`
3. Copy the connection string:
   ```
   postgresql://user:pass@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

### 3. Run the Backend

```bash
cd backend
cp .env.example .env
```

Fill in `.env`:
```env
DATABASE_URL=your_neon_connection_string
JWT_SECRET=your_random_secret_key
PORT=5000
FRONTEND_URL=http://localhost:3000
```

```bash
npm install
npm run dev
# API running at http://localhost:5000
```

### 4. Run the Frontend

```bash
cd ../frontend
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env.local
npm install
npm start
# App running at http://localhost:3000
```

---

##  Deployment

### Backend → Render (Free)

| Setting | Value |
|---------|-------|
| Root Directory | `Lvl3_task2/backend` |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `node server.js` |

Environment variables to add on Render:
| Key | Value |
|-----|-------|
| `DATABASE_URL` | Neon connection string |
| `JWT_SECRET` | your secret key |
| `PORT` | `5000` |
| `FRONTEND_URL` | your Netlify URL |

### Frontend → Netlify (Free)

| Setting | Value |
|---------|-------|
| Base directory | `Lvl3_task2/frontend` |
| Build command | `npm run build` |
| Publish directory | `Lvl3_task2/frontend/build` |

Environment variable to add on Netlify:
| Key | Value |
|-----|-------|
| `REACT_APP_API_URL` | `https://your-render-app.onrender.com/api` |

---

##  API Reference

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

##  Security

- `.env` files are gitignored — never committed
- Passwords hashed with bcrypt (10 rounds)
- JWT tokens expire after 7 days
- Neon SSL enforced via `?sslmode=require`
- CORS restricted to frontend URL only
