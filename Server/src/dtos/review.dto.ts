export interface ICreateReviewRequestDTO {
  orderId?: string;
  hotelId: string;
  rating: number;
  comment: string;
}

export interface IReviewResponseDTO {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  hotelId: string;
  orderId?: string;
  rating: number;
  comment: string;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IReviewListResponseDTO {
  reviews: IReviewResponseDTO[];
  stats: Record<string, any>;
}
