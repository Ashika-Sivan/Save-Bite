export interface HotelLocation {
    type: "Point";
    coordinates: [number, number];
}

export interface Hotel {
    _id: string;
    vendorId: string;
    hotelName: string;
    businessType: string;
    hotelImageUrl: string;
    place: string;
    address: string;
    location: HotelLocation;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateHotelData {
    hotelName: string;
    businessType: string;
    place: string;
    address: string;
    latitude: number;
    longitude: number;
    hotelImage: File;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}