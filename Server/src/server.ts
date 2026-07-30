import "dotenv/config";
import App from "./app";
import { createServer, Server } from "http";
import connectDB from "./config/db";
import { redisClient } from "./config/redis";
import { Logger } from "./utils/logger";


const appInstance = new App();

class ServerApp {
    private _server: Server;
    private _db: connectDB;

    constructor() {
        this._server = createServer(appInstance.app);
        this._db = new connectDB()

    }

    public async start() {
        await this._db.connect()
        await redisClient.connect()

        this._server.listen(5000, () => {
            Logger.info(`Server running at http://localhost:5000`);

        })

    }


}

new ServerApp().start()