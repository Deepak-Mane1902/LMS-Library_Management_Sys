import mongoose from 'mongoose';

const dbString = process.env.MONGODB;

export const connectDB = async () => {
    try {
        await mongoose.connect(dbString);

        console.log("Database Connect Successfully");
    } catch (error) {
        console.log("Database Connection Failed:", error.message);
    }
};