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
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req, res) {
  // Accept both GET and POST for testing
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const visitorId = req.headers["x-visitor-id"] || "unknown";
  console.log("Received visitorId:", visitorId);

  if (visitorId === "unknown") {
    console.log("Missing visitorId header");
    return res.status(400).json({ error: "Missing visitor ID" });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Upsert the visitor ID (insert if not exists)
    const result = await collection.updateOne(
      { visitorId },
      { $set: { visitorId, lastVisit: new Date() } },
      { upsert: true }
    );
    console.log("Upsert result:", result);

    // Count unique visitor IDs
    const uniqueCount = await collection.countDocuments();

    res.status(200).json({ uniqueVisitors: uniqueCount });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Database error" });
  }
} 