import { createClient } from "redis";
import { Logger } from "../utils/logger";

class RedisClient {
    private _client;

    constructor() {
        this._client = createClient({
            url: process.env.REDIS_URL //redis connection when the class is cretaed
        })
        this._client.on("error", (err) => {
            Logger.error("Redis client error", err)//to handle the error,what if the redis fail
        })

    }

    ///when the redis actuallly connect is when manually server restart
    async connect() {
        await this._client.connect()
        Logger.info('redis connected successfully')
    }
    getClient() {
        return this._client;
    }
}
export const redisClient = new RedisClient()