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
import { DAILY_MENU_MESSAGES, VENDOR_MESSAGES, HOTEL_MESSAGES } from "../../constants/messages";
import { uploadToS3 } from "../../utils/uploadToS3";
import { toDailyMenuResponseDTO } from "../../mappers/dailyMenu.mapper";

import { IUserRepository } from "../../interfaces/repository/IUserRepository";
import { INotificationRepository } from "../../interfaces/repository/INotificationRepository";

export class DailyMenuService implements IDailyMenuService {
    constructor(
        private readonly _dailyMenuRepository: IDailyMenuRepository,
        private readonly _hotelRepository: IHotelRepository,
        private readonly _vendorRepository: IVendorRepository,
        private readonly _userRepository: IUserRepository,
        private readonly _notificationRepository: INotificationRepository
    ) { }

    async createMenu(ownerId: string, hotelId: string, data: ICreateDailyMenuDTO): Promise<IDailyMenuResponseDTO> {
        if (!Types.ObjectId.isValid(hotelId)) {
            throw new AppError(DAILY_MENU_MESSAGES.INVALID_HOTEL_ID, StatusCode.BAD_REQUEST)
        }

        const vendor = await this._vendorRepository.findByOwnerId(ownerId)
        if (!vendor) {
            throw new AppError(VENDOR_MESSAGES.VENDOR_NOT_FOUND, StatusCode.NOT_FOUND)

        }

        if (vendor.status !== VendorStatus.APPROVED) {
            throw new AppError(DAILY_MENU_MESSAGES.ONLY_APPROVED_VENDOR_CREATE, StatusCode.FORBIDDEN)
        }

        const hotel = await this._hotelRepository.findByIdAndVendorId(hotelId, vendor._id.toString())
        if (!hotel) {
            throw new AppError(HOTEL_MESSAGES.NOT_FOUND_OR_ACCESS_DENIED, StatusCode.NOT_FOUND)
        }

        if (!hotel.isActive) {
            throw new AppError(DAILY_MENU_MESSAGES.CANNOT_CREATE_FOR_INACTIVE, StatusCode.BAD_REQUEST)
        }

        const pickupStartTime = new Date(data.pickupStartTime)
        const pickupEndTime = new Date(data.pickupEndTime)

        if (Number.isNaN(pickupStartTime.getTime()) || Number.isNaN(pickupEndTime.getTime())) {
            throw new AppError(DAILY_MENU_MESSAGES.INVALID_PICKUP_TIME, StatusCode.BAD_REQUEST)
        }

        if (pickupStartTime >= pickupEndTime) {
            throw new AppError(DAILY_MENU_MESSAGES.END_TIME_AFTER_START, StatusCode.BAD_REQUEST)

        }

        const todayStart = new Date();//today
        todayStart.setHours(0, 0, 0, 0)

        const tomorrowStart = new Date(todayStart);
        tomorrowStart.setDate(tomorrowStart.getDate() + 1)//tomorrow

        const existingMenu =
            await this._dailyMenuRepository
                .findTodayMenuByHotel(
                    hotelId,
                    vendor._id,
                    todayStart,
                    tomorrowStart
                )

        if (existingMenu) {
            throw new AppError(
                "today's menu already exists for this hotel",
                StatusCode.BAD_REQUEST
            )
        }

        if (pickupStartTime < todayStart || pickupStartTime >= tomorrowStart || pickupEndTime > tomorrowStart) {
            throw new AppError(DAILY_MENU_MESSAGES.PICKUP_WINDOW_TODAY, StatusCode.BAD_REQUEST)
        }

        const now = new Date()
        if (pickupStartTime <= now) {
            throw new AppError(DAILY_MENU_MESSAGES.START_TIME_FUTURE, StatusCode.BAD_REQUEST)
        }

        const cutoffTime = new Date(pickupEndTime.getTime() - 30 * 60 * 1000)
        if (now >= cutoffTime) {
            throw new AppError(DAILY_MENU_MESSAGES.END_TIME_30_MINS, StatusCode.BAD_REQUEST)
        }

        const menu = await this._dailyMenuRepository.createMenu({
            vendorId: vendor._id,
            hotelId: hotel._id,
            menuDate: todayStart,
            pickupWindow: {
                startTime: pickupStartTime,
                endTime: pickupEndTime
            }
        })
        return toDailyMenuResponseDTO(menu)
    }

