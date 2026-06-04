const express=require("express");
const cookieParser=require("cookie-parser");

const app=express();
const morgan = require("morgan");
const cors=require("cors");

const authRoutes=require("./routes/auth.routes");
const productRoutes=require("./routes/product.routes")

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);
app.use("/api",productRoutes);

module.exports=app;
