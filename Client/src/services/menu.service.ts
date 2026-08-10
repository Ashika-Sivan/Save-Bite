import api from "./api";
import { API_ROUTES } from "../constants/apiRoutes";

export type MenuUnitType =
    | "full"
    | "half"
    | "quarter"
    | "piece"
    | "number";

export interface DailyMenuItem {
    id: string;
    itemName: string;
     itemImageUrl: string;
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
     itemImage: File;
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

export const getTodayMenu = async (hotelId: string): Promise<ApiResponse<DailyMenu | null>> => {
    const response = await api.get<ApiResponse<DailyMenu | null>>(
        API_ROUTES.VENDOR.GET_TODAY_MENU(hotelId)
    );
    return response.data;
};

export const createDailyMenu = async (hotelId: string, data: CreateDailyMenuData): Promise<ApiResponse<DailyMenu>> => {
    const response = await api.post<ApiResponse<DailyMenu>>(
        API_ROUTES.VENDOR.CREATE_DAILY_MENU(hotelId),
        data
    );
    return response.data;
};

export const addDailyMenuItem = async (menuId: string, data: AddDailyMenuItemData): Promise<ApiResponse<DailyMenu>> => {
    const formData=new FormData();
    formData.append("itemName",data.itemName)
    formData.append("itemImage",data.itemImage)
    formData.append("unitType",data.unitType)
    formData.append("originalPrice",data.originalPrice.toString())
    formData.append("discountedPrice",data.discountedPrice.toString())
    formData.append("stockQuantity",data.stockQuantity.toString())

    const response = await api.post<ApiResponse<DailyMenu>>(
        API_ROUTES.VENDOR.ADD_DAILY_MENU_ITEM(menuId),
        formData
    );
    return response.data;
};

export const updatePickupWindow = async (menuId: string, data: CreateDailyMenuData): Promise<ApiResponse<DailyMenu>> => {
    const response = await api.patch<ApiResponse<DailyMenu>>(
        API_ROUTES.VENDOR.UPDATE_PICKUP_WINDOW(menuId),
        data
    );
    return response.data;
};

export const goLive = async (menuId: string): Promise<ApiResponse<DailyMenu>> => {
    const response = await api.patch<ApiResponse<DailyMenu>>(
        API_ROUTES.VENDOR.GO_LIVE(menuId)
    );
    return response.data;
};

export const endLive = async (menuId: string): Promise<ApiResponse<DailyMenu>> => {
    const response = await api.patch<ApiResponse<DailyMenu>>(
        API_ROUTES.VENDOR.END_LIVE(menuId)
    );
    return response.data;
};

export const updateDailyMenuItem = async (menuId: string, itemId: string, data: UpdateDailyMenuItemData): Promise<ApiResponse<DailyMenu>> => {
    const response = await api.patch<ApiResponse<DailyMenu>>(
        API_ROUTES.VENDOR.UPDATE_DAILY_MENU_ITEM(menuId, itemId),
        data
    );
    return response.data;
};
export const usePreviousMenu=async(menuId:string):Promise<ApiResponse<DailyMenu>>=>{
    const response=await api.post<ApiResponse<DailyMenu>>(API_ROUTES.VENDOR.USE_PREVIOUS_MENU(menuId))
    return response.data
}
