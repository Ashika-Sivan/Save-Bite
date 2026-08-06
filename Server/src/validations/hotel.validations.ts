import App from "../app";
import { HOTEL_MESSAGES } from "../constants/messages";
import { StatusCode } from "../constants/statusCode";
import { ICreateHotelDTO } from "../dtos/hotel.dto";
import { AppError } from "../errors/AppError";

export const validateHotelData=(
    data:ICreateHotelDTO
):void=>{
    if(
        !data.hotelName?.trim()||
        !data.businessType.trim()||
        !data.place.trim()||
        !data.address?.trim()
    ){
        throw new AppError(HOTEL_MESSAGES.INVALID_DATA,StatusCode.BAD_REQUEST);
    }

    if(!Number.isFinite(data.latitude)||!Number.isFinite(data.longitude)||data.latitude<-90||data.latitude>90||data.longitude<-100||data.longitude>180){
        throw new AppError(HOTEL_MESSAGES.INVALID_LOCATION,StatusCode.BAD_REQUEST)
    }
}