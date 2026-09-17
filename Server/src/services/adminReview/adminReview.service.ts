import { IAdminReviewService } from "../../interfaces/service/adminReview/IAdminReviewService";
import { IReviewRepository } from "../../interfaces/repository/IReviewRepository";
import { IHotelRepository } from "../../interfaces/repository/IHotelRepository";
import { IReview } from "../../models/review/review.model";
import { IHotel } from "../../interfaces/models/IHotel.model";
import { AppError } from "../../errors/AppError";
import { StatusCode } from "../../constants/statusCode";
import { ADMIN_MESSAGES } from "../../constants/messages";

export class AdminReviewService implements IAdminReviewService {
    constructor(
        private _reviewRepository: IReviewRepository,
        private _hotelRepository: IHotelRepository
    ) {}

    async getAllReviews(
        page: number,
        limit: number,
        search: string,
        ratingFilter?: number,
        visibilityFilter?: boolean
    ): Promise<any> {
        const skip = (page - 1) * limit;
        const query: Record<string, any> = {};

        if (ratingFilter) {
            query.rating = ratingFilter;
        }

        if (visibilityFilter !== undefined) {
            query.isVisible = visibilityFilter;
        }

        if (search) {
            const allHotels = await this._hotelRepository.findAll();
            const matchingHotels = allHotels.filter((h: IHotel) => h.hotelName.toLowerCase().includes(search.toLowerCase()));
            const hotelIds = matchingHotels.map((h: IHotel) => h._id);

            query.$or = [
                { userName: { $regex: search, $options: "i" } },
                { comment: { $regex: search, $options: "i" } },
                { hotelId: { $in: hotelIds } },
            ];
        }

        const total = await this._reviewRepository.countAdminReviews(query);
        const reviews = await this._reviewRepository.findAdminReviews(query, skip, limit);

        const allReviews = await this._reviewRepository.findAllSortedDesc();
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

        return {
            items: reviews,
            total,
            totalPages: Math.ceil(total / limit),
            stats: {
                totalPlatformReviews,
                platformAvgRating,
                breakdown,
            },
        };
    }

    async toggleVisibility(id: string): Promise<IReview> {
        const review = await this._reviewRepository.findById(id);

        if (!review) {
            throw new AppError(ADMIN_MESSAGES.REVIEW_NOT_FOUND, StatusCode.NOT_FOUND);
        }

        const updated = await this._reviewRepository.updateById(id, { isVisible: !review.isVisible });
        return updated as IReview;
    }

    async deleteReview(id: string): Promise<void> {
        const review = await this._reviewRepository.deleteById(id);

        if (!review) {
            throw new AppError(ADMIN_MESSAGES.REVIEW_NOT_FOUND, StatusCode.NOT_FOUND);
        }
    }
}
