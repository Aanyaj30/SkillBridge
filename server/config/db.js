import mongoose from "mongoose";

// This function connects our app to MongoDB Atlas using the connection
// string stored in .env. We call it once, when the server starts.
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection failed: ${err.message}`);
    process.exit(1); // stop the server if the DB won't connect — no point running without it
  }
};

export default connectDB;
