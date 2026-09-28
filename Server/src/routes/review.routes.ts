import { Router } from "express";
import { reviewController, authMiddleware } from "../config/dependencies";
import { validateRequest } from "../middlewares/validate.middleware";
import { createReviewSchema } from "../validations/review.validations";

const router = Router();

router.get(
  "/hotel/:hotelId",
  reviewController.getHotelReviews.bind(reviewController),
);

router.use(authMiddleware.authenticate);

router.post(
  "/",
  validateRequest(createReviewSchema),
  reviewController.createReview.bind(reviewController),
);

router.get(
  "/order/:orderId",
  reviewController.getReviewByOrder.bind(reviewController),
);

router.get(
  "/hotel/:hotelId/can-review",
  reviewController.canReviewHotel.bind(reviewController),
);

export default router;
