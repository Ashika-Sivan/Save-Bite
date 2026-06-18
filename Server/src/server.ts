import App from "./app"
import { createServer, Server } from "http";
import dotenv from "dotenv"
dotenv.config()//to communication 
import connectDB from "./config/db";



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
            
        this.server.listen(5000,()=>{
            console.log(`http://localhost:${5000}`);
            
        })
            
    }
}

new ServerApp().start();