import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/authRequest";
import { ReviewModel } from "../models/review/review.model";
import { Hotel } from "../models/vendor/hotel.model";
import { ResponseHelper } from "../utils/ResponseHelper";
import { StatusCode } from "../constants/statusCode";
import { AppError } from "../errors/AppError";

export class AdminReviewController {
  // Get all reviews with search, filter, and pagination
  async getAllReviews(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
      const skip = (page - 1) * limit;

      const search = (req.query.search as string || "").trim();
      const ratingFilter = req.query.rating ? parseInt(req.query.rating as string) : undefined;
      const visibilityFilter = req.query.visibility !== undefined ? req.query.visibility === "true" : undefined;

      const query: any = {};

      if (ratingFilter) {
        query.rating = ratingFilter;
      }

      if (visibilityFilter !== undefined) {
        query.isVisible = visibilityFilter;
      }

      if (search) {
        // Find matching hotel IDs first if searching hotel name
        const matchingHotels = await Hotel.find({
          hotelName: { $regex: search, $options: "i" },
        }).select("_id");
        const hotelIds = matchingHotels.map((h) => h._id);

        query.$or = [
          { userName: { $regex: search, $options: "i" } },
          { comment: { $regex: search, $options: "i" } },
          { hotelId: { $in: hotelIds } },
        ];
      }

      const total = await ReviewModel.countDocuments(query);
      const reviews = await ReviewModel.find(query)
        .populate("hotelId", "hotelName place businessType hotelImageKey")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // Overall platform statistics
      const allReviews = await ReviewModel.find({});
      const totalPlatformReviews = allReviews.length;
      let platformAvgRating = 0;
      const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

      if (totalPlatformReviews > 0) {
        const sum = allReviews.reduce((acc, r) => {
          const rKey = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
          breakdown[rKey] = (breakdown[rKey] || 0) + 1;
          return acc + r.rating;
        }, 0);
        platformAvgRating = Number((sum / totalPlatformReviews).toFixed(1));
      }

      ResponseHelper.success(res, StatusCode.OK, "Admin reviews fetched successfully", {
        items: reviews,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        stats: {
          totalPlatformReviews,
          platformAvgRating,
          breakdown,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Toggle review visibility
  async toggleVisibility(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const review = await ReviewModel.findById(id);

      if (!review) {
        throw new AppError("Review not found", StatusCode.NOT_FOUND);
      }

      review.isVisible = !review.isVisible;
      await review.save();

      ResponseHelper.success(
        res,
        StatusCode.OK,
        `Review visibility set to ${review.isVisible ? "Visible" : "Hidden"}`,
        review
      );
    } catch (error) {
      next(error);
    }
  }

  // Delete review
  async deleteReview(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const review = await ReviewModel.findByIdAndDelete(id);

      if (!review) {
        throw new AppError("Review not found", StatusCode.NOT_FOUND);
      }

      ResponseHelper.success(res, StatusCode.OK, "Review deleted successfully", null);
    } catch (error) {
      next(error);
    }
  }
}

export const adminReviewController = new AdminReviewController();
