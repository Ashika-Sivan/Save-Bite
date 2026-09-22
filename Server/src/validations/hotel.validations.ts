import { z } from "zod";
import { HOTEL_MESSAGES } from "../constants/messages";

export const createHotelSchema = z.object({
  body: z.object({
    hotelName: z.string().trim().min(1, HOTEL_MESSAGES.INVALID_DATA),
    businessType: z.string().trim().min(1, HOTEL_MESSAGES.INVALID_DATA),
    place: z.string().trim().min(1, HOTEL_MESSAGES.INVALID_DATA),
    address: z.string().trim().min(1, HOTEL_MESSAGES.INVALID_DATA),
    // We expect latitude and longitude to be convertible to numbers
    latitude: z.preprocess(
      (val) => (val === "" || val === undefined ? Number.NaN : Number(val)),
      z.number().min(-90, HOTEL_MESSAGES.INVALID_LOCATION).max(90, HOTEL_MESSAGES.INVALID_LOCATION)
    ),
    longitude: z.preprocess(
      (val) => (val === "" || val === undefined ? Number.NaN : Number(val)),
      z.number().min(-100, HOTEL_MESSAGES.INVALID_LOCATION).max(180, HOTEL_MESSAGES.INVALID_LOCATION)
    ),
  })
});