# Basketball League Website (Express + MongoDB)

This project uses a static HTML + Tailwind frontend with a Node.js + Express REST API backend and MongoDB via Mongoose.

## Backend structure
- `server.js`
- `config/db.js`
- `models/`
- `controllers/`
- `routes/`
- `middleware/`

## Environment variables
- `PORT` (required in production, optional locally)
- `MONGO_URI` (required)
- `JWT_SECRET` (required for secure admin login)
- `ADMIN_USERNAME` (admin username)
- `ADMIN_PASSWORD` (admin password)

Example `.env`:

```bash
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/league_dashboard?retryWrites=true&w=majority
JWT_SECRET=change-this-secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
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
- `POST /api/teams` (admin token required)
- `PUT /api/teams/:id` (admin token required)
- `DELETE /api/teams/:id` (admin token required)

Fields:
- `name`
- `logo`
- `wins`
- `losses`
- `points`

### Schedule
- `GET /api/schedule`
- `GET /api/schedule/:id`
- `POST /api/schedule` (admin token required)
- `PUT /api/schedule/:id` (admin token required)
- `DELETE /api/schedule/:id` (admin token required)

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
- `POST /api/players` (admin token required)
- `PUT /api/players/:id` (admin token required)
- `DELETE /api/players/:id` (admin token required)

### Admin Auth
- `POST /api/auth/login`

Request body:

```json
{
	"username": "admin",
	"password": "admin123"
}
```

Use returned token as `Authorization: Bearer <token>` for write operations.

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

## Admin Dashboard

- URL: `/admin/index.html`
- Features:
	- Admin login
	- Sidebar navigation (`Team Standing`, `Game Schedule`, `Best Player`)
	- Full CRUD for each section

Set API URL in login form as your Render backend API URL:

`https://your-service-name.onrender.com/api`

Default local login values if env vars are not set:

- Username: `admin`
- Password: `admin123`

## Public Site Dynamic Data

Public pages now load from API when `client-config.js` has a valid value. If no API is set or API fails, static sample data is used as fallback.

Set in `client-config.js`:

```js
window.LEAGUE_API_BASE_URL = "https://your-service-name.onrender.com/api";
```

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
