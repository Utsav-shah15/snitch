const express=require("express");
const cookieParser=require("cookie-parser");

const app=express();
const morgan = require("morgan");
const cors=require("cors");

const authRoutes=require("./routes/auth.routes");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

module.exports=app;