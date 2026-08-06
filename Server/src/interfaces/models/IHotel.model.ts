import { Types } from "mongoose";

export interface IHotel{
    _id:Types.ObjectId;
    vendorId:Types.ObjectId;


    hotelName:string;
    businessType:string;
    hotelImageKey:string;

    place:string;
    address:string;

    location:{
        type:"Point",
        coordinates:[number,number]
    }
    isActive:boolean;
    createdAt:Date;
    updatedAt:Date;
}