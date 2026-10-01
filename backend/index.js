import "dotenv/config";
import express from "express";
import cors from "cors";

import { connectDB } from "./database/dbConnect.js";
import authRouter from "./Routes/authRoute.js";
import studentRouter from "./Routes/studentRoute.js";
import bookRouter from "./Routes/bookRoute.js";

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/student", studentRouter);
app.use("/api/book", bookRouter);

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();