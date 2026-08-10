import { Types } from "mongoose";
import { IDailyMenu, MenuUnitType } from "../models/IDailyMenu.model";
import { IDailyMenuItemUpdateData } from "../../dtos/dailyMenu.dto";

export interface IDailyMenuCreateData{//database ready data
    vendorId:Types.ObjectId;
    hotelId:Types.ObjectId;
    menuDate:Date;
    pickupWindow:{
        startTime:Date;
        endTime:Date;
    }
}
export interface IPickupWindowUpdateData {
    startTime: Date;
    endTime: Date;
}
export interface IDailyMenuItemCreateData {
    itemName: string;
     itemImageKey: string;
    unitType:MenuUnitType;
    originalPrice: number;
    discountedPrice: number;
    stockQuantity: number;
    isAvailable: boolean;
}

export interface IDailyMenuRepository{//it is for repository
    createMenu(data:IDailyMenuCreateData):Promise<IDailyMenu>
    addItem(menuId:string,vendorId:Types.ObjectId,data:IDailyMenuItemCreateData):Promise<IDailyMenu|null>
    findByIdAndVendorId(menuId:string,vendorId:Types.ObjectId):Promise<IDailyMenu|null>
    updateLiveStatus(menuId:string,vendorId:Types.ObjectId,isLive:boolean):Promise<IDailyMenu|null>
    findTodayMenuByHotel(hotelId:string,vendorId:Types.ObjectId,startOfDay:Date,endOfDay:Date):Promise<IDailyMenu|null>
    updatePickupWindow(menuId:string,vendorId:Types.ObjectId,pickupWindow:IPickupWindowUpdateData):Promise<IDailyMenu|null>;
    updateItem(menuId:string,itemId:string,vendorId:Types.ObjectId,data:IDailyMenuItemUpdateData):Promise<IDailyMenu|null>
    findLatestMenuBeforeDate(hotelId:Types.ObjectId,vendorId:Types.ObjectId,beforeDate:Date):Promise<IDailyMenu|null>
    setItemIfEmpty(menuId:string,vendorId:Types.ObjectId,items:IDailyMenuItemCreateData[]):Promise<IDailyMenu|null>
       
    
}