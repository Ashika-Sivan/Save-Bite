import { Router } from "express"
import { VendorRepository } from "../repositories/vendor/vendor.repository"
import { VendorService } from "../services/vendor/vendor.service"
import { VendorController } from "../controllers/vendor.controller"
import { AuthMiddleware } from "../middlewares/auth.middleware"
import { TokenService } from "../services/auth/token.service"

const router=Router()

const vendorRepository=new VendorRepository()
const vendorService=new VendorService(vendorRepository)
const vendorController=new VendorController(vendorService)
const tokenService=new TokenService();
const authMiddleware=new AuthMiddleware(tokenService)


router.post('/register',
    authMiddleware.authenticate,vendorController.registerVendor.bind(vendorController)
)


export default router