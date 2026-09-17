import { IReviewService } from "../../interfaces/service/review/IReviewService";
import { IReviewRepository } from "../../interfaces/repository/IReviewRepository";
import { IOrderRepository } from "../../interfaces/repository/IOrderRepository";
import { IUserRepository } from "../../interfaces/repository/IUserRepository";
import { IOrder } from "../../interfaces/models/IOrder.model";
import { IReview } from "../../models/review/review.model";
import { ICreateReviewRequestDTO, IReviewResponseDTO, IReviewListResponseDTO } from "../../dtos/review.dto";
import { toReviewResponseDTO, toReviewListResponseDTO } from "../../mappers/review.mapper";
import { Types } from "mongoose";
import { AppError } from "../../errors/AppError";
import { StatusCode } from "../../constants/statusCode";
import { REVIEW_MESSAGES } from "../../constants/messages";

export class ReviewService implements IReviewService {
    constructor(
        private _reviewRepository: IReviewRepository,
        private _orderRepository: IOrderRepository,
        private _userRepository: IUserRepository
    ) { }

    async createReview(userId: string, data: ICreateReviewRequestDTO): Promise<IReviewResponseDTO> {
        if (!data.hotelId || !data.rating || !data.comment) {
            throw new AppError(REVIEW_MESSAGES.REQUIRED_FIELDS, StatusCode.BAD_REQUEST);
        }

        const numRating = Number(data.rating);
        if (isNaN(numRating) || numRating < 1 || numRating > 5) {
            throw new AppError(REVIEW_MESSAGES.INVALID_RATING, StatusCode.BAD_REQUEST);
        }

        let validOrderId = data.orderId;

        if (data.orderId) {
            const order = await this._orderRepository.findById(data.orderId);
            if (!order) {
                throw new AppError(REVIEW_MESSAGES.ORDER_NOT_FOUND, StatusCode.NOT_FOUND);
            }

            if (order.customerId.toString() !== userId.toString()) {
                throw new AppError(REVIEW_MESSAGES.ONLY_OWN_ORDERS, StatusCode.FORBIDDEN);
            }

            const existingOrderReview = await this._reviewRepository.findByOrderId(data.orderId);
            if (existingOrderReview) {
                throw new AppError(REVIEW_MESSAGES.ALREADY_REVIEWED, StatusCode.CONFILCT);
            }
        } else {
            //  get latest order by customer and hotel
            // OrderRepository dont have it sometime. We will check it .
            const latestOrders = await this._orderRepository.findAll();

            const userHotelOrders = latestOrders.filter((o: IOrder) =>
                o.customerId.toString() === userId.toString() &&
                o.hotelId.toString() === data.hotelId.toString()
            ).sort((a: IOrder, b: IOrder) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            if (userHotelOrders.length > 0) {
                validOrderId = userHotelOrders[0]?._id?.toString();
            } else {
                throw new AppError(REVIEW_MESSAGES.MUST_ORDER_FIRST, StatusCode.FORBIDDEN);
            }
        }

        const user = await this._userRepository.findById(userId);
        const userName = user?.name || user?.email?.split("@")[0] || "Customer";

        const reviewData = {
            userId: new Types.ObjectId(userId),
            userName,
            hotelId: new Types.ObjectId(data.hotelId),
            orderId: validOrderId ? new Types.ObjectId(validOrderId) : undefined,
            rating: numRating,
            comment: data.comment.trim(),
            isVisible: true,
        };

        const createdReview = await this._reviewRepository.create(reviewData);
        return toReviewResponseDTO(createdReview as IReview);
    }

    async getHotelReviews(hotelId: string): Promise<IReviewListResponseDTO> {
        const reviews = await this._reviewRepository.findVisibleByHotelIdSortedDesc(hotelId);

        const totalReviews = reviews.length;
        let averageRating = 0;
        const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

        if (totalReviews > 0) {
            const sum = reviews.reduce((acc, r) => {
                const rKey = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
                breakdown[rKey] = (breakdown[rKey] || 0) + 1;
                return acc + r.rating;
            }, 0);
            averageRating = Number((sum / totalReviews).toFixed(1));
        }

        return toReviewListResponseDTO(reviews, {
            totalReviews,
            averageRating,
            breakdown,
        });
    }

    async getReviewByOrder(orderId: string): Promise<{ hasReviewed: boolean, review: IReviewResponseDTO | null }> {
        const review = await this._reviewRepository.findByOrderId(orderId);
        return {
            hasReviewed: !!review,
            review: review ? toReviewResponseDTO(review) : null,
        };
    }
    async canReviewHotel(userId: string, hotelId: string): Promise<boolean> {
        const latestOrders = await this._orderRepository.findAll();
        const hasOrdered = latestOrders.some((o: IOrder) =>
            o.customerId.toString() === userId.toString() &&
            o.hotelId.toString() === hotelId.toString()
        );
        return hasOrdered;
    }



}
