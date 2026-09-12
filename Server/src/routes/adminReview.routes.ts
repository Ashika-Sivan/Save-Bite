import { Router } from "express";
import { adminReviewController } from "../controllers/adminReview.controller";
import { authMiddleware } from "../config/dependencies";

const router = Router();

// Protect all admin review routes
router.use(authMiddleware.authenticate, authMiddleware.authorize("admin"));

// Fetch all reviews (with pagination, search & filters)
router.get("/", adminReviewController.getAllReviews.bind(adminReviewController));

// Toggle review visibility
router.patch("/:id/visibility", adminReviewController.toggleVisibility.bind(adminReviewController));

// Delete a review
router.delete("/:id", adminReviewController.deleteReview.bind(adminReviewController));

export default router;
