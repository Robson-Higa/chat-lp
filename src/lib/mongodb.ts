import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("⚠️ Missing MONGODB_URI in .env.local");
}

let isConnected = false;

export async function connectToDatabase() {
  if (isConnected) return;
  await mongoose.connect(MONGODB_URI);
  isConnected = true;
  console.log("✅ Connected to MongoDB Atlas");
}

const messageSchema = new mongoose.Schema(
  {
    name: String,
    text: String,
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema);
