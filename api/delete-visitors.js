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
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log("Delete visitors API called");

  try {
    const client = await connectToDatabase();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Delete all documents in the visitors collection
    const result = await collection.deleteMany({});
    
    console.log("Deleted records:", result.deletedCount);

    res.status(200).json({ 
      success: true, 
      deletedCount: result.deletedCount,
      message: `Successfully deleted ${result.deletedCount} visitor records` 
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Database error" });
  }
} 