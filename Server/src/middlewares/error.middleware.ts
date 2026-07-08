import { Request, Response, NextFunction } from "express";
import { Logger } from "../utils/logger";
import { AppError } from "../errors/AppError";
import { StatusCode } from "../constants/statusCode";

export const errorMiddleware=(
    error:Error,
    req:Request,
    res:Response,
    next:NextFunction
)=>{
    Logger.error(error.message,error)
    if(error instanceof AppError){
        return res.status(error.statusCode).json({
            success:false,
            message:error.message
        })
    }

    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success:false,
        message:error.message,
    })
}