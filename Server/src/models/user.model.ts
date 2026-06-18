import mongoose,{Document,Schema} from "mongoose";

export interface IUser extends Document{
    name:string,
    email:string,
    phone?:string,
    password:string,
    isBusinessOwner:boolean,
    isAuthenticated:boolean,
    isActive:boolean,
    isAdmin:boolean

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
        }
    },
    {timestamps:true}

)

export const User=mongoose.model<IUser>("User",userSchema)