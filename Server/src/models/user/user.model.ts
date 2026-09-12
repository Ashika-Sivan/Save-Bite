import mongoose,{Document,Schema} from "mongoose";

const pointSchema = new Schema({
    type: {
        type: String,
        enum: ['Point'],
        required: true
    },
    coordinates: {
        type: [Number],
        required: true
    }
}, { _id: false });

export interface IUser extends Document{
    name:string,
    email:string,
    phone?:string,
    password?:string, // Optional for Google Auth
    authProvider?: "local" | "google",
    isBusinessOwner:boolean,
    isAuthenticated:boolean,
    isActive:boolean,
    isAdmin:boolean,
    totalOrder:number|0,
    role: "user" | "vendor" | "admin";
    location?: {
        type: "Point";
        coordinates: [number, number]; // [longitude, latitude]
    };
    createdAt:Date

}

const userSchema=new Schema<IUser>(
    {
        name:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true
        },
        password:{
            type:String,
            required: function() { return this.authProvider === 'local' || !this.authProvider; }
        },
        authProvider: {
            type: String,
            enum: ['local', 'google'],
            default: 'local'
        },
        phone:{
            type:String
        },
        isBusinessOwner:{
            type:Boolean,
            default:false
        },
        isAuthenticated:{
            type:Boolean,
            default:false
        },
        isActive:{
            type:Boolean,
            default:true
        },
        isAdmin:{
            type:Boolean,
            default:false
        },
        role:{
            type:String,
            enum:["user",'vendor','admin'],
            default:'user',
        },
        location: {
            type: pointSchema,
            required: false
        }
    },
    {timestamps:true}

)

export const User=mongoose.model<IUser>("User",userSchema)

User.collection.createIndex({ location: "2dsphere" });