import { MongoClient, ObjectId } from "mongodb";

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

  const { _id } = req.body;
  if (!_id) {
    return res.status(400).json({ error: "Missing _id" });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Delete the document by _id
    const result = await collection.deleteOne({ _id: new ObjectId(_id) });

    if (result.deletedCount === 1) {
      res.status(200).json({ success: true });
    } else {
      res.status(404).json({ error: "Record not found" });
    }
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Database error" });
  }
} 