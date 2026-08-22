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
