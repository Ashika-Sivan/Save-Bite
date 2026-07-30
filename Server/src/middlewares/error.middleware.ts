import { Request, Response, NextFunction } from "express";
import { Logger } from "../utils/logger";
import { AppError } from "../errors/AppError";
import { StatusCode } from "../constants/statusCode";

export const errorMiddleware = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (error instanceof AppError) {
    Logger.error(error.message, error);

    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  if (error instanceof Error) {
    Logger.error(error.message, error);

    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }

  Logger.error("Unknown error occurred", error);

  return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Something went wrong",
  });
};