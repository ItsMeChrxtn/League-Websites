const fs = require("fs/promises");
const path = require("path");
const { ObjectId } = require("mongodb");
const { getDb } = require("./mongo");

const IS_VERCEL_RUNTIME = process.env.VERCEL === "1" || Boolean(process.env.VERCEL_URL);
const DATA_FILE_PATH = IS_VERCEL_RUNTIME
  ? path.join("/tmp", "league-data.json")
  : path.join(process.cwd(), "data", "league-data.json");

const defaultLocalData = {
  counters: {
    game_schedules: 3,
    team_standings: 4,
    best_players: 3,
    team_logos: 8,
  },
  game_schedules: [
    {
      id: "local_1",
      game_date: "2026-03-08",
      game_time: "18:30",
      venue: "Downtown Arena",
      home_team: "Falcons",
      away_team: "Titans",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "local_2",
      game_date: "2026-03-09",
      game_time: "19:00",
      venue: "Metro Sports Hub",
      home_team: "Sharks",
      away_team: "Wolves",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "local_3",
      game_date: "2026-03-10",
      game_time: "20:00",
      venue: "Riverside Court",
      home_team: "Hawks",
      away_team: "Kings",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  team_standings: [
    { id: "local_1", team: "Falcons", wins: 7, losses: 2, updated_at: new Date().toISOString() },
    { id: "local_2", team: "Titans", wins: 6, losses: 3, updated_at: new Date().toISOString() },
    { id: "local_3", team: "Wolves", wins: 5, losses: 4, updated_at: new Date().toISOString() },
    { id: "local_4", team: "Sharks", wins: 4, losses: 5, updated_at: new Date().toISOString() },
  ],
  best_players: [
    {
      id: "local_1",
      player_name: "J. Ramirez",
      team: "Falcons",
      points: 31,
      assists: 8,
      rebounds: 9,
      steals: 2,
      image_path: "assets/players/sample-player-1.png",
      game_date: "2026-03-01",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "local_2",
      player_name: "M. Santos",
      team: "Titans",
      points: 28,
      assists: 6,
      rebounds: 10,
      steals: 1,
      image_path: "assets/players/sample-player-2.png",
      game_date: "2026-03-02",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "local_3",
      player_name: "K. Dela Cruz",
      team: "Wolves",
      points: 25,
      assists: 9,
      rebounds: 7,
      steals: 3,
      image_path: "assets/players/sample-player-3.png",
      game_date: "2026-03-03",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  team_logos: [
    { id: "local_1", team: "Falcons", logo_path: "assets/logos/eldelubyo.png", updated_at: new Date().toISOString() },
    { id: "local_2", team: "Titans", logo_path: "assets/logos/homecourt.jpg", updated_at: new Date().toISOString() },
    { id: "local_3", team: "Sharks", logo_path: "assets/logos/micara.png", updated_at: new Date().toISOString() },
    { id: "local_4", team: "Wolves", logo_path: "assets/logos/MTRVL.jpg", updated_at: new Date().toISOString() },
    { id: "local_5", team: "Hawks", logo_path: "assets/logos/segway.jpg", updated_at: new Date().toISOString() },
    { id: "local_6", team: "Kings", logo_path: "assets/logos/Stampede.jpg", updated_at: new Date().toISOString() },
    { id: "local_7", team: "Stampede", logo_path: "assets/logos/Stampede.jpg", updated_at: new Date().toISOString() },
    { id: "local_8", team: "Westdale", logo_path: "assets/logos/westdale.jpg", updated_at: new Date().toISOString() }
  ]
};

function isMongoEnabled() {
  return Boolean(process.env.MONGODB_URI);
}

async function tryMongo(operationName, action) {
  try {
    const db = await getDb();
    const result = await action(db);
    return { ok: true, result };
  } catch (error) {
    console.error(`[storage] MongoDB ${operationName} failed, using local fallback:`, error?.message || error);
    return { ok: false, error };
  }
}

async function ensureLocalFile() {
  try {
    await fs.access(DATA_FILE_PATH);
  } catch {
    await fs.mkdir(path.dirname(DATA_FILE_PATH), { recursive: true });
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(defaultLocalData, null, 2), "utf8");
  }
}

async function readLocalData() {
  await ensureLocalFile();
  const raw = await fs.readFile(DATA_FILE_PATH, "utf8");
  return JSON.parse(raw);
}

async function writeLocalData(content) {
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(content, null, 2), "utf8");
}

function toMongoSort(sort) {
  return sort || { _id: 1 };
}

async function listRecords(collectionName, sort) {
  if (isMongoEnabled()) {
    const mongoResult = await tryMongo("listRecords", async (db) => {
      const rows = await db.collection(collectionName).find({}).sort(toMongoSort(sort)).toArray();
      return rows.map(({ _id, ...rest }) => ({ id: _id.toString(), ...rest }));
    });

    if (mongoResult.ok) {
      return mongoResult.result;
    }
  }

  const data = await readLocalData();
  const rows = Array.isArray(data[collectionName]) ? [...data[collectionName]] : [];
  if (typeof sort === "function") {
    rows.sort(sort);
  }
  return rows;
}

async function createRecord(collectionName, payload) {
  if (isMongoEnabled()) {
    const mongoResult = await tryMongo("createRecord", async (db) => {
      const result = await db.collection(collectionName).insertOne(payload);
      return { id: result.insertedId.toString(), ...payload };
    });

    if (mongoResult.ok) {
      return mongoResult.result;
    }
  }

  const data = await readLocalData();
  const nextCounter = (Number(data.counters?.[collectionName]) || 0) + 1;
  if (!data.counters) data.counters = {};
  data.counters[collectionName] = nextCounter;

  const record = { id: `local_${nextCounter}`, ...payload };
  if (!Array.isArray(data[collectionName])) data[collectionName] = [];
  data[collectionName].push(record);
  await writeLocalData(data);
  return record;
}

function isValidId(id) {
  if (!id || typeof id !== "string") {
    return false;
  }

  if (id.startsWith("local_")) {
    return true;
  }

  if (!isMongoEnabled()) {
    return true;
  }

  return ObjectId.isValid(id);
}

async function updateRecord(collectionName, id, payload) {
  if (!isValidId(id)) {
    return { ok: false, reason: "invalid-id" };
  }

  if (isMongoEnabled() && ObjectId.isValid(id)) {
    const mongoResult = await tryMongo("updateRecord", async (db) => {
      const result = await db.collection(collectionName).updateOne({ _id: new ObjectId(id) }, { $set: payload });
      return { ok: result.matchedCount > 0, reason: result.matchedCount > 0 ? "updated" : "not-found" };
    });

    if (mongoResult.ok) {
      return mongoResult.result;
    }
  }

  const data = await readLocalData();
  if (!Array.isArray(data[collectionName])) {
    return { ok: false, reason: "not-found" };
  }

  const index = data[collectionName].findIndex((row) => row.id === id);
  if (index < 0) {
    return { ok: false, reason: "not-found" };
  }

  data[collectionName][index] = { ...data[collectionName][index], ...payload };
  await writeLocalData(data);
  return { ok: true, reason: "updated" };
}

async function deleteRecord(collectionName, id) {
  if (!isValidId(id)) {
    return { ok: false, reason: "invalid-id" };
  }

  if (isMongoEnabled() && ObjectId.isValid(id)) {
    const mongoResult = await tryMongo("deleteRecord", async (db) => {
      const result = await db.collection(collectionName).deleteOne({ _id: new ObjectId(id) });
      return { ok: result.deletedCount > 0, reason: result.deletedCount > 0 ? "deleted" : "not-found" };
    });

    if (mongoResult.ok) {
      return mongoResult.result;
    }
  }

  const data = await readLocalData();
  if (!Array.isArray(data[collectionName])) {
    return { ok: false, reason: "not-found" };
  }

  const initialLength = data[collectionName].length;
  data[collectionName] = data[collectionName].filter((row) => row.id !== id);
  if (data[collectionName].length === initialLength) {
    return { ok: false, reason: "not-found" };
  }

  await writeLocalData(data);
  return { ok: true, reason: "deleted" };
}

module.exports = {
  isMongoEnabled,
  listRecords,
  createRecord,
  updateRecord,
  deleteRecord,
  isValidId,
};
