import { NextFunction, Request, Response } from "express";
import { StatusCode } from "../constants/statusCode";
import { AppError } from "../errors/AppError";
import { VENDOR_MESSAGES, ADMIN_MESSAGES } from "../constants/messages";
import { IAdminService } from "../interfaces/service/admin/IAdminService";
import { ResponseHelper } from "../utils/ResponseHelper";

export class AdminController {
  constructor(private readonly _adminService: IAdminService) { }

  async getAllVendors(req: Request, res: Response,next: NextFunction,): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const search = req.query.search as string | undefined;
      const status = req.query.status as string | undefined;

      const result = await this._adminService.getAllVendors({
        page,
        limit,
        search,
        status,
      });

      ResponseHelper.success(
        res,
        StatusCode.OK,
        ADMIN_MESSAGES.VENDORS_FETCHED,
        result,
      );
    } catch (error) {
      next(error);
    }
  }
 
  async approveVendor( req: Request<{ vendorId: string }>, res: Response, next: NextFunction,): Promise<void> {
    try {
      const { vendorId } = req.params;
      if (!vendorId) {
        throw new AppError(
          ADMIN_MESSAGES.VENDOR_ID_REQUIRED,
          StatusCode.BAD_REQUEST,
        );
      }

      const vendor = await this._adminService.approveVendor(vendorId);
      ResponseHelper.success(
        res,
        StatusCode.OK,
        VENDOR_MESSAGES.APPROVED_SUCCESS,
        vendor,
      );
    } catch (error) {
      next(error);
    }
  }

  async rejectVendor(  req: Request<{ vendorId: string }>, res: Response, next: NextFunction,): Promise<void> {
    try {
      const { vendorId } = req.params;
      const { reason } = req.body;

      if (!vendorId) {
        throw new AppError(
          ADMIN_MESSAGES.VENDOR_ID_REQUIRED,
          StatusCode.BAD_REQUEST,
        );
      }

      const vendor = await this._adminService.rejectVendor(vendorId, reason);

      ResponseHelper.success(
        res,
        StatusCode.OK,
        VENDOR_MESSAGES.REJECTED_SUCCESS,
        vendor,
      );
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req: Request,res: Response,next: NextFunction, ): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const search = req.query.search as string | undefined;
      const status = req.query.status as string | undefined;

      const result = await this._adminService.getAllUsers({
        page,
        limit,
        search,
        status,
      });

      ResponseHelper.success(
        res,
        StatusCode.OK,
        ADMIN_MESSAGES.USERS_FETCHED,
        result,
      );
    } catch (error) {
      next(error);
    }
  }

  async toggleUserStatus( req: Request, res: Response, next: NextFunction,): Promise<void> {
    try {
      const { userId } = req.params;
      if (!userId || Array.isArray(userId)) {
        throw new AppError(
          ADMIN_MESSAGES.VALID_USER_ID_REQUIRED,
          StatusCode.BAD_REQUEST,
        );
      }

      const updatedUser = await this._adminService.toggleUserStatus(userId);

      ResponseHelper.success(
        res,
        StatusCode.OK,
        updatedUser.isActive
          ? ADMIN_MESSAGES.USER_UNBLOCKED
          : ADMIN_MESSAGES.USER_BLOCKED,
        updatedUser,
      );
    } catch (error) {
      next(error);
    }
  }

  async getVendorById( req: Request,res: Response,next: NextFunction, ): Promise<void> {
    try {
      const vendorId = req.params.vendorId;
      if (!vendorId || Array.isArray(vendorId)) {
        throw new AppError(
          ADMIN_MESSAGES.VENDOR_ID_REQUIRED,
          StatusCode.BAD_REQUEST,
        );
      }

      const result = await this._adminService.getVendorById(vendorId);
      ResponseHelper.success(
        res,
        StatusCode.OK,
        VENDOR_MESSAGES.VENDOR_FETCHED,
        result,
      );
    } catch (error) {
      next(error);
    }
  }
}
