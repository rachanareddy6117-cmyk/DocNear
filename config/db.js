const mongoose = require("mongoose");

// Connects to MongoDB using the URI from .env, or spins up a memory server fallback
async function connectDB() {
  try {
    let uri = process.env.MONGO_URI;
    
    if (!uri || uri === "memory") {
      console.log("MONGO_URI is unset or set to 'memory'. Launching mongodb-memory-server...");
      const { MongoMemoryServer } = require("mongodb-memory-server");
      const mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      
      // Store the server instance globally so it can be cleaned up later if needed
      global.__MONGO_MEMORY_SERVER__ = mongoServer;
    }

    await mongoose.connect(uri);
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
}

module.exports = connectDB;
