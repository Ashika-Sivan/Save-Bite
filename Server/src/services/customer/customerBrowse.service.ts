import { Types } from "mongoose";
import { StatusCode } from "../../constants/statusCode";
import { ILiveHotelListResponseDTO, ILiveHotelMenuResponseDTO, ILiveHotelResponseDTO } from "../../dtos/liveHotels.dto";
import { AppError } from "../../errors/AppError";
import { IHotelRepository } from "../../interfaces/repository/IHotelRepository";
import { ICustomerBrowseService, ILiveHotelBrowseQuery } from "../../interfaces/service/customer/ICustomerBrowseService";
import { getSignedS3Url } from "../../utils/getSignedS3Url";

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
            startOfDay,endOfDay,cutOffThreshold,latitude:query.latitude,longitude:query.longitude,skip,limit
          })

        const hotels:ILiveHotelResponseDTO[]=result.hotels.map((hotel)=>{
            const response:ILiveHotelResponseDTO={
                hotelId:hotel.hotelId.toString(),
                menuId:hotel.menuId.toString(),
                 hotelName: hotel.hotelName,
                businessType: hotel.businessType,
                 hotelImageKey:hotel.hotelImageKey,
                 place:hotel.place,
                 address:hotel.address,
                 location:{
                    longitude:hotel.location.coordinates[0],
                    latitude:hotel.location.coordinates[1]
                 },
                 pickupWindow:{
                    startTime:hotel.pickupWindow.startTime,
                    endTime:hotel.pickupWindow.endTime
                 },
                 availableItemCount:hotel.availableItemCount,
            }

            if(hotel.distanceInMeter!==undefined){
                response.distanceInMeters=Math.round(hotel.distanceInMeter)
            }
            return response
        });
        return {hotels,pagination:{page,limit,total:result.total,
            totalPages:Math.ceil(result.total/limit)
        }}


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

        const items = await Promise.all(
            result.items.map(async (item) => {
                const itemImageUrl =
                    item.itemImageKey
                        ? await getSignedS3Url(
                            item.itemImageKey
                        )
                        : "";

                return {
                    itemId:
                        item.itemId.toString(),

                    itemName:
                        item.itemName,

                    itemImageUrl,

                    unitType:
                        item.unitType,

                    originalPrice:
                        item.originalPrice,

                    discountedPrice:
                        item.discountedPrice,

                    stockQuantity:
                        item.stockQuantity,

                    isAvailable:
                        item.isAvailable,
                };
            })
        );

        return {
            hotelId:
                result.hotelId.toString(),

            menuId:
                result.menuId.toString(),

            hotelName:
                result.hotelName,

            businessType:
                result.businessType,

            hotelImageKey:
                result.hotelImageKey,

            place:
                result.place,

            address:
                result.address,

            pickupWindow: {
                startTime:
                    result.pickupWindow.startTime,

                endTime:
                    result.pickupWindow.endTime,
            },

            items,
        };
    }
}