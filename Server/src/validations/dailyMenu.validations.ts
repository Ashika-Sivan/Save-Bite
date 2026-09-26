import { z } from "zod";
import { DAILY_MENU_MESSAGES } from "../constants/messages";
import { MenuUnitType } from "../interfaces/models/IDailyMenu.model";

export const createMenuSchema = z.object({
  body: z.object({
    pickupStartTime: z.string().datetime({ message: DAILY_MENU_MESSAGES.INVALID_PICKUP_TIME }),
    pickupEndTime: z.string().datetime({ message: DAILY_MENU_MESSAGES.INVALID_PICKUP_TIME }),
  })
});

export const addMenuItemSchema = z.object({
  body: z.object({
    itemName: z.string().trim().min(1, DAILY_MENU_MESSAGES.ITEM_NAME_REQUIRED),
    unitType: z.nativeEnum(MenuUnitType),
    originalPrice: z.preprocess((val) => Number(val), z.number().min(0.01, DAILY_MENU_MESSAGES.PRICES_GREATER_THAN_ZERO)),
    discountedPrice: z.preprocess((val) => Number(val), z.number().min(0.01, DAILY_MENU_MESSAGES.PRICES_GREATER_THAN_ZERO)),
    stockQuantity: z.preprocess((val) => Number(val), z.number().int().min(1, DAILY_MENU_MESSAGES.STOCK_QUANTITY_POSITIVE)),
  })
});

export const updatePickupWindowSchema = z.object({
  body: z.object({
    pickupStartTime: z.string().datetime({ message: DAILY_MENU_MESSAGES.INVALID_PICKUP_TIME }),
    pickupEndTime: z.string().datetime({ message: DAILY_MENU_MESSAGES.INVALID_PICKUP_TIME }),
  })
});

export const updateMenuItemSchema = z.object({
  body: z.object({
    itemName: z.string().trim().min(1, DAILY_MENU_MESSAGES.ITEM_NAME_NOT_EMPTY).optional(),
    unitType: z.nativeEnum(MenuUnitType).optional(),
    originalPrice: z.preprocess((val) => val === undefined ? undefined : Number(val), z.number().min(0.01, "Price must be greater than zero").optional()),
    discountedPrice: z.preprocess((val) => val === undefined ? undefined : Number(val), z.number().min(0.01, "Price must be greater than zero").optional()),
    stockQuantity: z.preprocess((val) => val === undefined ? undefined : Number(val), z.number().int().min(0, DAILY_MENU_MESSAGES.STOCK_QUANTITY_NON_NEGATIVE).optional()),
    isAvailable: z.boolean().optional(),
  })
});
