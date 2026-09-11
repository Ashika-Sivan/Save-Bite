import api from "./api";
import { API_ROUTES } from "../constants/apiRoutes";

export interface AdminReviewItem {
  _id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  hotelId: {
    _id: string;
    hotelName: string;
    place: string;
    businessType: string;
    hotelImageKey?: string;
  };
  orderId: string;
  rating: number;
  comment: string;
  isVisible: boolean;
  createdAt: string;
}

export interface AdminReviewsParams {
  page?: number;
  limit?: number;
  search?: string;
  rating?: number;
  visibility?: boolean;
}

export interface AdminReviewsResponse {
  items: AdminReviewItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: {
    totalPlatformReviews: number;
    platformAvgRating: number;
    breakdown: Record<number, number>;
  };
}

export const getAdminReviews = async (params?: AdminReviewsParams): Promise<AdminReviewsResponse> => {
  const response = await api.get(API_ROUTES.REVIEWS.ADMIN_ALL, { params });
  return response.data?.data || response.data;
};

export const toggleReviewVisibility = async (id: string): Promise<AdminReviewItem> => {
  const response = await api.patch(API_ROUTES.REVIEWS.ADMIN_TOGGLE_VISIBILITY(id));
  return response.data?.data || response.data;
};

export const deleteReview = async (id: string): Promise<void> => {
  await api.delete(API_ROUTES.REVIEWS.ADMIN_DELETE(id));
};
