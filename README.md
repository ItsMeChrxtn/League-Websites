# Metroville League Website (Node.js + MongoDB)

This project is migrated from PHP/MySQL to Node.js serverless functions and MongoDB, ready for Vercel deployment.

## Stack
- Frontend: static HTML/CSS/JS
- Backend: Vercel Serverless Functions (`api/*.js`)
- Database: MongoDB

## Environment variables
- `MONGODB_URI` (optional for local testing, required for persistent cloud DB)
- `MONGODB_DB` (optional, default: `league_dashboard`)

If `MONGODB_URI` is not set, APIs automatically use local fallback data in [data/league-data.json](data/league-data.json).

## Local development
```bash
npm install
npx --yes vercel@latest dev --listen 3000
```

## Main API routes
- `GET /api/league-data`
- `GET|POST|PUT|DELETE /api/admin/schedule`
- `GET|POST|PUT|DELETE /api/admin/standing`
- `GET|POST|PUT|DELETE /api/admin/player`

## Deploy to Vercel
1. Push this project to GitHub.
2. Import the repo in Vercel.
3. Set `MONGODB_URI` and `MONGODB_DB` in Vercel project settings.
4. Deploy.

### Recommended production setup
- Set `MONGODB_URI` in Vercel (`Project Settings` → `Environment Variables`) so admin create/update/delete persists.
- Set `MONGODB_DB` (optional). Default is `league_dashboard`.
- Redeploy after adding or editing environment variables.

### Vercel CLI deploy (alternative)
```bash
npm install
npx --yes vercel@latest login
npx --yes vercel@latest
```

Then set env vars:
```bash
npx --yes vercel@latest env add MONGODB_URI production
npx --yes vercel@latest env add MONGODB_DB production
npx --yes vercel@latest --prod
```

### Quick post-deploy checks
- Open `/api/league-data` and verify you get `{ "ok": true, ... }`.
- Open `/admin/` and test add/edit/delete in each module.
- Confirm home pages load: `/`, `/game-schedule.html`, `/team-standing.html`, `/best-player.html`.
