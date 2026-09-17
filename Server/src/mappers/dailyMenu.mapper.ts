import { IDailyMenu, IDailyMenuItem } from "../interfaces/models/IDailyMenu.model";
import { IDailyMenuResponseDTO, IDailyMenuItemResponseDTO } from "../dtos/dailyMenu.dto";
import { getSignedS3Url } from "../utils/getSignedS3Url";

export const toDailyMenuItemResponseDTO = async (item: IDailyMenuItem): Promise<IDailyMenuItemResponseDTO> => {
    const itemImageUrl = item.itemImageKey ? await getSignedS3Url(item.itemImageKey) : "";

    return {
        id: item._id.toString(),
        itemName: item.itemName,
        itemImageUrl,
        unitType: item.unitType,
        originalPrice: item.originalPrice,
        discountedPrice: item.discountedPrice,
        stockQuantity: item.stockQuantity,
        isAvailable: item.isAvailable,
    };
};

export const toDailyMenuResponseDTO = async (menu: IDailyMenu): Promise<IDailyMenuResponseDTO> => {
    const items = await Promise.all(menu.items.map(item => toDailyMenuItemResponseDTO(item)));

    return {
        id: menu._id.toString(),
        vendorId: menu.vendorId.toString(),
        hotelId: menu.hotelId.toString(),
        menuDate: menu.menuDate.toISOString(),
        pickupWindow: {
            startTime: menu.pickupWindow.startTime.toISOString(),
            endTime: menu.pickupWindow.endTime.toISOString(),
        },
        items,
        isLive: menu.isLive,
        createdAt: menu.createdAt.toISOString(),
        updatedAt: menu.updatedAt.toISOString(),
    };
};
