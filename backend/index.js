import "dotenv/config";

import express from "express";

import cors from "cors";

import { connectDB } from "./database/dbConnect.js";

import authRouter from "./Routes/authRoute.js";

import studentRouter from "./Routes/studentRoute.js";

import bookRouter from "./Routes/bookRoute.js";

// ======================================================
// APP
// ======================================================

const app = express();

// Render provides PORT automatically.
// 5000 is used locally.
const PORT =
  process.env.PORT || 5000;

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(
  express.json()
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message:
      "LMS Backend API is running",
  });
});

// ======================================================
// API ROUTES
// ======================================================

app.use(
  "/api/auth",
  authRouter
);

app.use(
  "/api/student",
  studentRouter
);

app.use(
  "/api/books",
  bookRouter
);

// ======================================================
// 404 HANDLER
// ======================================================

app.use(
  (req, res) => {
    res.status(404).json({
      success: false,
      message:
        `Route not found: ${req.method} ${req.originalUrl}`,
    });
  }
);

// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use(
  (error, req, res, next) => {
    console.error(
      "Global server error:",
      error
    );

    res.status(
      error.status || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Internal server error",
    });
  }
);

// ======================================================
// DATABASE + SERVER
// ======================================================

const startServer = async () => {
  try {
    await connectDB();

    app.listen(
      PORT,
      () => {
        console.log(
          `Server running on port ${PORT}`
        );

        console.log(
          `API Base: /api`
        );
      }
    );

  } catch (error) {
    console.error(
      "Failed to start server:",
      error
    );

    process.exit(1);
  }
};

startServer();