import mongoose from "mongoose";

const dbString = process.env.MONGODB;

export const connectDB = async () => {
    try {
        if (!dbString) {
            throw new Error("MONGODB environment variable is missing");
        }

        await mongoose.connect(dbString);

        console.log("Database Connected Successfully");
    } catch (error) {
        console.error("Database Connection Failed:", error.message);
        throw error;
    }
};