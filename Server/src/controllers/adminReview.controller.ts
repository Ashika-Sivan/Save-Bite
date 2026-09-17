import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/authRequest";
import { IAdminReviewService } from "../interfaces/service/adminReview/IAdminReviewService";
import { ResponseHelper } from "../utils/ResponseHelper";
import { StatusCode } from "../constants/statusCode";
import { ADMIN_MESSAGES } from "../constants/messages";
import { AppError } from "../errors/AppError";
import { catchAsync } from "../utils/catchAsync";

export class AdminReviewController {
  constructor(private _adminReviewService: IAdminReviewService) { }

  getAllReviews = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const search = (req.query.search as string || "").trim();
    const ratingFilter = req.query.rating ? parseInt(req.query.rating as string) : undefined;
    const visibilityFilter = req.query.visibility !== undefined ? req.query.visibility === "true" : undefined;
    const result = await this._adminReviewService.getAllReviews(page, limit, search, ratingFilter, visibilityFilter);
    ResponseHelper.success(res, StatusCode.OK, ADMIN_MESSAGES.REVIEWS_FETCHED, result);
  });


  toggleVisibility = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const id = req.params.id as string;
    const review = await this._adminReviewService.toggleVisibility(id);
    ResponseHelper.success(
      res,
      StatusCode.OK,
      ADMIN_MESSAGES.REVIEW_VISIBILITY_UPDATED(review.isVisible ? "Visible" : "Hidden"),
      review
    );
  });


  deleteReview = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const id = req.params.id as string;
    await this._adminReviewService.deleteReview(id);
    ResponseHelper.success(res, StatusCode.OK, ADMIN_MESSAGES.REVIEW_DELETED, null);
  });
}
