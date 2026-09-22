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
  _id: string;
  id: string;
  orderId: string | any;
  customerId: string | any;
  vendorId: string | any;
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
