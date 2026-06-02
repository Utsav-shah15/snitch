const mongoose=require("mongoose");
const config=require("./config");

const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log("Database Connected");
  } catch (error) {
    console.log("Database Error:", error);
    process.exit(1);
  }
};

module.exports=connectDB;