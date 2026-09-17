import { Request, Response, NextFunction } from "express";
import { Logger } from "../utils/logger";
import { AppError } from "../errors/AppError";
import { StatusCode } from "../constants/statusCode";
import { ResponseHelper } from "../utils/ResponseHelper";

export const errorMiddleware = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (error instanceof AppError) {
    Logger.error(error.message, error);
    return ResponseHelper.error(res, error.statusCode, error.message);
  }

  if (error instanceof Error) {
    Logger.error(error.message, error);
    return ResponseHelper.error(res, StatusCode.INTERNAL_SERVER_ERROR, error.message);
  }

  Logger.error("Unknown error occurred", error);
  return ResponseHelper.error(res, StatusCode.INTERNAL_SERVER_ERROR, "Something went wrong");
};