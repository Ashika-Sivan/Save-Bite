import mongoose from "mongoose";
import { Logger } from "../utils/logger";

export default class connectDB {
    public async connect(): Promise<void> {
        try {
            await mongoose.connect(process.env.MONGODB_URI as string, {
                serverSelectionTimeoutMS: 30000,
                connectTimeoutMS: 30000,
            });
            Logger.info('Mongodb connected');
            Logger.info("Connected DB:", mongoose.connection.name);

        } catch (error) {
            Logger.error("MongoDB connection failed", error);
            // Do not process.exit(1) so the HTTP server stays online to report health and logs
        }
    }
}