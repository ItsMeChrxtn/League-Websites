# Metroville League Website (Node.js + MongoDB)

This project is migrated from PHP/MySQL to Node.js serverless functions and MongoDB, ready for Vercel deployment.

## Stack
- Frontend: static HTML/CSS/JS
- Backend: Vercel Serverless Functions (`api/*.js`)
- Database: MongoDB

## Environment variables
- `MONGODB_URI` (required)
- `MONGODB_DB` (optional, default: `league_dashboard`)

This project is now configured in **database-only mode**. All website and admin data comes from MongoDB.

## Local development
```bash
npm install
npx --yes vercel@latest dev --listen 3000
```

## Seed initial database data
```bash
$env:MONGODB_URI="your-mongodb-uri"
$env:MONGODB_DB="league_dashboard"
npm run seed:db
```

The seed command resets and re-inserts data for these collections:
- `game_schedules`
- `team_standings`
- `best_players`
- `team_logos`

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
- Set `MONGODB_URI` in Vercel (`Project Settings` → `Environment Variables`).
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

### If MongoDB TLS error appears in Vercel
- In MongoDB Atlas, go to `Network Access` and temporarily allow `0.0.0.0/0`.
- Verify your `MONGODB_URI` uses the Atlas Driver URI format (`mongodb+srv://...`).
- If your DB password has special chars (`@`, `#`, `%`, `/`, `?`, `:`), URL-encode it.
- Redeploy after updating env vars.
