import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = "portfolio"; // Ensure this is 'portfolio'
const collectionName = "visitors";

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req, res) {
  // Get the unique visitor ID from the header
  const visitorId = req.headers["x-visitor-id"] || "unknown";

  if (visitorId === "unknown") {
    return res.status(400).json({ error: "Missing visitor ID" });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db(dbName); // Use 'portfolio' database
    const collection = db.collection(collectionName);

    // Upsert the visitor ID (insert if not exists)
    await collection.updateOne(
      { visitorId },
      { $set: { visitorId, lastVisit: new Date() } },
      { upsert: true }
    );

    // Count unique visitor IDs
    const uniqueCount = await collection.countDocuments();

    res.status(200).json({ uniqueVisitors: uniqueCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
} 