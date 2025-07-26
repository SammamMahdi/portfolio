import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = "portfolio";
const collectionName = "visitors";

let cachedClient = null;

async function connectToDatabase() {
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set.");
  }
  if (cachedClient) return cachedClient;
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Add a new view entry with timestamp
    await collection.insertOne({
      timestamp: new Date(),
      date: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    });

    // Get total view count
    const totalViews = await collection.countDocuments();

    res.status(200).json({ totalViews });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Database error" });
  }
} 