import { Types } from "mongoose"

export enum MenuUnitType{
    FULL="full",
    HALF="half",
    QUARTER="quarter",
    PIECE="piece",
    NUMBER="number"
}

export interface IDailyMenuItem{
    _id:Types.ObjectId;
    itemName:string;
    unitType:MenuUnitType;
    originalPrice:number;
    discountedPrice:number;
    stockQuantity:number;
    isAvailable:boolean
}

export interface IDailyMenu{
    _id:Types.ObjectId;
    vendorId:Types.ObjectId;///ensure the authenticated user ownes it.
    hotelId:Types.ObjectId;//to identify which hotel ownes teh hotel
    menuDate:Date;
    pickupWindow:{
        startTime:Date;
        endTime:Date;
    }
    items:IDailyMenuItem[]
    isLive:boolean;
    createdAt:Date
    updatedAt:Date
}