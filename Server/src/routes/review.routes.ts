import { Router } from "express";
import { reviewController } from "../controllers/review.controller";
import { authMiddleware } from "../config/dependencies";

const router = Router();

// Public: Get reviews for a specific hotel
router.get("/hotel/:hotelId", reviewController.getHotelReviews.bind(reviewController));

// Protected Customer routes
router.use(authMiddleware.authenticate);

// Submit a review for a completed order
router.post("/", reviewController.createReview.bind(reviewController));

// Check review status for an order
router.get("/order/:orderId", reviewController.getReviewByOrder.bind(reviewController));

export default router;
