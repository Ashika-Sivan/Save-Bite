import { ILiveHotelMenuRepositoryResult, ILiveMenuItemRepositoryResult, ILiveHotelRepositoryResult, ILiveHotelPaginatedResult } from "../interfaces/repository/IHotelRepository";
import { ILiveHotelMenuResponseDTO, ILiveMenuItemResponseDTO, ILiveHotelResponseDTO, ILiveHotelListResponseDTO } from "../dtos/liveHotels.dto";
import { getSignedS3Url } from "../utils/getSignedS3Url";

export const toLiveMenuItemResponseDTO = async (item: ILiveMenuItemRepositoryResult): Promise<ILiveMenuItemResponseDTO> => {
    const itemImageUrl = item.itemImageKey ? await getSignedS3Url(item.itemImageKey) : "";

    return {
        itemId: item.itemId.toString(),
        itemName: item.itemName,
        itemImageUrl,
        unitType: item.unitType,
        originalPrice: item.originalPrice,
        discountedPrice: item.discountedPrice,
        stockQuantity: item.stockQuantity,
        isAvailable: item.isAvailable,
    };
};

export const toLiveHotelMenuResponseDTO = async (result: ILiveHotelMenuRepositoryResult): Promise<ILiveHotelMenuResponseDTO> => {
    const items = await Promise.all(result.items.map(item => toLiveMenuItemResponseDTO(item)));
    const hotelImageKey = result.hotelImageKey ? await getSignedS3Url(result.hotelImageKey) : "";

    return {
        hotelId: result.hotelId.toString(),
        menuId: result.menuId.toString(),
        hotelName: result.hotelName,
        businessType: result.businessType,
        hotelImageKey,
        place: result.place,
        address: result.address,
        pickupWindow: {
            startTime: result.pickupWindow.startTime,
            endTime: result.pickupWindow.endTime,
        },
        items,
    };
};

export const toLiveHotelResponseDTO = async (hotel: ILiveHotelRepositoryResult): Promise<ILiveHotelResponseDTO> => {
    const hotelImageKey = hotel.hotelImageKey ? await getSignedS3Url(hotel.hotelImageKey) : "";

    const response: ILiveHotelResponseDTO = {
        hotelId: hotel.hotelId.toString(),
        menuId: hotel.menuId.toString(),
        hotelName: hotel.hotelName,
        businessType: hotel.businessType,
        hotelImageKey: hotelImageKey,
        place: hotel.place,
        address: hotel.address,
        location: {
            longitude: hotel.location.coordinates[0],
            latitude: hotel.location.coordinates[1]
        },
        pickupWindow: {
            startTime: hotel.pickupWindow.startTime,
            endTime: hotel.pickupWindow.endTime
        },
        availableItemCount: hotel.availableItemCount,
    };

    if (hotel.distanceInMeter !== undefined) {
        response.distanceInMeters = Math.round(hotel.distanceInMeter);
    }

    return response;
};

export const toLiveHotelListResponseDTO = async (result: ILiveHotelPaginatedResult, page: number, limit: number): Promise<ILiveHotelListResponseDTO> => {
    const hotels = await Promise.all(result.hotels.map(hotel => toLiveHotelResponseDTO(hotel)));

    return {
        hotels,
        pagination: {
            page,
            limit,
            total: result.total,
            totalPages: Math.ceil(result.total / limit)
        }
    };
};
