import { Types } from "mongoose";
import { IConcernService } from "../../interfaces/service/concern/IConcern.service";
import { IConcernRepository } from "../../interfaces/repository/IConcernRepository";
import { IOrderRepository } from "../../interfaces/repository/IOrderRepository";
import { IConcern, ConcernStatus } from "../../interfaces/models/IConcern.model";
import { OrderStatus } from "../../interfaces/models/IOrder.model";
import { RaiseConcernDTO } from "../../dtos/concern.dto";
import { AppError } from "../../errors/AppError";
import { StatusCode } from "../../constants/statusCode";
import { extractAndValidateExifTimestamp } from "../../utils/exifParser";
import { uploadToS3 } from "../../utils/uploadToS3";
import { getPresignedImageUrl } from "../../utils/getSignedUrl";

export class ConcernService implements IConcernService {
  constructor(
    private _concernRepository: IConcernRepository,
    private _orderRepository: IOrderRepository
  ) {}

  async raiseConcern(
    data: RaiseConcernDTO,
    file: Express.Multer.File
  ): Promise<IConcern> {
    const { orderId, customerId, reason } = data;

    const order = await this._orderRepository.findById(orderId);
    if (!order) {
      throw new AppError("Order not found", StatusCode.NOT_FOUND);
    }

    if (order.customerId.toString() !== customerId) {
      throw new AppError("Unauthorized to raise concern for this order", StatusCode.FORBIDDEN);
    }

    if (order.orderStatus !== OrderStatus.PLACED) {
      throw new AppError(
        `Cannot raise concern for order with status '${order.orderStatus}'. Only 'placed' orders are eligible.`,
        StatusCode.BAD_REQUEST
      );
    }

    const existingConcern = await this._concernRepository.findByOrderId(orderId);
    if (existingConcern) {
      throw new AppError("A concern has already been raised for this order", StatusCode.BAD_REQUEST);
    }

    const pickupStart = order.pickupWindow?.startTime
      ? new Date(order.pickupWindow.startTime)
      : new Date();
    const pickupEnd = order.pickupWindow?.endTime
      ? new Date(order.pickupWindow.endTime)
      : new Date();

    const { photoCapturedAt, isTimestampValid } = extractAndValidateExifTimestamp(
      file.buffer,
      pickupStart,
      pickupEnd
    );

    const uploadResult = await uploadToS3(file, "order-concerns");
    const photoUrl = uploadResult.key.startsWith("http")
      ? uploadResult.key
      : `https://${process.env.AWS_S3_BUCKET_NAME || "savebite-storage-ashika"}.s3.${process.env.AWS_REGION || "ap-south-1"}.amazonaws.com/${uploadResult.key}`;

    const concern = await this._concernRepository.createConcern({
      orderId: order._id,
      customerId: new Types.ObjectId(customerId),
      vendorId: order.vendorId,
      reason,
      photoUrl,
      photoCapturedAt,
      pickupWindowStart: pickupStart,
      pickupWindowEnd: pickupEnd,
      isTimestampValid,
      status: ConcernStatus.PENDING,
    });

    await this._orderRepository.updateOrderStatus(orderId, OrderStatus.CONCERN_RAISED);

    return concern;
  }

  async getAllConcerns(filterStatus?: string): Promise<IConcern[]> {
    const filter: any = {};
    if (filterStatus && filterStatus !== "ALL") {
      filter.status = filterStatus.toLowerCase();
    }
    const concerns = await this._concernRepository.findAll(filter);

    return await Promise.all(
      concerns.map(async (c) => {
        const doc: any = typeof (c as any).toObject === "function" ? (c as any).toObject() : c;
        if (doc.photoUrl) {
          doc.photoUrl = await getPresignedImageUrl(doc.photoUrl);
        }
        return doc;
      })
    );
  }

  async getConcernById(concernId: string): Promise<IConcern | null> {
    const concern = await this._concernRepository.findById(concernId);
    if (!concern) return null;
    const doc: any = typeof (concern as any).toObject === "function" ? (concern as any).toObject() : concern;
    if (doc.photoUrl) {
      doc.photoUrl = await getPresignedImageUrl(doc.photoUrl);
    }
    return doc;
  }

  async approveConcern(concernId: string, adminNote?: string): Promise<IConcern> {
    const concern = await this._concernRepository.findById(concernId);
    if (!concern) {
      throw new AppError("Concern not found", StatusCode.NOT_FOUND);
    }

    if (concern.status !== ConcernStatus.PENDING) {
      throw new AppError(`Concern is already ${concern.status}`, StatusCode.BAD_REQUEST);
    }

    const updatedConcern = await this._concernRepository.updateConcernStatus(
      concernId,
      ConcernStatus.APPROVED,
      adminNote,
      new Date()
    );

    if (!updatedConcern) {
      throw new AppError("Failed to update concern status", StatusCode.INTERNAL_SERVER_ERROR);
    }

    const orderIdStr = concern.orderId._id ? concern.orderId._id.toString() : concern.orderId.toString();
    await this._orderRepository.updateOrderStatus(orderIdStr, OrderStatus.RESOLVED);

    return updatedConcern;
  }

  async rejectConcern(concernId: string, adminNote?: string): Promise<IConcern> {
    const concern = await this._concernRepository.findById(concernId);
    if (!concern) {
      throw new AppError("Concern not found", StatusCode.NOT_FOUND);
    }

    if (concern.status !== ConcernStatus.PENDING) {
      throw new AppError(`Concern is already ${concern.status}`, StatusCode.BAD_REQUEST);
    }

    const updatedConcern = await this._concernRepository.updateConcernStatus(
      concernId,
      ConcernStatus.REJECTED,
      adminNote,
      new Date()
    );

    if (!updatedConcern) {
      throw new AppError("Failed to update concern status", StatusCode.INTERNAL_SERVER_ERROR);
    }

    const orderIdStr = concern.orderId._id ? concern.orderId._id.toString() : concern.orderId.toString();
    await this._orderRepository.updateOrderStatus(orderIdStr, OrderStatus.PLACED);

    return updatedConcern;
  }
}