    async addMenuItem(ownerId: string,menuId: string,data: IAddDailyMenuItemDTO,imageFile: Express.Multer.File): Promise<IDailyMenuResponseDTO> {
        if (!Types.ObjectId.isValid(menuId)) {
            throw new AppError(
                DAILY_MENU_MESSAGES.INVALID_ID,
                StatusCode.BAD_REQUEST
            );
        }

        if (!imageFile) {
            throw new AppError(DAILY_MENU_MESSAGES.INVALID_ID, StatusCode.BAD_REQUEST)
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


        const itemName = data.itemName?.trim();
        const originalPrice = Number(data.originalPrice)
        const discountedPrice = Number(data.discountedPrice)
        const stockQuantity = Number(data.stockQuantity)


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

        if (originalPrice <= 0 || discountedPrice <= 0) {
            throw new AppError(
                "Prices must be greater than zero",
                StatusCode.BAD_REQUEST
            );
        }

        if (discountedPrice >= originalPrice) {
            throw new AppError(
                DAILY_MENU_MESSAGES.DISCOUNT_LOWER,
                StatusCode.BAD_REQUEST
            );
        }

        if (!Number.isInteger(stockQuantity) || stockQuantity <= 0) {
            throw new AppError(
                "Stock quantity must be a positive whole number",
                StatusCode.BAD_REQUEST
            );
        }

        const uploadResult = await uploadToS3(imageFile, "menu-items");
        const itemImageKey = uploadResult.key
        const itemData: IDailyMenuItemCreateData = {
            itemName, itemImageKey, unitType: data.unitType, originalPrice, discountedPrice, stockQuantity, isAvailable: true
        }

        const updatedMenu =
            await this._dailyMenuRepository.addItem(
                menuId,
                vendor._id,
                itemData
            );

        if (!updatedMenu) {
            throw new AppError(
                DAILY_MENU_MESSAGES.NOT_FOUND_OR_ACCESS_DENIED,
                StatusCode.NOT_FOUND
            );
        }

        return await toDailyMenuResponseDTO(updatedMenu);
    }

    async goLive(ownerId: string, menuId: string): Promise<IDailyMenuResponseDTO> {
        if (!Types.ObjectId.isValid(menuId)) {
            throw new AppError(DAILY_MENU_MESSAGES.INVALID_ID, StatusCode.BAD_REQUEST);
        }
        const vendor = await this._vendorRepository.findByOwnerId(ownerId);

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
                DAILY_MENU_MESSAGES.NOT_FOUND_OR_ACCESS_DENIED,
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


        try {
            const [longitude, latitude] = hotel.location.coordinates;
            // Find users within 5km 
            const nearbyUsers = await this._userRepository.findUsersWithinRadius(longitude, latitude, 5000);

            const { getIO, getUserSocketId } = await import("../../config/socket");
            const io = getIO();

            for (const user of nearbyUsers) {
                const socketId = await getUserSocketId(user._id.toString());
                const notificationTitle = "New Surplus Food Alert! 🍽️";
                const notificationBody = `${hotel.hotelName} just went live with surplus food near you!`;
                const notificationLink = `/customer/restaurants/${hotel._id}/menu`;

//save to persistnt db 
                await this._notificationRepository.create({
                    userId: user._id,
                    targetRole: "customer",
                    title: notificationTitle,
                    body: notificationBody,
                    type: "PROMOTIONAL",
                    link: notificationLink,
                    read: false
                });

                if (socketId) {
                    // Emit notification directly to the connected user
                    io.to(socketId).emit("business_live", {
                        title: notificationTitle,
                        body: notificationBody,
                        link: notificationLink,
                        hotelId: hotel._id,
                        vendorId: vendor._id
                    });
                }
            }
        } catch (err) {
            console.error("Failed to send live notifications:", err);
        }

        return await toDailyMenuResponseDTO(
            updatedMenu
        );
    }
    async getTodayMenu(ownerId: string, hotelId: string): Promise<IDailyMenuResponseDTO | null> {
        if (!Types.ObjectId.isValid(hotelId)) {
            throw new AppError(DAILY_MENU_MESSAGES.INVALID_HOTEL_ID, StatusCode.BAD_REQUEST)
        }
        const vendor = await this._vendorRepository.findByOwnerId(ownerId)
        if (!vendor) {
            throw new AppError('vendor account not found', StatusCode.NOT_FOUND)
        }
        if (vendor.status !== VendorStatus.APPROVED) {
            throw new AppError(DAILY_MENU_MESSAGES.ONLY_APPROVED_VENDOR_VIEW, StatusCode.FORBIDDEN)
        }
        const hotel = await this._hotelRepository.findByIdAndVendorId(hotelId, vendor._id.toString())
        if (!hotel) {
            throw new AppError(HOTEL_MESSAGES.NOT_FOUND_OR_ACCESS_DENIED, StatusCode.NOT_FOUND)
        }

        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)


        const endOfDay = new Date(startOfDay)
        endOfDay.setDate(endOfDay.getDate() + 1)

        const menu = await this._dailyMenuRepository.findTodayMenuByHotel(hotelId, vendor._id, startOfDay, endOfDay);

        if (!menu) {
            return null
        }
        return toDailyMenuResponseDTO(menu)

    }
    async endLive(ownerId: string, menuId: string): Promise<IDailyMenuResponseDTO> {
        if (!Types.ObjectId.isValid(menuId)) {
            throw new AppError(DAILY_MENU_MESSAGES.INVALID_ID, StatusCode.BAD_REQUEST)
        }
        const vendor = await this._vendorRepository.findByOwnerId(ownerId)
        if (!vendor) {
            throw new AppError(VENDOR_MESSAGES.VENDOR_NOT_FOUND, StatusCode.NOT_FOUND)
        }
        if (vendor.status !== VendorStatus.APPROVED) {
            throw new AppError(DAILY_MENU_MESSAGES.ONLY_APPROVED_VENDOR_LIVE)
        }

        const menu = await this._dailyMenuRepository.findByIdAndVendorId(menuId, vendor._id)
        if (!menu) {
            throw new AppError(DAILY_MENU_MESSAGES.NOT_FOUND_OR_ACCESS_DENIED, StatusCode.NOT_FOUND)
        }

        if (!menu.isLive) {
            throw new AppError(DAILY_MENU_MESSAGES.ALREADY_OFFLINE, StatusCode.BAD_REQUEST)
        }
        const updatedMenu = await this._dailyMenuRepository.updateLiveStatus(menuId, vendor._id, false)
        if (!updatedMenu) {
            throw new AppError(DAILY_MENU_MESSAGES.UNABLE_TO_END_LIVE, StatusCode.NOT_FOUND)
        }

        try {
            const hotel = await this._hotelRepository.findByIdAndVendorId(menu.hotelId.toString(), vendor._id.toString());
            if (hotel && hotel.location && hotel.location.coordinates) {
                const [longitude, latitude] = hotel.location.coordinates;
                const nearbyUsers = await this._userRepository.findUsersWithinRadius(longitude, latitude, 5000);

                const { getIO, getUserSocketId } = await import("../../config/socket");
                const io = getIO();

                for (const user of nearbyUsers) {
                    const socketId = await getUserSocketId(user._id.toString());
                    if (socketId) {
                        io.to(socketId).emit("business_live_ended", {
                            hotelId: hotel._id,
                            vendorId: vendor._id
                        });
                    }
                }
            }
        } catch (err) {
            console.error("Failed to send live ended notifications:", err);
        }

        return toDailyMenuResponseDTO(updatedMenu)
    }

