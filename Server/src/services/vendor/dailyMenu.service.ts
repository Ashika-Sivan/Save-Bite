import { Types } from "mongoose";
import { IAddDailyMenuItemDTO, ICreateDailyMenuDTO, IDailyMenuResponseDTO, IUpdateDailyMenuItemDTO, IUpdatePickupWindowDTO } from "../../dtos/dailyMenu.dto";
import { IDailyMenuItemCreateData, IDailyMenuRepository } from "../../interfaces/repository/IDailyMenuRepository";
import { IHotelRepository } from "../../interfaces/repository/IHotelRepository";
import { IVendorRepository } from "../../interfaces/repository/IVendorRepository";
import { IDailyMenuService } from "../../interfaces/service/vendor/IDailyMenuService";
import { AppError } from "../../errors/AppError";
import { StatusCode } from "../../constants/statusCode";
import { VendorStatus } from "../../interfaces/models/IVendor.model";
import { IDailyMenu, MenuUnitType } from "../../interfaces/models/IDailyMenu.model";
import { getSignedS3Url } from "../../utils/getSignedS3Url";
import { DAILY_MENU_MESSAGES } from "../../constants/messages";
import { uploadToS3 } from "../../utils/uploadToS3";
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

            const existingMenu =
            await this._dailyMenuRepository
                .findTodayMenuByHotel(
                    hotelId,
                    vendor._id,
                    todayStart,
                    tomorrowStart
                )

        if(existingMenu){
            throw new AppError(
                "today's menu already exists for this hotel",
                StatusCode.BAD_REQUEST
            )
        }

    if(pickupStartTime<todayStart||pickupStartTime>=tomorrowStart||pickupEndTime>tomorrowStart){
        throw new AppError( "Pickup window must be for today",StatusCode.BAD_REQUEST)
    }

    const now=new Date()
    if(pickupStartTime<=now){
        throw new AppError("pickup start time is must be in the future",StatusCode.BAD_REQUEST)
    }

    const cutoffTime=new Date(pickupEndTime.getTime()-30*60*1000)
    if(now>=cutoffTime){
        throw new AppError("Pickup end time must be more than 30 minutes from now",StatusCode.BAD_REQUEST)
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
    private async toResponseDTO(
        menu: IDailyMenu
    ): Promise<IDailyMenuResponseDTO> {
        const items = await Promise.all(
            menu.items.map(async (item) => {
                const itemImageUrl =
                    item.itemImageKey
                        ? await getSignedS3Url(
                              item.itemImageKey
                          )
                        : "";

                return {
                    id: item._id.toString(),
                    itemName: item.itemName,
                    itemImageUrl,
                    unitType: item.unitType,
                    originalPrice: item.originalPrice,
                    discountedPrice:
                        item.discountedPrice,
                    stockQuantity:
                        item.stockQuantity,
                    isAvailable: item.isAvailable,
                };
            })
        );

        return {
            id: menu._id.toString(),
            vendorId: menu.vendorId.toString(),
            hotelId: menu.hotelId.toString(),
            menuDate: menu.menuDate.toISOString(),

            pickupWindow: {
                startTime:
                    menu.pickupWindow.startTime
                        .toISOString(),

                endTime:
                    menu.pickupWindow.endTime
                        .toISOString(),
            },

            items,
            isLive: menu.isLive,
            createdAt: menu.createdAt.toISOString(),
            updatedAt: menu.updatedAt.toISOString(),
        };
    }


async addMenuItem(
    ownerId: string,
    menuId: string,
    data: IAddDailyMenuItemDTO,
      imageFile: Express.Multer.File
): Promise<IDailyMenuResponseDTO> {
    if (!Types.ObjectId.isValid(menuId)) {
        throw new AppError(
            "Invalid menu ID",
            StatusCode.BAD_REQUEST
        );
    }

    if(!imageFile){
        throw new AppError(DAILY_MENU_MESSAGES.INVALID_ID,StatusCode.BAD_REQUEST)
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
    /*
    form data send normal field as string.therefor convert the numeric field first
    */

    const itemName = data.itemName?.trim();
    const originalPrice=Number(data.originalPrice)
    const discountedPrice=Number(data.discountedPrice)
    const stockQuantity=Number(data.stockQuantity)


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
        !Number.isFinite(originalPrice) ||
        !Number.isFinite(discountedPrice)
    ) {
        throw new AppError(
            "Prices must be valid numbers",
            StatusCode.BAD_REQUEST
        );
    }

    if (originalPrice <= 0 ||discountedPrice <= 0){
        throw new AppError(
            "Prices must be greater than zero",
            StatusCode.BAD_REQUEST
        );
    }

    if (discountedPrice >= originalPrice ) {
        throw new AppError(
            "Discounted price must be lower than the original price",
            StatusCode.BAD_REQUEST
        );
    }

    if ( !Number.isInteger(stockQuantity)||stockQuantity <= 0 ){
        throw new AppError(
            "Stock quantity must be a positive whole number",
            StatusCode.BAD_REQUEST
        );
    }

    const uploadResult =await uploadToS3(imageFile,"menu-items");
    const itemImageKey=uploadResult.key
    const itemData:IDailyMenuItemCreateData={
        itemName,itemImageKey,unitType:data.unitType,originalPrice,discountedPrice,stockQuantity,isAvailable:true
    }

    const updatedMenu =
        await this._dailyMenuRepository.addItem(
            menuId,
            vendor._id,
            itemData
        );

    if (!updatedMenu) {
        throw new AppError(
            "Menu not found or access denied",
            StatusCode.NOT_FOUND
        );
    }

    return await this.toResponseDTO(updatedMenu);
}

async goLive(ownerId: string,menuId: string): Promise<IDailyMenuResponseDTO> {
    if (!Types.ObjectId.isValid(menuId)) {
        throw new AppError( "Invalid menu ID", StatusCode.BAD_REQUEST );  
    }
    const vendor =await this._vendorRepository .findByOwnerId(ownerId);
        
    if (!vendor) {
        throw new AppError("Vendor account not found", StatusCode.NOT_FOUND);  
    }

    if (
        vendor.status !==
        VendorStatus.APPROVED
    ) {
        throw new AppError(
            "Only approved vendors can go live",
            StatusCode.FORBIDDEN
        );
    }

    const menu =
        await this._dailyMenuRepository
            .findByIdAndVendorId(
                menuId,
                vendor._id
            );

    if (!menu) {
        throw new AppError(
            "Menu not found or access denied",
            StatusCode.NOT_FOUND
        );
    }

    if (menu.isLive) {
        throw new AppError(
            "Menu is already live",
            StatusCode.BAD_REQUEST
        );
    }

    const hotel =
        await this._hotelRepository
            .findByIdAndVendorId(
                menu.hotelId.toString(),
                vendor._id.toString()
            );

    if (!hotel || !hotel.isActive) {
        throw new AppError(
            "Cannot go live with an inactive hotel",
            StatusCode.BAD_REQUEST
        );
    }

    const hasAvailableItem =
        menu.items.some(
            (item) =>
                item.isAvailable &&
                item.stockQuantity > 0
        );

    if (!hasAvailableItem) {
        throw new AppError(
            "Add at least one available item with stock before going live",
            StatusCode.BAD_REQUEST
        );
    }

    const currentTime = new Date();

    if (
        currentTime <
        menu.pickupWindow.startTime
    ) {
        throw new AppError(
            "Cannot go live before the configured food availability time",
            StatusCode.BAD_REQUEST
        );
    }
    const cutoffTime = new Date(
        menu.pickupWindow.endTime.getTime() -
            30 * 60 * 1000
    );

    if (currentTime >= cutoffTime) {
        throw new AppError(
            "Cannot go live because ordering has already closed",
            StatusCode.BAD_REQUEST
        );
    }

    const updatedMenu =
        await this._dailyMenuRepository
            .updateLiveStatus(
                menuId,
                vendor._id,
                true
            );

    if (!updatedMenu) {
        throw new AppError(
            "Unable to update menu live status",
            StatusCode.NOT_FOUND
        );
    }

    return await this.toResponseDTO(
        updatedMenu
    );
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

async updatePickupWindow(
    ownerId: string,
    menuId: string,
    data: IUpdatePickupWindowDTO
): Promise<IDailyMenuResponseDTO> {

    if(!Types.ObjectId.isValid(menuId)){
        throw new AppError(
            "invalid menu id",
            StatusCode.BAD_REQUEST
        )
    }

    const vendor=
        await this._vendorRepository
            .findByOwnerId(ownerId)

    if(!vendor){
        throw new AppError(
            "vendor account not found",
            StatusCode.NOT_FOUND
        )
    }

    if(vendor.status !== VendorStatus.APPROVED){
        throw new AppError(
            "only approved vendors can update the pickup window",
            StatusCode.FORBIDDEN
        )
    }

    const menu=
        await this._dailyMenuRepository
            .findByIdAndVendorId(
                menuId,
                vendor._id
            )

    if(!menu){
        throw new AppError(
            "menu not found or access denied",
            StatusCode.NOT_FOUND
        )
    }

    if(menu.isLive){
        throw new AppError(
            "end the live session before changing the pickup window",
            StatusCode.BAD_REQUEST
        )
    }

    if(!data){
        throw new AppError(
            "pickup-window data is required",
            StatusCode.BAD_REQUEST
        )
    }

    const pickupStartTime=
        new Date(data.pickupStartTime)

    const pickupEndTime=
        new Date(data.pickupEndTime)

    if(
        Number.isNaN(
            pickupStartTime.getTime()
        ) ||
        Number.isNaN(
            pickupEndTime.getTime()
        )
    ){
        throw new AppError(
            "invalid pickup time",
            StatusCode.BAD_REQUEST
        )
    }

    if(pickupStartTime >= pickupEndTime){
        throw new AppError(
            "pickup end time must be after the start time",
            StatusCode.BAD_REQUEST
        )
    }

    const now=new Date()

    const startOfDay=new Date()
    startOfDay.setHours(0,0,0,0)

    const endOfDay=new Date(startOfDay)
    endOfDay.setDate(
        endOfDay.getDate()+1
    )

    if(
        pickupStartTime < startOfDay ||
        pickupStartTime >= endOfDay ||
        pickupEndTime > endOfDay
    ){
        throw new AppError(
            "pickup window must end by midnight",
            StatusCode.BAD_REQUEST
        )
    }

    /*
     * Ordering closes 30 minutes
     * before pickup closes.
     */
    const cutoffTime=new Date(
        pickupEndTime.getTime() -
        30*60*1000
    )

    if(pickupStartTime >= cutoffTime){
        throw new AppError(
            "food availability time must be before the order cutoff time",
            StatusCode.BAD_REQUEST
        )
    }

    if(now >= cutoffTime){
        throw new AppError(
            "pickup closing time must be more than 30 minutes from now",
            StatusCode.BAD_REQUEST
        )
    }

    const updatedMenu=
        await this._dailyMenuRepository
            .updatePickupWindow(
                menuId,
                vendor._id,
                {
                    startTime:pickupStartTime,
                    endTime:pickupEndTime
                }
            )

    if(!updatedMenu){
        throw new AppError(
            "unable to update the pickup window",
            StatusCode.BAD_REQUEST
        )
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
 async usePreviousMenu(ownerId:string,menuId:string):Promise<IDailyMenuResponseDTO>{
    if(!Types.ObjectId.isValid(menuId)){
        throw new AppError("invalid menu id",StatusCode.BAD_REQUEST)
    }

    const vendor=await this._vendorRepository.findByOwnerId(ownerId)
    if(!vendor){
        throw new AppError("vendor account not found",StatusCode.NOT_FOUND)
    }

    if(vendor.status!==VendorStatus.APPROVED){
        throw new AppError("only approved vendor can use a previous menu",StatusCode.FORBIDDEN)
    }

    const currentMenu=await this._dailyMenuRepository.findByIdAndVendorId(menuId,vendor._id)
    if(!currentMenu){
        throw new AppError("Todays menu not found or access denied",StatusCode.NOT_FOUND)
    }
    if(currentMenu.isLive){
        throw new AppError("End the live menu before using a previous menu",StatusCode.NOT_FOUND)
    }
    if(currentMenu.items.length>0){
        throw new AppError("previous menu can only be used when todays menu is empty")
    }

    const previousMenu=await this._dailyMenuRepository.findLatestMenuBeforeDate(currentMenu.hotelId,vendor._id,currentMenu.menuDate)
    if(!previousMenu){
        throw new AppError("No previous menu is available for this hotel",StatusCode.NOT_FOUND)
    }

    const copiedItem:IDailyMenuItemCreateData[]=previousMenu.items.filter((item)=>Boolean(item.itemImageKey)).map((item)=>({
        itemName:item.itemName,
        itemImageKey:item.itemImageKey,
        unitType:item.unitType,
        originalPrice:item.originalPrice,
        discountedPrice:item.discountedPrice,
        stockQuantity:0,
        isAvailable:false
    }))
    if(copiedItem.length===0){
        throw new AppError("the prebious menu has no reusable item with food image",StatusCode.BAD_REQUEST)
    }

    const updatedMenu=await this._dailyMenuRepository.setItemIfEmpty(menuId,vendor._id,copiedItem);

    if(!updatedMenu){
        throw new AppError("unable to use the previous menu .Make sure todays menu is empty and offline")

    }
    return await this.toResponseDTO(updatedMenu)
        


 }  
   
}