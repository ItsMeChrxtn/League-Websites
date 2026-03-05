# Admin Dashboard Setup (Node.js + MongoDB)

## 1) Install dependencies
From project root, run:

```bash
npm install
```

## 2) Configure environment variables
Set these values in Vercel (or in local shell before running `vercel dev`):

- `MONGODB_URI`
- `MONGODB_DB` (optional, default: `league_dashboard`)

## 3) Run locally
From project root, run:

```bash
npm run dev
```

Open:
- Admin dashboard: `http://localhost:3000/admin/`
- Website home: `http://localhost:3000/index.html`

## Features included
- CRUD for Game Schedule (`/api/admin/schedule`)
- CRUD for Team Standing (`/api/admin/standing`)
- CRUD for Best Player (`/api/admin/player`)
- Public league data API (`/api/league-data`)

