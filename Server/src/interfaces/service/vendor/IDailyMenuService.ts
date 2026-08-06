import { IAddDailyMenuItemDTO, ICreateDailyMenuDTO, IDailyMenuResponseDTO, IUpdateDailyMenuItemDTO, IUpdatePickupWindowDTO } from "../../../dtos/dailyMenu.dto";

export interface IDailyMenuService{
    createMenu(ownerId:string,hotelId:string,data:ICreateDailyMenuDTO):Promise<IDailyMenuResponseDTO>
    addMenuItem(ownerId:string,menuId:string,data:IAddDailyMenuItemDTO):Promise<IDailyMenuResponseDTO>
    goLive(ownerId:string,menuId:string):Promise<IDailyMenuResponseDTO>
    getTodayMenu(ownerId:string,hotelId:string):Promise<IDailyMenuResponseDTO|null>   
    endLive(ownerId:string,menuId:string):Promise<IDailyMenuResponseDTO>
    updatePickupWindow(ownerId:string,menuId:string,data:IUpdatePickupWindowDTO):Promise<IDailyMenuResponseDTO>
    updateMenuItem(ownerId:string,menuId:string,itemId:string,data:IUpdateDailyMenuItemDTO):Promise<IDailyMenuResponseDTO>

}