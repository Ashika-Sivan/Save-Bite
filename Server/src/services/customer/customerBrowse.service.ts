import { Types } from "mongoose";
import { StatusCode } from "../../constants/statusCode";
import { ILiveHotelListResponseDTO, ILiveHotelMenuResponseDTO, ILiveHotelResponseDTO } from "../../dtos/liveHotels.dto";
import { AppError } from "../../errors/AppError";
import { IHotelRepository } from "../../interfaces/repository/IHotelRepository";
import { ICustomerBrowseService, ILiveHotelBrowseQuery } from "../../interfaces/service/customer/ICustomerBrowseService";
import { getSignedS3Url } from "../../utils/getSignedS3Url";
import { toLiveHotelListResponseDTO, toLiveHotelMenuResponseDTO } from "../../mappers/liveHotels.mapper";

export class CustomerBrowseService implements ICustomerBrowseService{
    constructor(private readonly _hotelRepository:IHotelRepository){}


    async getLiveHotels(query: ILiveHotelBrowseQuery): Promise<ILiveHotelListResponseDTO> {
        const page=query.page??1;
        const limit=query.limit??10;

        if(!Number.isInteger(limit)||limit<1||limit>50){
            throw new Error("Limit must be between 1 and 50")
        }

        if(!Number.isInteger(page)||page<1){
            throw new AppError("page must be positive integeer",StatusCode.BAD_REQUEST)
        }

        const hasLatitude=query.latitude!==undefined
        const hasLongitude=query.longitude!==undefined

        if(hasLatitude!==hasLongitude){
            throw new Error("latuitude and longitde must be provided together")
        }

        if(query.latitude!==undefined&&(!Number.isFinite(query.latitude)||query.latitude<-90||query.latitude>90)){
            throw new Error("Longitude must be between -180 and 180")
        }

        const now=new Date()
        
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(now);
        endOfDay.setHours(24, 0, 0, 0);

         const cutOffThreshold = new Date(//ORDER CLOSE 30 MIN BEFORE PICKUP END 
            now.getTime() + 30 * 60 * 1000
        );
          const skip = (page - 1) * limit;
          const result=await this._hotelRepository.findLiveHotels({
            startOfDay,endOfDay,cutOffThreshold,latitude:query.latitude,longitude:query.longitude,search:query.search,skip,limit
          })

        return toLiveHotelListResponseDTO(result, page, limit);
    }
    async getLiveHotelMenu(
        hotelId: string
    ): Promise<ILiveHotelMenuResponseDTO> {
        if (!Types.ObjectId.isValid(hotelId)) {
            throw new AppError(
                "Invalid hotel ID",
                StatusCode.BAD_REQUEST
            );
        }

        const now = new Date();

        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay =
            new Date(startOfDay);

        endOfDay.setDate(
            endOfDay.getDate() + 1
        );

        const cutoffThreshold = new Date(
            now.getTime() + 30 * 60 * 1000
        );

        const result =
            await this._hotelRepository
                .findLiveHotelMenu({
                    hotelId,
                    startOfDay,
                    endOfDay,
                    cutoffThreshold,
                });

        if (!result) {
            throw new AppError(
                "Live hotel menu not found or ordering has closed",
                StatusCode.NOT_FOUND
            );
        }

        return toLiveHotelMenuResponseDTO(result);
    }
}