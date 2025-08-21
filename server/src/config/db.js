import mongoose from "mongoose";

export const connectDB = async (uri) => {
  try {
    if (!uri) throw new Error("MongoDB URI is missing!");
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); 
  }
};
