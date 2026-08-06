import { Types } from "mongoose";
import { IAddDailyMenuItemDTO, ICreateDailyMenuDTO, IDailyMenuResponseDTO, IUpdateDailyMenuItemDTO, IUpdatePickupWindowDTO } from "../../dtos/dailyMenu.dto";
import { IDailyMenuRepository } from "../../interfaces/repository/IDailyMenuRepository";
import { IHotelRepository } from "../../interfaces/repository/IHotelRepository";
import { IVendorRepository } from "../../interfaces/repository/IVendorRepository";
import { IDailyMenuService } from "../../interfaces/service/vendor/IDailyMenuService";
import { AppError } from "../../errors/AppError";
import { StatusCode } from "../../constants/statusCode";
import { VendorStatus } from "../../interfaces/models/IVendor.model";
import { IDailyMenu, MenuUnitType } from "../../interfaces/models/IDailyMenu.model";
import App from "../../app";

export class DailyMenuService implements IDailyMenuService{
    constructor(
        private readonly _dailyMenuRepository:IDailyMenuRepository,
        private readonly _hotelRepository:IHotelRepository,
        private readonly _vendorRepository:IVendorRepository

    ){}

   async createMenu(ownerId: string, hotelId: string, data: ICreateDailyMenuDTO): Promise<IDailyMenuResponseDTO> {
       if(!Types.ObjectId.isValid(hotelId)){
        throw new AppError("invalid hotel id",StatusCode.BAD_REQUEST)
       }

       const vendor=await this._vendorRepository.findByOwnerId(ownerId)
       if(!vendor){
        throw new AppError("vendor account not found",StatusCode.NOT_FOUND)

       }

       if(vendor.status!==VendorStatus.APPROVED){
        throw new AppError("only approved vendor can create a menu",StatusCode.FORBIDDEN)
       }

       const hotel=await this._hotelRepository.findByIdAndVendorId(hotelId,vendor._id.toString())
       if(!hotel){
        throw new AppError("Hotel not found or access denied ",StatusCode.NOT_FOUND)
       }

       if(!hotel.isActive){
        throw new AppError("cannot create menu for inactive hotels",StatusCode.BAD_REQUEST)
       }

       const pickupStartTime=new Date(data.pickupStartTime)
       const pickupEndTime=new Date(data.pickupEndTime)

       if(Number.isNaN(pickupStartTime.getTime())||Number.isNaN(pickupEndTime.getTime())){
        throw new AppError("invalid pickup time",StatusCode.BAD_REQUEST)
       }

       if(pickupStartTime>=pickupEndTime){
        throw new AppError("pickup end time must be after the start time",StatusCode.BAD_REQUEST)

       }

       const todayStart=new Date();//current date:-Aug 3,2026-6.30 pm
       todayStart.setHours(0,0,0,0)//Aug 3,2026-12.00 am(change time to mid night)this is actually exact beginig of today


       const tomorrowStart=new Date(todayStart);//which is to find the begining of tomorrow.
       tomorrowStart.setDate(tomorrowStart.getDate()+1)//current day + next day:-aug-3 to aug-4

    if(pickupStartTime<todayStart||pickupStartTime>=tomorrowStart||pickupEndTime>tomorrowStart){
        throw new AppError( "Pickup window must be for today",StatusCode.BAD_REQUEST)
    }

    if(pickupEndTime<=new Date()){
        throw new AppError("pickup window has already ended",StatusCode.BAD_REQUEST)
    }

    const menu=await this._dailyMenuRepository.createMenu({
        vendorId:vendor._id,
        hotelId:hotel._id,
        menuDate:todayStart,
        pickupWindow:{
            startTime:pickupStartTime,
            endTime:pickupEndTime
        }
    })
    return this.toResponseDTO(menu)
   }

