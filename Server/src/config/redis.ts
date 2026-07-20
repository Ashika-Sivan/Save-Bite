import { createClient } from "redis";
class RedisClient{
    private _client;

    constructor(){
        this._client=createClient({
            url: "redis://localhost:6379",//redis connection when the class is cretaed
        })
        this._client.on("error",(err)=>{
            console.error(err)//to handle the error,what if the redis fail
        })
        
    }

    ///when the redis actuallly connect is when manually server restart
    async connect(){
        await this._client.connect()
        console.log('redis connected successfully')
    }
    getClient(){
        return this._client;
    }
}
export const redisClient=new RedisClient()