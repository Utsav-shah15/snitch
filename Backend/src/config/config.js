require("dotenv").config();

if(!process.env.MONGO_URI){
    throw new Error("MONGO_URI is not defined in .env file");
}

if(!process.env.JWT_SECRET){
    throw new Error("JWT_SECRET is not defined in .env file");
}

const config={
   MONGO_URI:process.env.MONGO_URI,
   jwtSecret:process.env.JWT_SECRET
}

module.exports=config;