import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const uri = process.env.DATABASE_CONNECTION_URI;

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const users = await db.collection('users').find({}).limit(1).toArray();
  if (users.length > 0) {
    const user = users[0];
    console.log("Found user:", user.email);
    // Update password to 'password123'
    const hashedPassword = await bcrypt.hash('password123', 10);
    await db.collection('users').updateOne({ _id: user._id }, { $set: { password: hashedPassword } });
    console.log("Password updated to 'password123'");
  } else {
    console.log("No users found");
  }
  await mongoose.disconnect();
}
run();
