import { ILiveHotelListResponseDTO, ILiveHotelMenuResponseDTO } from "../../../dtos/liveHotels.dto";

export interface ILiveHotelBrowseQuery{
    page?:number;
    limit?:number;
    latitude?:number;
    longitude?:number;
    search?:string;
}

export interface ICustomerBrowseService{
    getLiveHotels(query:ILiveHotelBrowseQuery):Promise<ILiveHotelListResponseDTO>
    getLiveHotelMenu(hotelId:string):Promise<ILiveHotelMenuResponseDTO>
}