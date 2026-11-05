import "dotenv/config";
import App from "./app";
import { createServer, Server } from "http";
import connectDB from "./config/db";
import { redisClient } from "./config/redis";
import { Logger } from "./utils/logger";


import { initSocket } from "./config/socket";
import { initSchedulers } from "./jobs/autoRefund.job";
import { initNotificationScheduler } from "./utils/notificationScheduler";

const appInstance = new App();

class ServerApp {
    private _server: Server;
    private _db: connectDB;

    constructor() {
        this._server = createServer(appInstance.app);
        this._db = new connectDB();


        initSocket(this._server);
    }

    public async start() {
        const port = Number(process.env.PORT) || 5000;

        // 1. Listen immediately so cloud orchestrators (Render) detect the open port right away!
        this._server.listen(port, "0.0.0.0", async () => {
            console.log(`[STARTUP] HTTP Server is listening on port ${port}`);
            Logger.info(`Server running at http://0.0.0.0:${port}`);

            try {
                // 2. Connect to MongoDB
                console.log("[STARTUP] Connecting to MongoDB...");
                await this._db.connect();
                console.log("[STARTUP] MongoDB connected successfully.");
            } catch (dbErr) {
                console.error("[STARTUP ERROR] MongoDB connection failed:", dbErr);
            }

            try {
                // 3. Connect to Redis
                if (process.env.REDIS_URL) {
                    console.log("[STARTUP] Connecting to Redis...");
                    await redisClient.connect();
                    console.log("[STARTUP] Redis connected successfully.");
                } else {
                    console.warn("[STARTUP WARNING] REDIS_URL not set in environment.");
                }
            } catch (redisErr) {
                console.error("[STARTUP ERROR] Redis connection failed:", redisErr);
            }

            // 4. Initialize background jobs
            try {
                initSchedulers();
                initNotificationScheduler();
                console.log("[STARTUP] Schedulers initialized.");
            } catch (schedErr) {
                console.error("[STARTUP ERROR] Scheduler init failed:", schedErr);
            }
        });
    }


}

new ServerApp().start()