    async updatePickupWindow(ownerId: string, menuId: string, data: IUpdatePickupWindowDTO): Promise<IDailyMenuResponseDTO> {

        if (!Types.ObjectId.isValid(menuId)) {
            throw new AppError(
                DAILY_MENU_MESSAGES.INVALID_ID,
                StatusCode.BAD_REQUEST
            )
        }

        const vendor =
            await this._vendorRepository
                .findByOwnerId(ownerId)

        if (!vendor) {
            throw new AppError(
                VENDOR_MESSAGES.VENDOR_NOT_FOUND,
                StatusCode.NOT_FOUND
            )
        }

        if (vendor.status !== VendorStatus.APPROVED) {
            throw new AppError(
                "only approved vendors can update the pickup window",
                StatusCode.FORBIDDEN
            )
        }

        const menu =
            await this._dailyMenuRepository
                .findByIdAndVendorId(
                    menuId,
                    vendor._id
                )

        if (!menu) {
            throw new AppError("menu not found or access denied", StatusCode.NOT_FOUND)
        }

        if (menu.isLive) {
            throw new AppError("end the live session before changing the pickup window", StatusCode.BAD_REQUEST)



        }

        if (!data) {
            throw new AppError(
                "pickup-window data is required",
                StatusCode.BAD_REQUEST
            )
        }

        const pickupStartTime =
            new Date(data.pickupStartTime)

        const pickupEndTime =
            new Date(data.pickupEndTime)

        if (
            Number.isNaN(
                pickupStartTime.getTime()
            ) ||
            Number.isNaN(
                pickupEndTime.getTime()
            )
        ) {
            throw new AppError(
                DAILY_MENU_MESSAGES.INVALID_PICKUP_TIME,
                StatusCode.BAD_REQUEST
            )
        }

        if (pickupStartTime >= pickupEndTime) {
            throw new AppError(
                DAILY_MENU_MESSAGES.END_TIME_AFTER_START,
                StatusCode.BAD_REQUEST
            )
        }

        const now = new Date()

        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)

