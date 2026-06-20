import dotenv from "dotenv"
dotenv.config()//to communication 
import App from "./app"
import { createServer, Server } from "http";
import connectDB from "./config/db";
import { redisClient } from "./config/redis";



const appInstance = new App();

class ServerApp {
    private server: Server;
    private db:connectDB;

    constructor(){
        this.server = createServer(appInstance.app);
        this.db=new connectDB()
        
    }

   public async start(){    
            await this.db.connect()
            await redisClient.connect()
            
        this.server.listen(5000,()=>{
            console.log(`http://localhost:${5000}`);
            
        })
            
    }

    
}

new ServerApp().start()