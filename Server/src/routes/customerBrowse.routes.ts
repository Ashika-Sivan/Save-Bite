import { Router } from "express";
import { HotelRepository } from "../repositories/hotel/hotel.repository";
import { CustomerBrowseController } from "../controllers/customerBrowse.controller";
import { CustomerBrowseService } from "../services/customer/customerBrowse.service";
import { authMiddleware } from "../config/dependencies";

const customerBrowseRouter=Router()
const hotelRepository=new HotelRepository()
const customerBrowseService=new CustomerBrowseService(hotelRepository)
const customerBrowseController=new CustomerBrowseController(customerBrowseService)

customerBrowseRouter.get("/live-hotels",authMiddleware.authenticate,authMiddleware.authorize("user"),customerBrowseController.getLiveHotels.bind(customerBrowseController))
customerBrowseRouter.get("/live-hotels/:hotelId/menu",authMiddleware.authenticate,authMiddleware.authorize("user"),customerBrowseController.getLiveHotelMenu.bind(customerBrowseController))
export default customerBrowseRouter