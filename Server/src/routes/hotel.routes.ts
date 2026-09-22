import { Router } from "express";
import { HotelRepository } from "../repositories/hotel/hotel.repository";
import { VendorRepository } from "../repositories/vendor/vendor.repository";
import { HotelService } from "../services/hotel/hotel.service";
import { HotelController } from "../controllers/hotel.controller";
import { authMiddleware } from "../config/dependencies";
import { upload } from "../middlewares/upload.middleware";
import { ROUTES } from "../constants/routes";
import { validateRequest } from "../middlewares/validate.middleware";
import { createHotelSchema } from "../validations/hotel.validations";

const hotelRouter = Router();
const hotelRepository = new HotelRepository();
const vendorRepository = new VendorRepository();
const hotelService = new HotelService(hotelRepository, vendorRepository);
const hotelController = new HotelController(hotelService);

hotelRouter.post(
  ROUTES.HOTEL.CREATE,
  authMiddleware.authenticate,
  authMiddleware.authorize("vendor"),
  upload.single("hotelImage"),
  validateRequest(createHotelSchema),
  hotelController.createHotel.bind(hotelController),
);
hotelRouter.get(
  ROUTES.HOTEL.GET_ALL,
  authMiddleware.authenticate,
  authMiddleware.authorize("vendor"),
  hotelController.getVendorHotels.bind(hotelController),
);
hotelRouter.get(
  ROUTES.HOTEL.GET_BY_ID,
  authMiddleware.authenticate,
  authMiddleware.authorize("vendor"),
  hotelController.getHotelById.bind(hotelController),
);

export default hotelRouter;
