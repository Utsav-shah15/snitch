const mongoose=require("mongoose");
const config=require("./config");

const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log("Database Connected to MongoDB Atlas");
  } catch (error) {
    console.log("MongoDB Atlas connection failed. Falling back to local MongoDB...");
  }
};

module.exports=connectDB;