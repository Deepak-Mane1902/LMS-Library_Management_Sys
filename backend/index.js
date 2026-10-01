import 'dotenv/config';

import express from 'express';
import cors from 'cors';

import { connectDB } from './database/dbConnect.js';

import authRouter from './Routes/authRoute.js';
import studentRouter from './Routes/studentRoute.js';
import bookRouter from './Routes/bookRoute.js';

const app = express();

const port = process.env.PORT || 5000;

// ===============================
// Middlewares
// ===============================

app.use(
    cors({
        origin: [
            'http://localhost:5173',
            'https://lms-library-management-sys.vercel.app'
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    })
);

app.use(express.json());

// ===============================
// Routes
// ===============================

app.use('/api/auth', authRouter);

app.use('/api/student', studentRouter);

app.use('/api/book', bookRouter);

// ===============================
// Health Check
// ===============================

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'LMS Backend API is running'
    });
});

// ===============================
// 404 Handler
// ===============================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});

// ===============================
// Error Handler
// ===============================

app.use((err, req, res, next) => {
    console.error('Server Error:', err);

    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// ===============================
// Database
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


  // Server live host 

  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
    console.log("LMS Backend is ready to accept requests.");
  });
};

startServer();