import { IConcern } from "../interfaces/models/IConcern.model";
import { IConcernResponseDTO } from "../dtos/concern.dto";

export const toConcernResponseDTO = (concern: IConcern): IConcernResponseDTO => {
    const getIdStr = (field: any): string => {
        if (!field) return "";
        if (field._id) return field._id.toString();
        return field.toString();
    };

    return {
        id: concern._id.toString(),
        orderId: getIdStr(concern.orderId),
        customerId: getIdStr(concern.customerId),
        vendorId: getIdStr(concern.vendorId),
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
