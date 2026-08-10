import { Types } from "mongoose";
import { IHotelCreateData } from "../../dtos/hotel.dto";
import { IHotel } from "../models/IHotel.model";
export interface ILiveHotelQuery{
    startOfDay:Date;
    endOfDay:Date;
    cutOffThreshold:Date;
    latitude?:number;
    longitude?:number;
    skip:number;
    limit:number;
}

export interface ILiveHotelRepositoryResult{
    hotelId:Types.ObjectId;
    vendorId:Types.ObjectId;
    menuId:Types.ObjectId;
    hotelName:string;
    businessType:string;
    hotelImageKey:string;
    place:string;
    address:string;

    location:{
        type:["Point"];
        coordinates:[number,number]
    };
    pickupWindow:{
        startTime:Date;
        endTime:Date;
    }
    availableItemCount:number;
    distanceInMeter:number

}
export interface  ILiveHotelPaginatedResult{
    hotels: ILiveHotelRepositoryResult[];
    total:number;
}
export interface ILiveHotelMenuQuery {
    hotelId: string;
    startOfDay: Date;
    endOfDay: Date;
    cutoffThreshold: Date;
}

export interface ILiveMenuItemRepositoryResult {
    itemId: Types.ObjectId;
    itemName: string;
    itemImageKey:string
    unitType: string;
    originalPrice: number;
    discountedPrice: number;
    stockQuantity: number;
    isAvailable: boolean;
}

export interface ILiveHotelMenuRepositoryResult {
    hotelId: Types.ObjectId;
    menuId: Types.ObjectId;

    hotelName: string;
    businessType: string;
    hotelImageKey: string;
    place: string;
    address: string;

    pickupWindow: {
        startTime: Date;
        endTime: Date;
    };

    items: ILiveMenuItemRepositoryResult[];
}



export interface IHotelRepository{
    createHotel(data:IHotelCreateData):Promise<IHotel>;
    findByVendorId(vendorId:string):Promise<IHotel[]>;
    findByIdAndVendorId(hotelId:string, vendorId:string):Promise<IHotel|null>
    findLiveHotels(query:ILiveHotelQuery):Promise<ILiveHotelPaginatedResult>
    findLiveHotelMenu(query:ILiveHotelMenuQuery):Promise<ILiveHotelMenuRepositoryResult|null>
        
       
   
}