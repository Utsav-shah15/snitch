const express=require("express");
const cookieParser=require("cookie-parser");

const app=express();
const morgan = require("morgan");
const cors=require("cors");

const authRoutes=require("./routes/auth.routes");
const productRoutes=require("./routes/product.routes");
const orderRoutes=require("./routes/order.routes");
const walletRoutes=require("./routes/wallet.routes");
const offerRoutes=require("./routes/offer.routes");
const analyticsRoutes=require("./routes/analytics.routes");
const aiRoutes=require("./routes/ai.routes");
const dropRoutes=require("./routes/drop.routes");
const notificationRoutes=require("./routes/notification.routes");
const paymentRoutes=require("./routes/payment.routes");

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

const path = require("path");
const _dirname = path.resolve();

app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/drops", dropRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payment", paymentRoutes);

app.use(express.static(path.join(_dirname, "/Frontend/dist")));
app.get((req, res) => {
    res.sendFile(path.resolve(_dirname, "Frontend", "dist", "index.html"));
})

module.exports=app;

