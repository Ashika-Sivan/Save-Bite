import { Router } from "express";
import { HotelRepository } from "../repositories/hotel/hotel.repository";
import { CustomerBrowseController } from "../controllers/customerBrowse.controller";
import { CustomerBrowseService } from "../services/customer/customerBrowse.service";
import { authMiddleware } from "../config/dependencies";
import { ROUTES } from "../constants/routes";

const customerBrowseRouter = Router();
const hotelRepository = new HotelRepository();
const customerBrowseService = new CustomerBrowseService(hotelRepository);
const customerBrowseController = new CustomerBrowseController(customerBrowseService);

customerBrowseRouter.get(ROUTES.CUSTOMER.LIVE_HOTELS, authMiddleware.authenticate, authMiddleware.authorize("user"), customerBrowseController.getLiveHotels.bind(customerBrowseController));
customerBrowseRouter.get(ROUTES.CUSTOMER.LIVE_HOTEL_MENU, authMiddleware.authenticate, authMiddleware.authorize("user"), customerBrowseController.getLiveHotelMenu.bind(customerBrowseController));

export default customerBrowseRouter;