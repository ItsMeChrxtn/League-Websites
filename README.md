# Basketball League Website (Express + MongoDB)

This project uses a static HTML + Tailwind frontend with a Node.js + Express REST API backend and MongoDB via Mongoose.

## Backend structure
- `server.js`
- `config/db.js`
- `models/`
- `controllers/`
- `routes/`

## Environment variables
- `PORT` (required in production, optional locally)
- `MONGO_URI` (required)

Example `.env`:

```bash
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/league_dashboard?retryWrites=true&w=majority
```

## Install and run

```bash
npm install
npm run dev
```

Production run:

```bash
npm start
```

## REST API

### Teams
- `GET /api/teams`
- `GET /api/teams/:id`
- `POST /api/teams`
- `PUT /api/teams/:id`
- `DELETE /api/teams/:id`

Fields:
- `name`
- `logo`
- `wins`
- `losses`
- `points`

### Schedule
- `GET /api/schedule`
- `GET /api/schedule/:id`
- `POST /api/schedule`
- `PUT /api/schedule/:id`
- `DELETE /api/schedule/:id`

Fields:
- `team1`
- `team2`
- `date`
- `time`
- `venue`
- `status`

### Best Players
- `GET /api/players`
- `GET /api/players/:id`
- `POST /api/players`
- `PUT /api/players/:id`
- `DELETE /api/players/:id`

Fields:
- `playerName`
- `team`
- `points`
- `rebounds`
- `assists`
- `gameDate`
- `playerImage`

## Frontend fetch examples

See `frontend-api-examples.js` for sample calls using `fetch()` + SweetAlert2 for add, update, and delete confirmation flows.

## Deploy on Render

1. Push this repository to GitHub.
2. Create a new **Web Service** in Render.
3. Configure:
	- Build command: `npm install`
	- Start command: `npm start`
4. Add environment variables in Render:
	- `PORT` = `10000` (or leave Render default)
	- `MONGO_URI` = your MongoDB connection string
5. Deploy.

After deployment, use your Render URL as frontend API base URL, for example:

`https://your-app-name.onrender.com/api`