        const endOfDay = new Date(startOfDay)
        endOfDay.setDate(
            endOfDay.getDate() + 1
        )

        if (
            pickupStartTime < startOfDay ||
            pickupStartTime >= endOfDay ||
            pickupEndTime > endOfDay
        ) {
            throw new AppError(
                "pickup window must end by midnight",
                StatusCode.BAD_REQUEST
            )
        }

        /*
         * Ordering closes 30 minutes
         * before pickup closes.
         */
        const cutoffTime = new Date(
            pickupEndTime.getTime() -
            30 * 60 * 1000
        )

        if (pickupStartTime >= cutoffTime) {
            throw new AppError(
                "The pickup window must be at least 30 minutes long to allow customers time to order.",
                StatusCode.BAD_REQUEST
            )
        }

        if (now >= cutoffTime) {
            throw new AppError(
                "pickup closing time must be more than 30 minutes from now",
                StatusCode.BAD_REQUEST
            )
        }

        const updatedMenu =
            await this._dailyMenuRepository
                .updatePickupWindow(
                    menuId,
                    vendor._id,
                    {
                        startTime: pickupStartTime,
                        endTime: pickupEndTime
                    }
                )

        if (!updatedMenu) {
            throw new AppError(
                "unable to update the pickup window",
                StatusCode.BAD_REQUEST
            )
        }

