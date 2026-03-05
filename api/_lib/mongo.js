const { MongoClient, ObjectId } = require("mongodb");

let cachedClient = null;
let cachedDb = null;

async function getDb() {
  if (cachedDb) {
    return cachedDb;
  }

  const mongoUri = process.env.MONGODB_URI;
  const databaseName = process.env.MONGODB_DB || "league_dashboard";

  if (!mongoUri) {
    throw new Error("Missing MONGODB_URI environment variable.");
  }

  if (!cachedClient) {
    cachedClient = new MongoClient(mongoUri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 10000,
      maxPoolSize: 10,
    });
  }

  if (!cachedClient.topology?.isConnected()) {
    await cachedClient.connect();
  }

  cachedDb = cachedClient.db(databaseName);
  return cachedDb;
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
