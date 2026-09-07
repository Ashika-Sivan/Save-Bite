import mongoose,{Document,Schema} from "mongoose";

export interface IUser extends Document{
    name:string,
    email:string,
    phone?:string,
    password:string,
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
            required:true

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
        location:{
            type:{
                type:String,
                enum:["Point"],
                default:"Point"
            },
            coordinates:{
                type:[Number],
                required: false // Optional initially until they share it
            }
        }
    },
    {timestamps:true}

)

export const User=mongoose.model<IUser>("User",userSchema)

User.collection.createIndex({ location: "2dsphere" });