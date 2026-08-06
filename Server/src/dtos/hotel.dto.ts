/*
this is the data that recieved from the frontend
*/

import { Types } from "mongoose";

export interface ICreateHotelDTO{
    hotelName:string;
    businessType:string;
    place:string;
    address:string;
    latitude:number;
    longitude:number
}
/*
final object the service give repository
*/
export interface IHotelCreateData{
    vendorId:Types.ObjectId,
    hotelName:string;
    businessType:string;
    place:string;
    address:string;
    hotelImageKey:string;
    location:{
        type:"Point",
        coordinates:[number,number]
    }

}

/*
hotel response dto
*/

export interface IHotelResponseDTO{
    _id:string;
    vendorId:string;
    hotelName:string;
    businessType:string;
    hotelImageUrl:string;//instead of exposing the hotel Image url
    place:string;
    address:string
    location:{
        type:'Point';
        coordinates:[number,number]
    }
    isActive:boolean;
    createdAt:Date;
    updatedAt:Date;
}