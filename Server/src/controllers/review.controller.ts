import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/authRequest";
import { ReviewModel } from "../models/review/review.model";
import { Order } from "../models/order/order.model";
import { User } from "../models/user/user.model";
import { ResponseHelper } from "../utils/ResponseHelper";
import { StatusCode } from "../constants/statusCode";
import { AppError } from "../errors/AppError";
import mongoose from "mongoose";

export class ReviewController {
  // Submit review for a hotel or order
  async createReview(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError("Authentication required", StatusCode.UNAUTHORIZED);
      }

      const { orderId, hotelId, rating, comment } = req.body;

      if (!hotelId || !rating || !comment) {
        throw new AppError("hotelId, rating (1-5), and comment are required", StatusCode.BAD_REQUEST);
      }

      const numRating = Number(rating);
      if (isNaN(numRating) || numRating < 1 || numRating > 5) {
        throw new AppError("Rating must be a number between 1 and 5", StatusCode.BAD_REQUEST);
      }

      let validOrderId = orderId;

      if (orderId) {
        const order = await Order.findById(orderId);
        if (!order) {
          throw new AppError("Order not found", StatusCode.NOT_FOUND);
        }

        if (order.customerId.toString() !== userId.toString()) {
          throw new AppError("You can only review your own orders", StatusCode.FORBIDDEN);
        }

        // Check duplicate review for order
        const existingOrderReview = await ReviewModel.findOne({ orderId });
        if (existingOrderReview) {
          throw new AppError("You have already reviewed this order", StatusCode.CONFILCT);
        }
      } else {
        // Try auto-linking latest user order for this hotel if available
        const latestOrder = await Order.findOne({ customerId: userId, hotelId }).sort({ createdAt: -1 });
        if (latestOrder) {
          validOrderId = latestOrder._id;
        }
      }

      // Get user name
      const user = await User.findById(userId);
      const userName = user?.name || user?.email?.split("@")[0] || "Customer";

      const review = await ReviewModel.create({
        userId,
        userName,
        hotelId,
        orderId: validOrderId || null,
        rating: numRating,
        comment: comment.trim(),
        isVisible: true,
      });

      ResponseHelper.success(res, StatusCode.CREATED, "Review submitted successfully!", review);
    } catch (error) {
      next(error);
    }
  }

  // Get reviews and rating stats for a specific hotel
  async getHotelReviews(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { hotelId } = req.params;
      if (!hotelId) {
        throw new AppError("Hotel ID is required", StatusCode.BAD_REQUEST);
      }

      const reviews = await ReviewModel.find({
        hotelId,
        isVisible: true,
      }).sort({ createdAt: -1 });

      const totalReviews = reviews.length;
      let averageRating = 0;
      const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

      if (totalReviews > 0) {
        const sum = reviews.reduce((acc, r) => {
          const rKey = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
          breakdown[rKey] = (breakdown[rKey] || 0) + 1;
          return acc + r.rating;
        }, 0);
        averageRating = Number((sum / totalReviews).toFixed(1));
      }

      ResponseHelper.success(res, StatusCode.OK, "Hotel reviews fetched successfully", {
        reviews,
        stats: {
          totalReviews,
          averageRating,
          breakdown,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Check if an order has been reviewed
  async getReviewByOrder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId } = req.params;
      if (!orderId) {
        throw new AppError("Order ID is required", StatusCode.BAD_REQUEST);
      }

      const review = await ReviewModel.findOne({ orderId });
      ResponseHelper.success(res, StatusCode.OK, "Review status fetched", {
        hasReviewed: !!review,
        review: review || null,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const reviewController = new ReviewController();
