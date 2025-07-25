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
  // Get the IP address
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.connection?.remoteAddress ||
    "unknown";

  try {
    const client = await connectToDatabase();
    const db = client.db(dbName); // Use 'portfolio' database
    const collection = db.collection(collectionName);

    // Upsert the IP (insert if not exists)
    await collection.updateOne(
      { ip },
      { $set: { ip, lastVisit: new Date() } },
      { upsert: true }
    );

    // Count unique IPs
    const uniqueCount = await collection.countDocuments();

    res.status(200).json({ uniqueVisitors: uniqueCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
} 