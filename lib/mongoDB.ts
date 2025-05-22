import mongoose from "mongoose";
import Collection from "@/lib/models/Collection";

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  throw new Error("❌ MONGODB_URL is not defined in environment variables");
}

type MongooseGlobal = typeof global & {
  mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
};

let cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

if ((global as MongooseGlobal).mongoose) {
  cached = (global as MongooseGlobal).mongoose;
} else {
  cached = { conn: null, promise: null };
  (global as MongooseGlobal).mongoose = cached;
}

export async function connectToDB() {
  if (cached.conn) {
    console.log("✅ Using existing MongoDB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("⏳ Connecting to MongoDB...");
    cached.promise = mongoose
      .connect(MONGODB_URL as string, {
        dbName: "Aays_Admin", 
      })
      .then((mongooseInstance) => {
        console.log("✅ MongoDB Connected");
        return mongooseInstance;
      })
      .catch((error) => {
        console.error("❌ MongoDB Connection Error:", error);
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export async function getCollectionsFromDB() {
  try {
    await connectToDB(); 

    const collections = await Collection.find().populate("products").lean(); // ✅ .lean() gives plain JS objects
    console.log("📌 Fetched Collections from DB:", collections);

    return collections;
  } catch (error) {
    console.error("❌ Database Query Error:", error);
    return [];
  }
}