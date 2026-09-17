import { ReviewModel, IReview } from "../../models/review/review.model";
import { IReviewRepository } from "../../interfaces/repository/IReviewRepository";
import { BaseRepository } from "../base.repository";

export class ReviewRepository extends BaseRepository<IReview> implements IReviewRepository {
    constructor() {
        super(ReviewModel);
    }

    async findByOrderId(orderId: string): Promise<IReview | null> {
        return await this._model.findOne({ orderId });
    }

    async findVisibleByHotelIdSortedDesc(hotelId: string): Promise<IReview[]> {
        return await this._model.find({ hotelId, isVisible: true }).sort({ createdAt: -1 });
    }

    async findAllSortedDesc(): Promise<IReview[]> {
        return await this._model.find().sort({ createdAt: -1 });
    }

    async findAdminReviews(query: any, skip: number, limit: number): Promise<IReview[]> {
        return await this._model.find(query)
            .populate("hotelId", "hotelName place businessType hotelImageKey")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
    }

    async countAdminReviews(query: any): Promise<number> {
        return await this._model.countDocuments(query);
    }
}
