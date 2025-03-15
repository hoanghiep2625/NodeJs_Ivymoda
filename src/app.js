import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import productRouter from "./routers/product.js";
import authRouter from "./routers/auth.js";
import categoryRouter from "./routers/categories.js";

dotenv.config();

const app = express();

app.use(cors({ origin: "http://127.0.0.1:5501" }));
app.use(express.json());

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ Kết nối MongoDB thành công!");
    } catch (error) {
        console.error("❌ Lỗi kết nối MongoDB:", error);
        process.exit(1);
    }
};

connectDB();

app.use("/api/products", productRouter);
app.use("/api/auth", authRouter);
app.use("/api/categories", categoryRouter);

export const viteNodeApp = app;
