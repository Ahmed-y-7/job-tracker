# JobTrack — Job Application Tracker

A full-stack app to track job applications through a Kanban board: organize
applications by stage, manage companies, attach resumes, take notes, set
interview reminders, and view stats.

## Tech stack

- **Frontend:** Vue 3 + Vite, Tailwind CSS v4, Vue Router, Pinia, axios, Chart.js
- **Backend:** Node + Express (JavaScript, ES modules)
- **Database:** PostgreSQL
- **Auth:** JWT tokens with bcrypt-hashed passwords
- **Uploads:** multer (resume files)

## Features

- Sign up / log in (JWT auth, per-user data)
- Kanban board with five stages (wishlist → applied → interview → offer → rejected) and drag-and-drop
- Add / edit / delete applications; search by role or company
- Company management (name, website, notes)
- Per-application detail panel: notes, interview reminders, resume upload
- Dashboard with summary stats and an applications-by-status chart

## Project structure

```
job-tracker/
├── client/                 # Vue 3 frontend
│   └── src/
│       ├── api.js          # axios instance (auto-attaches JWT)
│       ├── stores/auth.js  # Pinia auth store
│       ├── router/         # routes + auth guard
│       ├── components/     # AppLayout, ApplicationDetail
│       └── pages/          # Login, Signup, Board, Dashboard, Companies
└── server/                 # Express API (JavaScript, ESM)
    ├── db/schema.sql       # database schema
    └── src/
        ├── db.js           # PostgreSQL pool
        ├── middleware/     # requireAuth (JWT)
        └── routes/         # auth, companies, applications, notes, reminders, upload
```

## Setup

### 1. Database

```sql
CREATE DATABASE job_tracker;
\c job_tracker
\i server/db/schema.sql
```

### 2. Backend

```bash
cd server
npm install
# create server/.env:
#   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/job_tracker
#   PORT=4000
#   JWT_SECRET=some_long_random_string
npm run dev          # http://localhost:4000
```

### 3. Frontend

```bash
cd client
npm install
npm run dev          # http://localhost:5173
```

Vite proxies `/api` and `/uploads` to the backend on port 4000.

## API overview

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/auth/signup` · `/login` | Auth, returns a token |
| GET | `/api/me` | Current user |
| CRUD | `/api/companies` | Manage companies |
| CRUD | `/api/applications` | Manage applications; `PATCH /:id/move` changes status |
| GET/POST/DELETE | `/api/notes` | Notes per application |
| GET/POST/PATCH/DELETE | `/api/reminders` | Interview reminders |
| POST | `/api/applications/:id/resume` | Upload a resume (multipart) |

All data routes require an `Authorization: Bearer <token>` header and are scoped to the logged-in user.
