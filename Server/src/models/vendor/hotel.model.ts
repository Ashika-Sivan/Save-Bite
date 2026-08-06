import mongoose, { Schema } from "mongoose";
import { IHotel } from "../../interfaces/models/IHotel.model";

const hotelSchema=new Schema<IHotel>(
    {
        vendorId:{
            type:Schema.Types.ObjectId,
            ref:"vendor",
            required:true,
            index:true
        },
        hotelName:{
            type:String,
            required:true,
            trim:true,
            minLength:2,
            maxLength:100,
        },
        businessType:{
            type:String,
            reqired:true,
            trim:true,
        },
        hotelImageKey:{
            type:String,
            required:true
        },
        place:{
            type:String,
            required:true,
            trim:true
        },
        address:{
            type:String,
            required:true,
            trim:true,
            maxLength:500
        },
        location:{
            type:{
                type:String,
                enum:["Point"],
                default:"Point",
                required:true,
            },
            coordinates:{
                type:[Number],
                required:true,
                validate:{
                    validator:(coordinates:number[])=>{
                        if(!Array.isArray(coordinates)||coordinates.length!==2)return false;

                        const longitude=coordinates[0];
                        const latitude=coordinates[1];

                        if(longitude===undefined || latitude===undefined){
                            return false
                        }

                        return (
                            Number.isFinite(longitude)&&Number.isFinite(latitude)&&
                            longitude>=-180 && 
                            longitude<=180 &&
                            latitude>=-90 &&
                            latitude<=90
                        );
                    },
                    message:"Coordinates must contain valid longitude latitude"
                },
            },
        },

        isActive:{
            type:Boolean,
            default:true
        }

    },
    {
        timestamps:true,
    }

)
hotelSchema.index({location:"2dsphere"});
hotelSchema.index({vendorId:1,createdAt:-1})
export const Hotel=mongoose.model<IHotel>("hotel",hotelSchema)