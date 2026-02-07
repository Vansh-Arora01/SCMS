import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL)
    console.log("🔔 Mongo db is connected")
  } catch (error) {
     console.error("🚨 Mongo db Connection error",error)
        process.exit(1)
  }     
}

export default connectDB;