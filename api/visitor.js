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

  console.log("Visitor API called");

  const visitorId = req.headers["x-visitor-id"];
  console.log("Received visitorId:", visitorId);

  if (!visitorId) {
    console.log("Missing visitorId header");
    return res.status(400).json({ error: "Missing visitor ID" });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Upsert the visitor ID (insert if not exists, update lastVisit if exists)
    const result = await collection.updateOne(
      { visitorId },
      { 
        $set: { 
          visitorId, 
          lastVisit: new Date(),
          date: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
        } 
      },
      { upsert: true }
    );

    console.log("Upsert result:", result);

    // Count unique visitors
    const uniqueVisitors = await collection.countDocuments();

    console.log("Unique visitors:", uniqueVisitors);
    res.status(200).json({ uniqueVisitors });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Database error" });
  }
} 