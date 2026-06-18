import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { UserRepository } from "../repositories/user.repository";
import { AuthService } from "../services/auth.service";
const userRepository=new UserRepository()
const authService=new AuthService(userRepository)
const authController=new AuthController(authService)

const router=Router()
router.post("/register",authController.register.bind(authController))//here we used bind to prevent losing this

export default router