    private toResponseDTO(
        menu: IDailyMenu
    ): IDailyMenuResponseDTO {
        return {
            id: menu._id.toString(),
            vendorId: menu.vendorId.toString(),
            hotelId: menu.hotelId.toString(),
            menuDate: menu.menuDate.toISOString(),

            pickupWindow: {
                startTime:
                    menu.pickupWindow.startTime.toISOString(),

                endTime: 
                    menu.pickupWindow.endTime.toISOString(),
            },

            items: menu.items.map((item) => ({
                id: item._id.toString(),
                itemName: item.itemName,
                unitType: item.unitType,
                originalPrice: item.originalPrice,
                discountedPrice:
                    item.discountedPrice,
                stockQuantity: item.stockQuantity,
                isAvailable: item.isAvailable,
            })),

            isLive: menu.isLive,
            createdAt: menu.createdAt.toISOString(),
            updatedAt: menu.updatedAt.toISOString(),
        };
    }
async addMenuItem(
    ownerId: string,
    menuId: string,
    data: IAddDailyMenuItemDTO
): Promise<IDailyMenuResponseDTO> {
    if (!Types.ObjectId.isValid(menuId)) {
        throw new AppError(
            "Invalid menu ID",
            StatusCode.BAD_REQUEST
        );
    }

    const vendor =
        await this._vendorRepository.findByOwnerId(
            ownerId
        );

    if (!vendor) {
        throw new AppError(
            "Vendor account not found",
            StatusCode.NOT_FOUND
        );
    }

    if (vendor.status !== VendorStatus.APPROVED) {
        throw new AppError(
            "Only approved vendors can add menu items",
            StatusCode.FORBIDDEN
        );
    }

    const itemName = data.itemName.trim();

    if (!itemName) {
        throw new AppError(
            "Item name is required",
            StatusCode.BAD_REQUEST
        );
    }

    if (
        !Object.values(MenuUnitType).includes(
            data.unitType
        )
    ) {
        throw new AppError(
            "Invalid menu unit type",
            StatusCode.BAD_REQUEST
        );
    }

    if (
        !Number.isFinite(data.originalPrice) ||
        !Number.isFinite(data.discountedPrice)
    ) {
        throw new AppError(
            "Prices must be valid numbers",
            StatusCode.BAD_REQUEST
        );
    }

    if (
        data.originalPrice <= 0 ||
        data.discountedPrice <= 0
    ) {
        throw new AppError(
            "Prices must be greater than zero",
            StatusCode.BAD_REQUEST
        );
    }

    if (
        data.discountedPrice >=
        data.originalPrice
    ) {
        throw new AppError(
            "Discounted price must be lower than the original price",
            StatusCode.BAD_REQUEST
        );
    }

    if (
        !Number.isInteger(data.stockQuantity) ||
        data.stockQuantity <= 0
    ) {
        throw new AppError(
            "Stock quantity must be a positive whole number",
            StatusCode.BAD_REQUEST
        );
    }

    const updatedMenu =
        await this._dailyMenuRepository.addItem(
            menuId,
            vendor._id,
            {
                itemName,
                unitType: data.unitType,
                originalPrice: data.originalPrice,
                discountedPrice:
                    data.discountedPrice,
                stockQuantity: data.stockQuantity,
                isAvailable: true,
            }
        );

    if (!updatedMenu) {
        throw new AppError(
            "Menu not found or access denied",
            StatusCode.NOT_FOUND
        );
    }

    return this.toResponseDTO(updatedMenu);
}

async goLive(ownerId: string, menuId: string): Promise<IDailyMenuResponseDTO> {
    if(!Types.ObjectId.isValid(menuId)){
        throw new AppError("invalid menu id",StatusCode.BAD_REQUEST)
    }
    const vendor=await this._vendorRepository.findByOwnerId(ownerId)
    if(!vendor){
        throw new AppError("vendor account not found",StatusCode.NOT_FOUND)
    }
    if(vendor.status!==VendorStatus.APPROVED){
        throw new AppError("only approved vendor can go live",StatusCode.FORBIDDEN)
    }

    const menu=await this._dailyMenuRepository.findByIdAndVendorId(menuId,vendor._id)
    if(!menu){
        throw new AppError("menu not found or access denied",StatusCode.NOT_FOUND)
    }
    const hotel=await this._hotelRepository.findByIdAndVendorId(menu.hotelId.toString(),vendor._id.toString())
    if(!hotel ||!hotel.isActive){
        throw new AppError("cannot go live with an inactive hotel",StatusCode.BAD_REQUEST)
    }

    const hasAvailableItem=menu.items.some((item)=>item.isAvailable && item.stockQuantity>0)
    if(!hasAvailableItem){
        throw new AppError("add atleast one available item with stock before going live",StatusCode.BAD_REQUEST)
    }

    const currentTime=new Date()
    const cutoffTime=new Date(menu.pickupWindow.endTime.getTime()-30*60*1000);
    if(currentTime>=cutoffTime){
        throw new AppError("cannot go live after the order cutof time",StatusCode.BAD_REQUEST)
    }

    const updatedMenu=await this._dailyMenuRepository.updateLiveStatus(menuId,vendor._id,true);
    if(!updatedMenu){
        throw new AppError("unable to update menu live status",StatusCode.NOT_FOUND)
    }
    return this.toResponseDTO(updatedMenu)
}
  async getTodayMenu(ownerId: string, hotelId: string): Promise<IDailyMenuResponseDTO | null> {
        if(!Types.ObjectId.isValid(hotelId)){
            throw new AppError("invalid hotel id",StatusCode.BAD_REQUEST)
        }
        const vendor=await this._vendorRepository.findByOwnerId(ownerId)
        if(!vendor){
            throw new AppError('vendor account not found',StatusCode.NOT_FOUND)
        }
        if(vendor.status!==VendorStatus.APPROVED){
            throw new AppError("Only approveed vendor can view daily menu",StatusCode.FORBIDDEN)
        }
        const hotel=await this._hotelRepository.findByIdAndVendorId(hotelId,vendor._id.toString())
        if(!hotel){
            throw new AppError("hotel not found or access denied",StatusCode.NOT_FOUND)
        }

        const startOfDay=new Date()
        startOfDay.setHours(0,0,0,0)


        const endOfDay=new Date(startOfDay)
        endOfDay.setDate(endOfDay.getDate()+1)

        const menu=await this._dailyMenuRepository.findTodayMenuByHotel(hotelId,vendor._id,startOfDay,endOfDay);

        if(!menu){
            return null
        }
         return this.toResponseDTO(menu)
    
    }
    async endLive(ownerId: string, menuId: string): Promise<IDailyMenuResponseDTO> {
        if(!Types.ObjectId.isValid(menuId)){
            throw new AppError("invalid menu ID",StatusCode.BAD_REQUEST)
        }
        const vendor=await this._vendorRepository.findByOwnerId(ownerId)
        if(!vendor){
            throw new AppError("vendor account not found",StatusCode.NOT_FOUND)
        }
        if(vendor.status!==VendorStatus.APPROVED){
            throw new AppError("only approved vendor can make live menu ")
        }

        const menu=await this._dailyMenuRepository.findByIdAndVendorId(menuId,vendor._id)
        if(!menu){
            throw new AppError("Menu not found or access denied",StatusCode.NOT_FOUND)
        }

        if(!menu.isLive){
            throw new AppError("Menu is already offline",StatusCode.BAD_REQUEST)
        }
        const updatedMenu=await this._dailyMenuRepository.updateLiveStatus(menuId,vendor._id,false)
        if(!updatedMenu){
            throw new AppError("unble to end menu live status",StatusCode.NOT_FOUND)
        }
        return this.toResponseDTO(updatedMenu)
    }

