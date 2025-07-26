import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = "portfolio";
const collectionName = "visitors";

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req, res) {
  try {
    const client = await connectToDatabase();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const visits = await collection.find({}, { projection: { _id: 0, visitorId: 1, lastVisit: 1 } }).toArray();
    console.log("Found unique visitors:", visits.length);
    res.status(200).json({ visits });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
} 