export interface RaiseConcernDTO {
  orderId: string;
  customerId: string;
  reason: string;
  imageBuffer: Buffer;
  imageMimeType?: string;
}

export interface ReviewConcernDTO {
  concernId: string;
  adminNote?: string;
}

export interface IConcernResponseDTO {
  id: string;
  orderId: string;
  customerId: string;
  vendorId: string;
  reason: string;
  photoUrl: string;
  photoCapturedAt: string | null;
  pickupWindowStart: string;
  pickupWindowEnd: string;
  isTimestampValid: boolean | null;
  status: string;
  adminNote: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
