import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/authRequest";
import { IReviewService } from "../interfaces/service/review/IReviewService";
import { ResponseHelper } from "../utils/ResponseHelper";
import { StatusCode } from "../constants/statusCode";
import { AppError } from "../errors/AppError";
import { ICreateReviewRequestDTO } from "../dtos/review.dto";
import { AUTH_MESSAGES, REVIEW_MESSAGES } from "../constants/messages";
import { catchAsync } from "../utils/catchAsync";

export class ReviewController {
  constructor(private _reviewService: IReviewService) { }

  createReview = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError(AUTH_MESSAGES.USER_NOT_AUTHENTICATED, StatusCode.UNAUTHORIZED);
    }
    const data: ICreateReviewRequestDTO = req.body;
    const review = await this._reviewService.createReview(userId, data);
    ResponseHelper.success(res, StatusCode.CREATED, REVIEW_MESSAGES.SUBMITTED_SUCCESS, review);
  });
  getHotelReviews = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { hotelId } = req.params;
    if (!hotelId) {
      throw new AppError(REVIEW_MESSAGES.HOTEL_ID_REQUIRED, StatusCode.BAD_REQUEST);
    }
    const result = await this._reviewService.getHotelReviews(hotelId as string);
    ResponseHelper.success(res, StatusCode.OK, REVIEW_MESSAGES.REVIEWS_FETCHED, result);
  });
  getReviewByOrder = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { orderId } = req.params;
    if (!orderId) {
      throw new AppError(REVIEW_MESSAGES.ORDER_ID_REQUIRED, StatusCode.BAD_REQUEST);
    }
    const result = await this._reviewService.getReviewByOrder(orderId as string);
    ResponseHelper.success(res, StatusCode.OK, REVIEW_MESSAGES.REVIEW_STATUS_FETCHED, result);
  });
  canReviewHotel = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError(AUTH_MESSAGES.USER_NOT_AUTHENTICATED, StatusCode.UNAUTHORIZED);
    }
    const { hotelId } = req.params;
    if (!hotelId) {
      throw new AppError(REVIEW_MESSAGES.HOTEL_ID_REQUIRED, StatusCode.BAD_REQUEST);
    }
    const canReview = await this._reviewService.canReviewHotel(userId, hotelId as string);
    ResponseHelper.success(res, StatusCode.OK, REVIEW_MESSAGES.ELIGIBILITY_STATUS_FETCHED, { canReview });
  });
}
