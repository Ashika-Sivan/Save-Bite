import { IReview } from "../../../models/review/review.model";

export interface IAdminReviewService {
    getAllReviews(
        page: number,
        limit: number,
        search: string,
        ratingFilter?: number,
        visibilityFilter?: boolean
    ): Promise<{
        items: IReview[];
        total: number;
        totalPages: number;
        stats: {
            totalPlatformReviews: number;
            platformAvgRating: number;
            breakdown: Record<number, number>;
        };
    }>;
    toggleVisibility(id: string): Promise<IReview>;
    deleteReview(id: string): Promise<void>;
}
