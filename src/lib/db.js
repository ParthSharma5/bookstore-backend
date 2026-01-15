
import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(process.env.MONGO_URL);
    console.log(` DATABASE CONNECTED: ${conn.connection.host}`);
  } catch (error) {
    console.error(" Error in database connection:", error.message);
    process.exit(1);
  }
};


