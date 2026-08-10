export interface ILiveHotelResponseDTO {
    hotelId: string;
    menuId: string;

    hotelName: string;
    businessType: string;
    hotelImageKey: string;
    place: string;
    address: string;

    location: {
        latitude: number;
        longitude: number;
    };

    pickupWindow: {
        startTime: Date;
        endTime: Date;
    };

    availableItemCount: number;

    // which prsnt only when the cutomer provides cordinates
    distanceInMeters?: number;
}

export interface ILiveHotelListResponseDTO {
    hotels: ILiveHotelResponseDTO[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface ILiveMenuItemResponseDTO {
    itemId: string;
    itemName: string;
    itemImageUrl: string;
    unitType: string;
    originalPrice: number;
    discountedPrice: number;
    stockQuantity: number;
    isAvailable: boolean;
}

export interface ILiveHotelMenuResponseDTO {
    hotelId: string;
    menuId: string;

    hotelName: string;
    businessType: string;
    hotelImageKey: string;
    place: string;
    address: string;

    pickupWindow: {
        startTime: Date;
        endTime: Date;
    };

    items: ILiveMenuItemResponseDTO[];
}