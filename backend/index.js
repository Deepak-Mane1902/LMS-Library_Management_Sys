import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDB } from './database/dbConnect.js';
import authRouter from './Routes/authRoute.js';
import studentRouter from './Routes/studentRoute.js';
import bookRouter from './Routes/bookRoute.js';


const port = process.env.PORT || 5000;
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes

app.use("/api/auth", authRouter);
app.use("/api/students", studentRouter);
app.use("/api/books", bookRouter);


// Database
connectDB();


app.get('/',(req,res)=>{
     res.send("Hello world")
})

app.listen(port,"0.0.0.0" ,()=>{
     console.log(`Server connected to http://localhost:${port} `);
})

