import { NextFunction, Request, Response } from "express";
import { StatusCode } from "../constants/statusCode";
import { AppError } from "../errors/AppError";
import { VENDOR_MESSAGES, ADMIN_MESSAGES } from "../constants/messages";
import { IAdminService } from "../interfaces/service/admin/IAdminService";
import { ResponseHelper } from "../utils/ResponseHelper";
import { catchAsync } from "../utils/catchAsync";

export class AdminController {
  constructor(private readonly _adminService: IAdminService) { }

  getAllVendors = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
  });
  approveVendor = catchAsync(async (req: Request<{ vendorId: string }>, res: Response, next: NextFunction): Promise<void> => {
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
  });
  rejectVendor = catchAsync(async (req: Request<{ vendorId: string }>, res: Response, next: NextFunction): Promise<void> => {
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
  });
  getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
    ResponseHelper.success(res, StatusCode.OK, ADMIN_MESSAGES.USERS_FETCHED, result);
  });
  toggleUserStatus = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { userId } = req.params;
    if (!userId || Array.isArray(userId)) {
      throw new AppError(ADMIN_MESSAGES.VALID_USER_ID_REQUIRED, StatusCode.BAD_REQUEST);
    }
    const updatedUser = await this._adminService.toggleUserStatus(userId);
    ResponseHelper.success(res, StatusCode.OK, updatedUser.isActive ? ADMIN_MESSAGES.USER_UNBLOCKED : ADMIN_MESSAGES.USER_BLOCKED, updatedUser,);
  });
  toggleVendorStatus = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { vendorId } = req.params;
    if (!vendorId || Array.isArray(vendorId)) {
      throw new AppError(ADMIN_MESSAGES.VENDOR_ID_REQUIRED, StatusCode.BAD_REQUEST,);
    }
    const updatedVendor = await this._adminService.toggleVendorStatus(vendorId);
    ResponseHelper.success(res, StatusCode.OK, updatedVendor.status === "approved" ? "Vendor unblocked successfully" : "Vendor blocked successfully", updatedVendor,);
  });
  getVendorById = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
  });
  getDashboardOverview = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const result = await this._adminService.getDashboardOverview();
    ResponseHelper.success(
      res,
      StatusCode.OK,
      "Dashboard overview fetched successfully",
      result,
    );
  });
  getRevenueChart = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const result = await this._adminService.getRevenueChartData();
    ResponseHelper.success(
      res,
      StatusCode.OK,
      "Revenue chart fetched successfully",
      result,
    );
  });
  getAllOrders = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const status = req.query.status as string | undefined;
    const result = await this._adminService.getAllOrders({ page, limit, status });
    ResponseHelper.success(
      res,
      StatusCode.OK,
      "Orders fetched successfully",
      result,
    );
  });
  getLiveMetrics = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const result = await this._adminService.getLiveMetrics();
    ResponseHelper.success(
      res,
      StatusCode.OK,
      "Live metrics fetched successfully",
      result,
    );
  });
}
