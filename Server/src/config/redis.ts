import { createClient } from "redis";
class RedisClient{
    private client;

    constructor(){
        this.client=createClient({
            url: "redis://localhost:6379",//redis connection when the class is cretaed
        })
        this.client.on("error",(err)=>{
            console.error(err)//to handle the error,what if the redis fail
        })
        
    }

    ///when the redis actuallly connect is when manually server restart
    async connect(){
        await this.client.connect()
        console.log('redis connected successfully')
    }
    getClient(){
        return this.client;
    }
}
export const redisClient=new RedisClient()