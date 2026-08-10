import type { ApiResponse, CreateHotelData, Hotel } from "../types/hotel.types";
import api from "./api";
import { API_ROUTES } from "../constants/apiRoutes";

export const createHotel = async (data: CreateHotelData): Promise<ApiResponse<Hotel>> => {
   const formData = new FormData();
   formData.append("hotelName", data.hotelName);
   formData.append("businessType", data.businessType);
   formData.append("place", data.place);
   formData.append("address", data.address);
   formData.append("latitude", data.latitude.toString());
   formData.append("longitude", data.longitude.toString());
   formData.append("hotelImage", data.hotelImage);
   const response = await api.post<ApiResponse<Hotel>>(API_ROUTES.VENDOR.HOTELS, formData);
   return response.data;
};

export const getVendorHotels = async (): Promise<ApiResponse<Hotel[]>> => {
    const response = await api.get<ApiResponse<Hotel[]>>(API_ROUTES.VENDOR.HOTELS);
    return response.data;
};

export const getHotelById = async (hotelId: string): Promise<ApiResponse<Hotel>> => {
    const response = await api.get<ApiResponse<Hotel>>(API_ROUTES.VENDOR.HOTEL_BY_ID(hotelId));
    return response.data;
};