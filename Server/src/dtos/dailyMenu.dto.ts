/*
this dta accept whene vendor create todays menu and configure pickup window
*/

import { MenuUnitType } from "../interfaces/models/IDailyMenu.model";

export interface ICreateDailyMenuDTO{
    pickupStartTime:string;
    pickupEndTime:string
}
export interface IAddDailyMenuItemDTO{
    itemName:string;
    unitType:MenuUnitType;
    originalPrice:number;
    discountedPrice:number;
    stockQuantity:number
    
}
export interface IUpdateDailyMenuItemDTO{
    itemName?:string;
    unitType?:MenuUnitType;
    originalPrice?:number;
    discountedPrice?:number;
    stockQuantity?:number;
    isAvailable?:boolean
}

//response dto

export interface IDailyMenuItemResponseDTO {
    id: string;
    itemName: string;
    itemImageUrl:string;
    unitType: MenuUnitType;
    originalPrice: number;
    discountedPrice: number;
    stockQuantity: number;
    isAvailable: boolean;
    
}
export interface IDailyMenuResponseDTO{
    id:string;
    vendorId:string;
    hotelId:string;
    menuDate:string;
    pickupWindow:{
        startTime:string;
        endTime:string
    };
    items:IDailyMenuItemResponseDTO[];
    isLive:boolean;
    createdAt:string;
    updatedAt:string


}
export interface IUpdatePickupWindowDTO{
    pickupStartTime:string;
    pickupEndTime:string
}
export interface IDailyMenuItemUpdateData {
    itemName?: string;
    unitType?: MenuUnitType;
    originalPrice?: number;
    discountedPrice?: number;
    stockQuantity?: number;
    isAvailable?: boolean;
}
