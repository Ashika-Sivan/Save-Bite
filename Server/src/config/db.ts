import mongoose from "mongoose";
export default class connectDB{
    public async connect():Promise<void>{
        try {
            await mongoose.connect(process.env.MONGODB_URI as string)
            console.log('Mongodb connected')
            console.log("Connected DB:", mongoose.connection.name);
            
        } catch (error) {
            console.log(error)
            console.error(error)
            process.exit(1)
            
        }
    }
}