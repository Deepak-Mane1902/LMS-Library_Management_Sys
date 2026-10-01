import "dotenv/config";

import express from "express";
import cors from "cors";

import { connectDB } from "./database/dbConnect.js";

import authRouter from "./Routes/authRoute.js";
import studentRouter from "./Routes/studentRoute.js";
import bookRouter from "./Routes/bookRoute.js";

const app = express();

const port = process.env.PORT || 5000;

// ===============================
// MIDDLEWARES
// ===============================

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// ===============================
// ROUTES
// ===============================

app.use("/api/auth", authRouter);

app.use("/api/student", studentRouter);

app.use("/api/book", bookRouter);

// ===============================
// HEALTH CHECK
// ===============================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "LMS Backend API is running",
  });
});

// ===============================
// START SERVER
// ===============================

const startServer = async () => {
  console.log("Starting LMS Backend...");

  console.log("Connecting to MongoDB...");

  const connected = await connectDB();

  if (!connected) {
    console.error(
      "Server was not started because MongoDB connection failed."
    );

    process.exit(1);
  }

  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
    console.log("LMS Backend is ready to accept requests.");
  });
};

startServer();