import { IReview } from "../../../models/review/review.model";
import { ICreateReviewRequestDTO, IReviewResponseDTO, IReviewListResponseDTO } from "../../../dtos/review.dto";

export interface IReviewService {
    createReview(userId: string, data: ICreateReviewRequestDTO): Promise<IReviewResponseDTO>;
    getHotelReviews(hotelId: string): Promise<IReviewListResponseDTO>;
    getReviewByOrder(orderId: string): Promise<{ hasReviewed: boolean, review: IReviewResponseDTO | null }>;
    canReviewHotel(userId: string, hotelId: string): Promise<boolean>;
}
