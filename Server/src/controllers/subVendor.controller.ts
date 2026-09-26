import { NextFunction, Response } from "express";
import { ISubVendorService } from "../interfaces/service/vendor/ISubVendorService";
import { AuthRequest } from "../types/authRequest";
import { StatusCode } from "../constants/statusCode";
import { AppError } from "../errors/AppError";
import { ResponseHelper } from "../utils/ResponseHelper";
import { catchAsync } from "../utils/catchAsync";

export class SubVendorController {
    constructor(private _subVendorService: ISubVendorService) {}

    getSubVendor = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        const vendorOwnerId = req.user?.vendorId || req.user?.userId;
        const hotelId = req.params.hotelId as string;

        if (!vendorOwnerId) throw new AppError("Unauthorized", StatusCode.UNAUTHORIZED);

        const subVendor = await this._subVendorService.getSubVendor(vendorOwnerId, hotelId);
        
        ResponseHelper.success(res, StatusCode.OK, "Sub-Vendor retrieved successfully", subVendor);
    });

    createCredentials = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        const vendorOwnerId = req.user?.vendorId || req.user?.userId;
        const hotelId = req.params.hotelId as string;
        const data = req.body;

        if (!vendorOwnerId) throw new AppError("Unauthorized", StatusCode.UNAUTHORIZED);

        const subVendor = await this._subVendorService.createCredentials(vendorOwnerId, hotelId, data);
        
        ResponseHelper.success(res, StatusCode.CREATED, "Sub-Vendor credentials created successfully", subVendor);
    });

    updatePermissions = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        const vendorOwnerId = req.user?.vendorId || req.user?.userId;
        const hotelId = req.params.hotelId as string;
        const data = req.body;

        if (!vendorOwnerId) throw new AppError("Unauthorized", StatusCode.UNAUTHORIZED);

        const subVendor = await this._subVendorService.updatePermissions(vendorOwnerId, hotelId, data);
        
        ResponseHelper.success(res, StatusCode.OK, "Sub-Vendor permissions updated successfully", subVendor);
    });

    updatePassword = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        const vendorOwnerId = req.user?.vendorId || req.user?.userId;
        const hotelId = req.params.hotelId as string;
        const data = req.body;

        if (!vendorOwnerId) throw new AppError("Unauthorized", StatusCode.UNAUTHORIZED);

        const subVendor = await this._subVendorService.updatePassword(vendorOwnerId, hotelId, data);
        
        ResponseHelper.success(res, StatusCode.OK, "Sub-Vendor password updated successfully", subVendor);
    });
}
