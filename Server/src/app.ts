import express, { Application } from "express"
import authRoutes from './routes/auth.route'


export default class App {
    public app : Application;

    constructor(){
        this.app = express()
        this.middleware()
        this.routes()
    }
    private middleware(){
        this.app.use(express.json())
    }
    private routes(){
        this.app.use('/api/auth',authRoutes)
    }
}
