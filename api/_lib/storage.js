const { ObjectId } = require("mongodb");
const { getDb } = require("./mongo");

function isMongoEnabled() {
  return Boolean(process.env.MONGODB_URI);
}

async function requireDb() {
  if (!isMongoEnabled()) {
    throw new Error("MONGODB_URI is required. This app is configured for database-only mode.");
  }

  return getDb();
}

function toMongoSort(sort) {
  return sort || { _id: 1 };
}

async function listRecords(collectionName, sort) {
  const db = await requireDb();
  const rows = await db.collection(collectionName).find({}).sort(toMongoSort(sort)).toArray();
  return rows.map(({ _id, ...rest }) => ({ id: _id.toString(), ...rest }));
}

async function createRecord(collectionName, payload) {
  const db = await requireDb();
  const result = await db.collection(collectionName).insertOne(payload);
  return { id: result.insertedId.toString(), ...payload };
}

function isValidId(id) {
  if (!id || typeof id !== "string") {
    return false;
  }

  return ObjectId.isValid(id);
}

async function updateRecord(collectionName, id, payload) {
  if (!isValidId(id)) {
    return { ok: false, reason: "invalid-id" };
  }

  const db = await requireDb();
  const result = await db.collection(collectionName).updateOne({ _id: new ObjectId(id) }, { $set: payload });
  return { ok: result.matchedCount > 0, reason: result.matchedCount > 0 ? "updated" : "not-found" };
}

async function deleteRecord(collectionName, id) {
  if (!isValidId(id)) {
    return { ok: false, reason: "invalid-id" };
  }

  const db = await requireDb();
  const result = await db.collection(collectionName).deleteOne({ _id: new ObjectId(id) });
  return { ok: result.deletedCount > 0, reason: result.deletedCount > 0 ? "deleted" : "not-found" };
}

module.exports = {
  isMongoEnabled,
  listRecords,
  createRecord,
  updateRecord,
  deleteRecord,
  isValidId,
};
