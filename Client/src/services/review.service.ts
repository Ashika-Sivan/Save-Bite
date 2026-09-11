import api from "./api";
import { API_ROUTES } from "../constants/apiRoutes";

export interface ReviewItem {
  _id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  hotelId: any;
  orderId: string;
  rating: number;
  comment: string;
  isVisible: boolean;
  createdAt: string;
}

export interface RatingStats {
  totalReviews: number;
  averageRating: number;
  breakdown: Record<number, number>;
}

export interface HotelReviewsResponse {
  reviews: ReviewItem[];
  stats: RatingStats;
}

export interface SubmitReviewPayload {
  orderId?: string;
  hotelId: string;
  rating: number;
  comment: string;
}

export const submitReview = async (payload: SubmitReviewPayload): Promise<ReviewItem> => {
  const response = await api.post(API_ROUTES.REVIEWS.SUBMIT, payload);
  return response.data?.data || response.data;
};

export const getHotelReviews = async (hotelId: string): Promise<HotelReviewsResponse> => {
  const response = await api.get(API_ROUTES.REVIEWS.GET_HOTEL_REVIEWS(hotelId));
  return response.data?.data || response.data;
};

export const getReviewByOrder = async (orderId: string): Promise<{ hasReviewed: boolean; review: ReviewItem | null }> => {
  const response = await api.get(API_ROUTES.REVIEWS.GET_ORDER_REVIEW(orderId));
  return response.data?.data || response.data;
};
