import api from "./api";
import { API_ROUTES } from "../constants/apiRoutes";

export interface ConcernUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface ConcernOrder {
  _id: string;
  totalAmount: number;
  currency: string;
  pickupWindow?: {
    startTime: string;
    endTime: string;
  };
}

export interface ConcernItem {
  _id: string;
  orderId: ConcernOrder | string;
  customerId: ConcernUser;
  vendorId: ConcernUser;
  reason: string;
  photoUrl: string;
  photoCapturedAt?: string | null;
  pickupWindowStart: string;
  pickupWindowEnd: string;
  isTimestampValid?: boolean | null;
  status: "pending" | "approved" | "rejected";
  adminNote?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
}

export interface ConcernsResponse {
  success: boolean;
  message?: string;
  data: {
    concerns: ConcernItem[];
  };
}

export interface SingleConcernResponse {
  success: boolean;
  message?: string;
  data: {
    concern: ConcernItem;
  };
}

export const raiseOrderConcern = async (
  orderId: string,
  reason: string,
  photoFile: File
): Promise<SingleConcernResponse> => {
  const formData = new FormData();
  formData.append("reason", reason);
  formData.append("photo", photoFile);

  const response = await api.post<SingleConcernResponse>(
    API_ROUTES.CONCERN.RAISE(orderId),
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const getAdminConcerns = async (
  statusFilter?: string
): Promise<ConcernsResponse> => {
  const response = await api.get<ConcernsResponse>(
    API_ROUTES.CONCERN.ADMIN_LIST,
    {
      params: { status: statusFilter },
    }
  );
  return response.data;
};

export const approveAdminConcern = async (
  concernId: string,
  adminNote?: string
): Promise<SingleConcernResponse> => {
  const response = await api.post<SingleConcernResponse>(
    API_ROUTES.CONCERN.ADMIN_APPROVE(concernId),
    { adminNote }
  );
  return response.data;
};

export const rejectAdminConcern = async (
  concernId: string,
  adminNote?: string
): Promise<SingleConcernResponse> => {
  const response = await api.post<SingleConcernResponse>(
    API_ROUTES.CONCERN.ADMIN_REJECT(concernId),
    { adminNote }
  );
  return response.data;
};