        return toDailyMenuResponseDTO(updatedMenu)
    }
    async updateMenuItem(ownerId: string, menuId: string, itemId: string, data: IUpdateDailyMenuItemDTO): Promise<IDailyMenuResponseDTO> {
        if (!Types.ObjectId.isValid(menuId) || !Types.ObjectId.isValid(itemId)) {
            throw new AppError(DAILY_MENU_MESSAGES.INVALID_ID, StatusCode.BAD_REQUEST)
        }

        if (!data || Object.keys(data).length === 0) {
            throw new AppError(DAILY_MENU_MESSAGES.AT_LEAST_ONE_FIELD, StatusCode.BAD_REQUEST)
        }

        const vendor = await this._vendorRepository.findByOwnerId(ownerId)
        if (!vendor) {
            throw new AppError(VENDOR_MESSAGES.VENDOR_NOT_FOUND, StatusCode.NOT_FOUND)
        }

        if (vendor.status !== VendorStatus.APPROVED) {
            throw new AppError(DAILY_MENU_MESSAGES.ONLY_APPROVED_VENDOR_UPDATE, StatusCode.FORBIDDEN)

        }
        const menu = await this._dailyMenuRepository.findByIdAndVendorId(
            menuId,
            vendor._id
        );


        if (!menu) {
            throw new AppError(DAILY_MENU_MESSAGES.NOT_FOUND_OR_ACCESS_DENIED, StatusCode.NOT_FOUND);

        }

        const existingItem = menu.items.find((item) => item._id.toString() == itemId)
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

        if (data.unitType !== undefined && !Object.values(MenuUnitType).includes(data.unitType)) {
            throw new AppError(DAILY_MENU_MESSAGES.INVALID_UNIT_TYPE, StatusCode.BAD_REQUEST)
        }

        const originalPrice = data.originalPrice ?? existingItem.originalPrice;
        const discountedPrice = data.discountedPrice ?? existingItem.discountedPrice;

        if (!Number.isFinite(originalPrice) || !Number.isFinite(discountedPrice) || originalPrice <= 0 || discountedPrice <= 0) {
            throw new AppError(DAILY_MENU_MESSAGES.PRICE_GREATER_THAN_ZERO, StatusCode.BAD_REQUEST)
        }

        if (discountedPrice >= originalPrice) {
            throw new AppError(DAILY_MENU_MESSAGES.DISCOUNT_LOWER, StatusCode.BAD_REQUEST)
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

        const updatedMenu = await this._dailyMenuRepository.updateItem(menuId, itemId, vendor._id, updateData)


        if (!updatedMenu) {
            throw new AppError(
                "Unable to update the menu item",
                StatusCode.NOT_FOUND
            );
        }
        return toDailyMenuResponseDTO(updatedMenu)


    }
    async usePreviousMenu(ownerId: string, menuId: string): Promise<IDailyMenuResponseDTO> {
        if (!Types.ObjectId.isValid(menuId)) {
            throw new AppError(DAILY_MENU_MESSAGES.INVALID_ID, StatusCode.BAD_REQUEST)
        }

        const vendor = await this._vendorRepository.findByOwnerId(ownerId)
        if (!vendor) {
            throw new AppError(VENDOR_MESSAGES.VENDOR_NOT_FOUND, StatusCode.NOT_FOUND)
        }

        if (vendor.status !== VendorStatus.APPROVED) {
            throw new AppError(DAILY_MENU_MESSAGES.ONLY_APPROVED_VENDOR_PREVIOUS, StatusCode.FORBIDDEN)
        }

        const currentMenu = await this._dailyMenuRepository.findByIdAndVendorId(menuId, vendor._id)
        if (!currentMenu) {
            throw new AppError(DAILY_MENU_MESSAGES.TODAY_NOT_FOUND, StatusCode.NOT_FOUND)
        }
        if (currentMenu.isLive) {
            throw new AppError(DAILY_MENU_MESSAGES.END_LIVE_BEFORE_PREVIOUS, StatusCode.NOT_FOUND)
        }
        if (currentMenu.items.length > 0) {
            throw new AppError(DAILY_MENU_MESSAGES.PREVIOUS_ONLY_EMPTY)
        }

        const previousMenu = await this._dailyMenuRepository.findLatestMenuBeforeDate(currentMenu.hotelId, vendor._id, currentMenu.menuDate)
        if (!previousMenu) {
            throw new AppError(DAILY_MENU_MESSAGES.NO_PREVIOUS_MENU, StatusCode.NOT_FOUND)
        }

        const copiedItem: IDailyMenuItemCreateData[] = previousMenu.items.filter((item) => Boolean(item.itemImageKey)).map((item) => ({
            itemName: item.itemName,
            itemImageKey: item.itemImageKey,
            unitType: item.unitType,
            originalPrice: item.originalPrice,
            discountedPrice: item.discountedPrice,
            stockQuantity: 0,
            isAvailable: false
        }))
        if (copiedItem.length === 0) {
            throw new AppError(DAILY_MENU_MESSAGES.NO_REUSABLE_ITEM, StatusCode.BAD_REQUEST)
        }

        const updatedMenu = await this._dailyMenuRepository.setItemIfEmpty(menuId, vendor._id, copiedItem);

        if (!updatedMenu) {
            throw new AppError(DAILY_MENU_MESSAGES.UNABLE_TO_USE_PREVIOUS)

        }
        return await toDailyMenuResponseDTO(updatedMenu)



    }

}
