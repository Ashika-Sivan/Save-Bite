import { z } from "zod";
import { REVIEW_MESSAGES } from "../constants/messages";

export const createReviewSchema = z.object({
  body: z.object({
    hotelId: z.string().min(1, REVIEW_MESSAGES.REQUIRED_FIELDS),
    comment: z.string().min(1, REVIEW_MESSAGES.REQUIRED_FIELDS),
    rating: z.preprocess(
      (val) => Number(val),
      z.number().min(1, REVIEW_MESSAGES.INVALID_RATING).max(5, REVIEW_MESSAGES.INVALID_RATING)
    ),
    orderId: z.string().optional(),
  })
});
