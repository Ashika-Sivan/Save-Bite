import { IReview } from "../../models/review/review.model";
import { IBaseRepository } from "./IBaseRepository";

export interface IReviewRepository extends IBaseRepository<IReview> {
    findByOrderId(orderId: string): Promise<IReview | null>;
    findVisibleByHotelIdSortedDesc(hotelId: string): Promise<IReview[]>;
    findAllSortedDesc(): Promise<IReview[]>;
    findAdminReviews(query: any, skip: number, limit: number): Promise<IReview[]>;
    countAdminReviews(query: any): Promise<number>;
}
