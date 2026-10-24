const mongoose = require("mongoose");

async function connectToMongo() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is missing. Create backend/.env from backend/.env.example.");
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log("Connected to MongoDB");
}

module.exports = connectToMongo;
