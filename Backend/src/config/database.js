const mongoose=require("mongoose");
const config=require("./config");

const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log("Database Connected to MongoDB Atlas");
  } catch (error) {
    console.log("MongoDB Atlas connection failed. Falling back to local MongoDB...");
    try {
      await mongoose.connect("mongodb://127.0.0.1:27017/snitch");
      console.log("Database Connected to Local MongoDB (mongodb://127.0.0.1:27017/snitch)");
    } catch (localError) {
      console.log("Database Error:", localError);
      process.exit(1);
    }
  }
};

module.exports=connectDB;