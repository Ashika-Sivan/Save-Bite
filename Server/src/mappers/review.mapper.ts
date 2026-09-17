import { IReview } from "../models/review/review.model";
import { IReviewResponseDTO, IReviewListResponseDTO } from "../dtos/review.dto";

export const toReviewResponseDTO = (review: IReview): IReviewResponseDTO => {
    return {
        id: review._id ? review._id.toString() : "",
        userId: review.userId.toString(),
        userName: review.userName,
        userAvatar: review.userAvatar || "",
        hotelId: review.hotelId.toString(),
        orderId: review.orderId ? review.orderId.toString() : undefined,
        rating: review.rating,
        comment: review.comment,
        isVisible: review.isVisible,
        createdAt: review.createdAt ? review.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: review.updatedAt ? review.updatedAt.toISOString() : new Date().toISOString(),
    };
};

export const toReviewListResponseDTO = (reviews: IReview[], stats: Record<string, any>): IReviewListResponseDTO => {
    return {
        reviews: reviews.map(toReviewResponseDTO),
        stats
    };
};
