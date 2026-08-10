import api from "./api";
import { API_ROUTES } from "../constants/apiRoutes";

export interface LiveHotel {
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
        startTime: string;
        endTime: string;
    };

    availableItemCount: number;
    distanceInMeters?: number;
}

export interface LiveMenuItem {
    itemId: string;
    itemName: string;

    // Food-item signed URL
    itemImageUrl: string;

    unitType: string;
    originalPrice: number;
    discountedPrice: number;
    stockQuantity: number;
    isAvailable: boolean;
}

export interface LiveHotelMenu {
    hotelId: string;
    menuId: string;
    hotelName: string;
    businessType: string;
    hotelImageKey: string;
    place: string;
    address: string;

    pickupWindow: {
        startTime: string;
        endTime: string;
    };

    items: LiveMenuItem[];
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface LiveHotelQuery {
    page?: number;
    limit?: number;
    latitude?: number;
    longitude?: number;
}

export const getLiveHotels = async (
    query: LiveHotelQuery = {}
): Promise<
    ApiResponse<{
        hotels: LiveHotel[];
        pagination: Pagination;
    }>
> => {
    const response = await api.get<
        ApiResponse<{
            hotels: LiveHotel[];
            pagination: Pagination;
        }>
    >(
        API_ROUTES.CUSTOMER.LIVE_HOTELS,
        {
            params: query,
        }
    );

    return response.data;
};

export const getLiveHotelMenu = async (
    hotelId: string
): Promise<ApiResponse<LiveHotelMenu>> => {
    const response = await api.get<
        ApiResponse<LiveHotelMenu>
    >(
        API_ROUTES.CUSTOMER
            .LIVE_HOTEL_MENU(hotelId)
    );

    return response.data;
};