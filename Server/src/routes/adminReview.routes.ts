import { Router } from "express";
import { adminReviewController, authMiddleware } from "../config/dependencies";

const router = Router();


router.use(authMiddleware.authenticate, authMiddleware.authorize("admin"));
router.get("/", adminReviewController.getAllReviews.bind(adminReviewController));
router.patch("/:id/visibility", adminReviewController.toggleVisibility.bind(adminReviewController));
router.delete("/:id", adminReviewController.deleteReview.bind(adminReviewController));

export default router;
