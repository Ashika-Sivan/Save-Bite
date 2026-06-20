import express, { Application } from "express"
import authRoutes from './routes/auth.route'
import otpRoutes from './routes/otp.routes'
import cors from "cors"




export default class App {
    public app : Application;

    constructor(){
        this.app = express()
        this.middleware()
        this.routes()
    }
    private middleware():void{
        this.app.use(
            cors({
                origin:"http://localhost:5173",
                credentials:true
                
            })
            
        )
        this.app.use(express.json())

    }
    private routes():void{
        this.app.use('/api/auth',authRoutes)
        this.app.use('/api/auth',otpRoutes)
    }
   
}
