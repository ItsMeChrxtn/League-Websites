const { MongoClient, ObjectId } = require("mongodb");

let cachedClient = null;
let cachedDb = null;
let cachedDbPromise = null;

function createClient(mongoUri) {
  return new MongoClient(mongoUri, {
    serverSelectionTimeoutMS: 3000,
    connectTimeoutMS: 5000,
    socketTimeoutMS: 10000,
    maxPoolSize: 10,
    tls: true,
    family: 4,
  });
}

async function getDb() {
  if (cachedDb) {
    return cachedDb;
  }

  if (cachedDbPromise) {
    return cachedDbPromise;
  }

  const mongoUri = process.env.MONGODB_URI;
  const databaseName = process.env.MONGODB_DB || "league_dashboard";

  if (!mongoUri) {
    throw new Error("Missing MONGODB_URI environment variable.");
  }

  if (!cachedClient) {
    cachedClient = createClient(mongoUri);
  }

  cachedDbPromise = (async () => {
    try {
      await cachedClient.connect();
      cachedDb = cachedClient.db(databaseName);
      return cachedDb;
    } catch (firstError) {
      cachedClient = createClient(mongoUri);
      await cachedClient.connect();
      cachedDb = cachedClient.db(databaseName);
      return cachedDb;
    }
  })();

  try {
    return await cachedDbPromise;
  } catch (error) {
    cachedDbPromise = null;
    throw error;
  }
}

function toObjectId(id) {
  if (!id || typeof id !== "string") {
    return null;
  }

  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

module.exports = {
  getDb,
  toObjectId,
  ObjectId,
};