    async updatePickupWindow(ownerId: string, menuId: string, data: IUpdatePickupWindowDTO): Promise<IDailyMenuResponseDTO> {
        if(!Types.ObjectId.isValid(menuId)){
            throw new AppError("invalid menu id",StatusCode.BAD_REQUEST)
        }

        const vendor=await this._vendorRepository.findByOwnerId(ownerId)
        if(!vendor){
            throw new AppError("vendor account not found",StatusCode.NOT_FOUND)
        }
         if (vendor.status !== VendorStatus.APPROVED) {
            throw new AppError(
                "Only approved vendors can update the pickup window",
                StatusCode.FORBIDDEN
            );

         }
         const menu=await this._dailyMenuRepository.findByIdAndVendorId(menuId,vendor._id)
         if(!menu){
            throw new AppError(  "Menu not found or access denied",StatusCode.NOT_FOUND)
        }

        if(!menu.isLive){
            throw new AppError("End the live session before changing the pickup window",StatusCode.BAD_REQUEST)
        }

        if(!data){
            throw new AppError("pickup-window data is required",StatusCode.BAD_REQUEST)
        }
          const pickupStartTime = new Date(data.pickupStartTime);
          const pickupEndTime = new Date( data.pickupEndTime)

          if(Number.isNaN(pickupStartTime.getTime()) ||Number.isNaN(pickupEndTime.getTime())){
            throw new AppError("invalid pickup time",StatusCode.BAD_REQUEST)
          }

          if(pickupStartTime >= pickupEndTime){
             throw new AppError(  "Pickup end time must be after the start time",StatusCode.BAD_REQUEST);
         }



         const startOfDay=new Date()
         startOfDay.setHours(0,0,0,0)


         const endOfDay=new Date(startOfDay)
        endOfDay.setDate(endOfDay.getDate()+1)

        if(pickupStartTime < startOfDay ||pickupStartTime >= endOfDay ||pickupEndTime >= endOfDay){
            throw new AppError("pickup window must be for today",StatusCode.BAD_REQUEST)
        }

        const cutoffTime=new Date(pickupEndTime.getTime()-30*60*1000)

        if(new Date()>=cutoffTime){
            throw new AppError("pickup end time must be more than 30 minutes from now",StatusCode.BAD_REQUEST)
        }
        const updatedMenu=await this._dailyMenuRepository.updatePickupWindow(menuId,vendor._id,{startTime:pickupStartTime,endTime:pickupEndTime})
        if(!updatedMenu){
            throw new AppError("unable to update the pickup window",StatusCode.BAD_REQUEST)
        }
        return this.toResponseDTO(updatedMenu)

    }
    async updateMenuItem(ownerId: string, menuId: string, itemId: string, data: IUpdateDailyMenuItemDTO): Promise<IDailyMenuResponseDTO> {
        if(!Types.ObjectId.isValid(menuId)||!Types.ObjectId.isValid(itemId)){
            throw new AppError("invalid menu id",StatusCode.BAD_REQUEST)
        }

        if(!data||Object.keys(data).length===0){
            throw new AppError("Atleast one field is required",StatusCode.BAD_REQUEST)
        }

        const vendor=await this._vendorRepository.findByOwnerId(ownerId)
        if(!vendor){
            throw new AppError("vendor account not found",StatusCode.NOT_FOUND)
        }

        if(vendor.status!==VendorStatus.APPROVED){
            throw new AppError("Daily approved vendor can update menu item",StatusCode.FORBIDDEN)

        }
        const menu =await this._dailyMenuRepository.findByIdAndVendorId(
            menuId,
            vendor._id
        );
        

        if (!menu) {
            throw new AppError("Menu not found or access denied",  StatusCode.NOT_FOUND);    
            
        }

        const existingItem=menu.items.find((item)=>item._id.toString()==itemId)
        if (!existingItem) {
            throw new AppError(
                "Menu item not found",
                StatusCode.NOT_FOUND
            );
        }

         const updateData: IUpdateDailyMenuItemDTO = {
            ...data,
        };
         if (data.itemName !== undefined) {
                 const itemName = data.itemName.trim();

            if (!itemName) {
                throw new AppError(
                    "Item name cannot be empty",
                    StatusCode.BAD_REQUEST
                );
            }

            updateData.itemName = itemName;
        }

        if(data.unitType!==undefined && !Object.values(MenuUnitType).includes(data.unitType)){
            throw new AppError("invalid menu unit type",StatusCode.BAD_REQUEST)
        }

    const originalPrice = data.originalPrice ?? existingItem.originalPrice;
     const discountedPrice = data.discountedPrice ?? existingItem.discountedPrice;

     if(!Number.isFinite(originalPrice)||!Number.isFinite(discountedPrice)||originalPrice<=0||discountedPrice<=0){
        throw new AppError("price must be valud numbers greated than zero",StatusCode.BAD_REQUEST)
     }
       
     if(discountedPrice>=originalPrice){
        throw new AppError(  "Discounted price must be lower than the original price",StatusCode.BAD_REQUEST)
     }
      if (
        data.stockQuantity !== undefined &&
        (
            !Number.isInteger(data.stockQuantity) ||
            data.stockQuantity < 0
        )
    ) {
        throw new AppError(
            "Stock quantity must be a non-negative whole number",
            StatusCode.BAD_REQUEST
        );
    }

     if (
        data.isAvailable !== undefined &&
        typeof data.isAvailable !== "boolean"
    ) {
        throw new AppError(
            "Availability must be true or false",
            StatusCode.BAD_REQUEST
        );
    }
    /*
    here automatically mark  the item unavailable when stock becom e0
    */
       if (data.stockQuantity === 0) {
        updateData.isAvailable = false;
        }

        const updatedMenu=await this._dailyMenuRepository.updateItem(menuId,itemId,vendor._id,updateData)
        

        if (!updatedMenu) {
        throw new AppError(
            "Unable to update the menu item",
            StatusCode.NOT_FOUND
        );
    }
    return this.toResponseDTO(updatedMenu)





       
}
   
   
}