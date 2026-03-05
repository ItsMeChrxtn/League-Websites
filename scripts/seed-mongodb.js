const { MongoClient } = require("mongodb");

const mongoUri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB || "league_dashboard";

if (!mongoUri) {
  console.error("Missing MONGODB_URI. Set it before running seed.");
  process.exit(1);
}

const now = new Date();

const scheduleSeed = [
  {
    game_date: "2026-03-08",
    game_time: "18:30",
    venue: "Downtown Arena",
    home_team: "Falcons",
    away_team: "Titans",
    created_at: now,
    updated_at: now,
  },
  {
    game_date: "2026-03-09",
    game_time: "19:00",
    venue: "Metro Sports Hub",
    home_team: "Sharks",
    away_team: "Wolves",
    created_at: now,
    updated_at: now,
  },
  {
    game_date: "2026-03-10",
    game_time: "20:00",
    venue: "Riverside Court",
    home_team: "Hawks",
    away_team: "Kings",
    created_at: now,
    updated_at: now,
  },
];

const standingsSeed = [
  { team: "Falcons", wins: 7, losses: 2, created_at: now, updated_at: now },
  { team: "Titans", wins: 6, losses: 3, created_at: now, updated_at: now },
  { team: "Wolves", wins: 5, losses: 4, created_at: now, updated_at: now },
  { team: "Sharks", wins: 4, losses: 5, created_at: now, updated_at: now },
];

const bestPlayersSeed = [
  {
    player_name: "J. Ramirez",
    team: "Falcons",
    points: 31,
    assists: 8,
    rebounds: 9,
    steals: 2,
    image_path: "assets/players/sample-player-1.png",
    game_date: "2026-03-01",
    created_at: now,
    updated_at: now,
  },
  {
    player_name: "M. Santos",
    team: "Titans",
    points: 28,
    assists: 6,
    rebounds: 10,
    steals: 1,
    image_path: "assets/players/sample-player-2.png",
    game_date: "2026-03-02",
    created_at: now,
    updated_at: now,
  },
  {
    player_name: "K. Dela Cruz",
    team: "Wolves",
    points: 25,
    assists: 9,
    rebounds: 7,
    steals: 3,
    image_path: "assets/players/sample-player-3.png",
    game_date: "2026-03-03",
    created_at: now,
    updated_at: now,
  },
];

const teamLogosSeed = [
  { team: "Falcons", logo_path: "assets/logos/eldelubyo.png", updated_at: now },
  { team: "Titans", logo_path: "assets/logos/homecourt.jpg", updated_at: now },
  { team: "Sharks", logo_path: "assets/logos/micara.png", updated_at: now },
  { team: "Wolves", logo_path: "assets/logos/MTRVL.jpg", updated_at: now },
  { team: "Hawks", logo_path: "assets/logos/segway.jpg", updated_at: now },
  { team: "Kings", logo_path: "assets/logos/Stampede.jpg", updated_at: now },
  { team: "Stampede", logo_path: "assets/logos/Stampede.jpg", updated_at: now },
  { team: "Westdale", logo_path: "assets/logos/westdale.jpg", updated_at: now },
];

async function resetCollection(db, name, docs) {
  await db.collection(name).deleteMany({});
  if (docs.length) {
    await db.collection(name).insertMany(docs);
  }
}

async function run() {
  const client = new MongoClient(mongoUri, {
    serverSelectionTimeoutMS: 7000,
    connectTimeoutMS: 7000,
    socketTimeoutMS: 15000,
  });

  try {
    await client.connect();
    const db = client.db(databaseName);

    await resetCollection(db, "game_schedules", scheduleSeed);
    await resetCollection(db, "team_standings", standingsSeed);
    await resetCollection(db, "best_players", bestPlayersSeed);
    await resetCollection(db, "team_logos", teamLogosSeed);

    console.log(`Seed completed for database: ${databaseName}`);
  } finally {
    await client.close();
  }
}

run().catch((error) => {
  console.error("Seed failed:", error.message || error);
  process.exit(1);
});
