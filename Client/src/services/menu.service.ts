import api from "./api";

export type MenuUnitType =
    | "full"
    | "half"
    | "quarter"
    | "piece"
    | "number";


    export interface DailyMenuItem {
    id: string;
    itemName: string;
    unitType: MenuUnitType;
    originalPrice: number;
    discountedPrice: number;
    stockQuantity: number;
    isAvailable: boolean;
}

export interface DailyMenu {
    id: string;
    vendorId: string;
    hotelId: string;
    menuDate: string;
    pickupWindow: {
        startTime: string;
        endTime: string;
    };
    items: DailyMenuItem[];
    isLive: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface CreateDailyMenuData {
    pickupStartTime: string;
    pickupEndTime: string;
}

export interface AddDailyMenuItemData {
    itemName: string;
    unitType: MenuUnitType;
    originalPrice: number;
    discountedPrice: number;
    stockQuantity: number;
}
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}
export interface UpdateDailyMenuItemData {
    itemName?: string;
    unitType?: MenuUnitType;
    originalPrice?: number;
    discountedPrice?: number;
    stockQuantity?: number;
    isAvailable?: boolean;
}

export const getTodayMenu=async(hotelId:string):Promise<ApiResponse<DailyMenu|null>>=>{
    const response = await api.get<ApiResponse<DailyMenu | null>>(
        `/vendor/hotels/${hotelId}/daily-menu/today`
    )
    return response.data
}

export const createDailyMenu=async(hotelId:string,data:CreateDailyMenuData):Promise<ApiResponse<DailyMenu>>=>{
    const response=await api.post<ApiResponse<DailyMenu>>(`/vendor/hotels/${hotelId}/daily-menu`,data)
    return response.data
}
export const addDailyMenuItem = async ( menuId: string,data: AddDailyMenuItemData): Promise<ApiResponse<DailyMenu>> => {
     const response = await api.post<ApiResponse<DailyMenu>>( `/vendor/daily-menus/${menuId}/items`,data);
     return response.data
}
export const updatePickupWindow  = async ( menuId: string,data: CreateDailyMenuData): Promise<ApiResponse<DailyMenu>> => {
     const response = await api.patch<ApiResponse<DailyMenu>>( `/vendor/daily-menus/${menuId}/pickup-window`,data);
     return response.data
}
export const goLive = async ( menuId: string): Promise<ApiResponse<DailyMenu>> => {
     const response = await api.patch<ApiResponse<DailyMenu>>( `/vendor/daily-menus/${menuId}/go-live`);
     return response.data
}
export const endLive  = async ( menuId: string): Promise<ApiResponse<DailyMenu>> => {
     const response = await api.patch<ApiResponse<DailyMenu>>( `/vendor/daily-menus/${menuId}/end-live`);
     return response.data
}
export const updateDailyMenuItem=async(menuId:string,itemId:string,data:UpdateDailyMenuItemData):Promise<ApiResponse<DailyMenu>>=>{
    const response=await api.patch<ApiResponse<DailyMenu>>(`/vendor/daily-menus/${menuId}/items/${itemId}`,data)
    return response.data
}



