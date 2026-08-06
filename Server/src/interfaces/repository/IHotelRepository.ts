import { IHotelCreateData } from "../../dtos/hotel.dto";
import { IHotel } from "../models/IHotel.model";

export interface IHotelRepository{
    createHotel(data:IHotelCreateData):Promise<IHotel>;
    findByVendorId(vendorId:string):Promise<IHotel[]>;
    findByIdAndVendorId(
        hotelId:string,
        vendorId:string,
    ):Promise<IHotel|null>
}