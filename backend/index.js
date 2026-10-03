import "dotenv/config";

import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";

import { connectDB } from "./database/dbConnect.js";
import User from "./models/User.js";

import authRouter from "./Routes/authRoute.js";
import studentRouter from "./Routes/studentRoute.js";
import bookRouter from "./Routes/bookRoute.js";

const app = express();

const PORT = process.env.PORT || 5000;

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================================================
// DEFAULT ADMIN
// ======================================================

const createDefaultAdmin = async () => {
  try {
    const adminEmail = "admin@edu";
    const adminPassword = "admin";

    const existingAdmin = await User.findOne({
      email: adminEmail
    });

    if (existingAdmin) {
      console.log("Default admin already exists.");
      return;
    }

    const hashedPassword = await bcrypt.hash(
      adminPassword,
      10
    );

    await User.create({
      name: "Default Admin",
      email: adminEmail,
      phone: "9999999999",
      password: hashedPassword,
      role: "admin",
      isVerified: true,
      isProfileComplete: true
    });

    console.log("=================================");
    console.log("DEFAULT ADMIN CREATED");
    console.log("Email: admin@edu");
    console.log("Password: admin");
    console.log("=================================");

  } catch (error) {
    console.error(
      "Failed to create default admin:",
      error
    );
  }
};

// ======================================================
// ROOT
// ======================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "LMS Backend API is running"
  });
});

// ======================================================
// ROUTES
// ======================================================

app.use("/api/auth", authRouter);
app.use("/api/student", studentRouter);
app.use("/api/books", bookRouter);

// ======================================================
// 404
// ======================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use((error, req, res, next) => {
  console.error(
    "Global server error:",
    error
  );

  res.status(error.status || 500).json({
    success: false,
    message:
      error.message ||
      "Internal server error"
  });
});

// ======================================================
// START SERVER
// ======================================================

const startServer = async () => {
  try {
    await connectDB();

    console.log(
      "Database Connected Successfully"
    );

    await createDefaultAdmin();

    app.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT}`
      );

      console.log(
        `API Base: /api`
      );
    });

  } catch (error) {
    console.error(
      "Failed to start backend:",
      error
    );

    process.exit(1);
  }
};

startServer();