import { ICreateHotelDTO, IHotelResponseDTO } from "../../../dtos/hotel.dto";
import { IHotel } from "../../models/IHotel.model";

export interface IHotelService{
    createHotel(ownerId:string,data:ICreateHotelDTO,hotelImage:Express.Multer.File):Promise<IHotel>
    getVendorHotels(ownerId:string):Promise<IHotelResponseDTO[]>
    getHotelById(ownerId:string,hotelId:string):Promise<IHotelResponseDTO>
}