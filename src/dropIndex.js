import mongoose from "mongoose";
import "dotenv/config.js";

console.log("Connecting to:", process.env.DATABASE_CONNECTION_URI);
mongoose.connect(process.env.DATABASE_CONNECTION_URI)
  .then(async () => {
    console.log("Connected. Dropping indexes on location...");
    const Profile = mongoose.connection.collection('profiles');
    try {
      await Profile.dropIndex('location_2d');
      console.log('dropped location_2d');
    } catch (e) {
      console.log("no location_2d index found or error:", e.message);
    }
    try {
      await Profile.dropIndex('location_2dsphere');
      console.log('dropped location_2dsphere');
    } catch (e) {
      console.log("no location_2dsphere index found or error:", e.message);
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error("Connection error:", err);
    process.exit(1);
  });
