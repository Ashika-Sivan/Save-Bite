import { IHotelResponseDTO } from "../dtos/hotel.dto"
import { IHotel } from "../interfaces/models/IHotel.model"
import { getSignedS3Url } from "../utils/getSignedS3Url"

export const toHotelResponseDTO=async(hotel:IHotel):Promise<IHotelResponseDTO>=>{
    const hotelImageUrl=await getSignedS3Url(hotel.hotelImageKey);
    return {
        _id:hotel._id.toString(),
        vendorId:hotel.vendorId.toString(),
        hotelName:hotel.hotelName,
        businessType:hotel.businessType,
        hotelImageUrl,
        place:hotel.place,
        address:hotel.address,
        location:hotel.location,
        isActive:hotel.isActive,
        createdAt:hotel.createdAt,
        updatedAt:hotel.updatedAt
    }
}