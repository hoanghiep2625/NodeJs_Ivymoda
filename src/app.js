import ngrok from "@ngrok/ngrok";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import productRouter from "./routers/product.js";
import authRouter from "./routers/auth.js";
import categoryRouter from "./routers/categories.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("🔗 Connected to MongoDB");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
        process.exit(1);
    }
};

connectDB();

app.use("/api/products", productRouter);
app.use("/api/auth", authRouter);
app.use("/api/categories", categoryRouter);

const PORT = 2625;
app.listen(PORT, async () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);

    const listener = await ngrok.connect({
        addr: PORT,
        authtoken: process.env.NGROK_AUTHTOKEN,
    });

    console.log(`🌍 Ngrok URL: ${listener.url()}`);
});
