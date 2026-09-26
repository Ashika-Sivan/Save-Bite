import { IConcern } from "../interfaces/models/IConcern.model";
import { IConcernResponseDTO } from "../dtos/concern.dto";

export const toConcernResponseDTO = (concern: IConcern): IConcernResponseDTO => {
    return {
        _id: concern._id.toString(),
        id: concern._id.toString(),
        orderId: concern.orderId,
        customerId: concern.customerId,
        vendorId: concern.vendorId,
        reason: concern.reason,
        photoUrl: concern.photoUrl,
        photoCapturedAt: concern.photoCapturedAt ? concern.photoCapturedAt.toISOString() : null,
        pickupWindowStart: concern.pickupWindowStart.toISOString(),
        pickupWindowEnd: concern.pickupWindowEnd.toISOString(),
        isTimestampValid: concern.isTimestampValid,
        status: concern.status,
        adminNote: concern.adminNote || null,
        resolvedAt: concern.resolvedAt ? concern.resolvedAt.toISOString() : null,
        createdAt: concern.createdAt.toISOString(),
        updatedAt: concern.updatedAt.toISOString(),
    };
};
