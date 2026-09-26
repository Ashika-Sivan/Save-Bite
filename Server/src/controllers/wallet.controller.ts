import { NextFunction, Response } from "express";
import { AUTH_MESSAGES } from "../constants/messages";
import { StatusCode } from "../constants/statusCode";
import { AppError } from "../errors/AppError";
import { IWalletService } from "../interfaces/service/wallet/IWallet.service";
import { AuthRequest } from "../types/authRequest";
import { ResponseHelper } from "../utils/ResponseHelper";
import { catchAsync } from "../utils/catchAsync";

export class WalletController {
    constructor(private readonly _walletService: IWalletService) { }

    getVendorWalletSummary = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        const ownerId = req.user?.vendorId || req.user?.userId;
        if (!ownerId) {
            throw new AppError(AUTH_MESSAGES.USER_NOT_AUTHENTICATED, StatusCode.UNAUTHORIZED);
        }
        const { startDate, endDate, sortDirection } = req.query;
        const filters = {
             startDate: startDate ? new Date(startDate as string) : undefined,
             endDate: endDate ? new Date(endDate as string) : undefined,
             sortDirection: (sortDirection as 'asc' | 'desc') || undefined
        };
        const summary = await this._walletService.getVendorWalletSummary(ownerId, filters);
        ResponseHelper.success(res, StatusCode.OK, "Vendor wallet summary fetched successfully", summary);
    });
}
