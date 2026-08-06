import express, { Application } from "express"
import authRoutes from './routes/auth.route'
import otpRoutes from './routes/otp.routes'
import cors from "cors"
import cookieParser from "cookie-parser"
import vendorRoute from "./routes/vendor.route";
import { errorMiddleware } from "./middlewares/error.middleware"
import adminRoute  from "./routes/admin.routes"




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
         this.app.use(cookieParser());
        

    }
    private routes():void{
        this.app.use('/api/auth',authRoutes)
        this.app.use('/api/auth',otpRoutes)
        this.app.use("/api/vendor",vendorRoute)
        this.app.use("/api/admin",adminRoute)
       
    }

    private errorHandler():void{
         this.app.use(errorMiddleware)
    }
   
}
