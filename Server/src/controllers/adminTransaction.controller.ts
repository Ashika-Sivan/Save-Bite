import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/authRequest";
import { IAdminTransactionService } from "../interfaces/service/adminTransaction/IAdminTransactionService";
import { ResponseHelper } from "../utils/ResponseHelper";
import { StatusCode } from "../constants/statusCode";
import { ADMIN_MESSAGES } from "../constants/messages";
import { catchAsync } from "../utils/catchAsync";

export class AdminTransactionController {
  constructor(private _adminTransactionService: IAdminTransactionService) { }

  getOverview = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const overview = await this._adminTransactionService.getOverview();
    ResponseHelper.success(
      res,
      StatusCode.OK,
      ADMIN_MESSAGES.TRANSACTION_OVERVIEW_FETCHED,
      overview
    );
  });
  getVendorBreakdown = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const search = (req.query.search as string || "").trim();
    const businessTypeFilter = (req.query.businessType as string || "").trim();
    const sortAdminEarned = req.query.sortAdminEarned as "asc" | "desc" | undefined;
    const breakdown = await this._adminTransactionService.getVendorBreakdown(
      page,
      limit,
      search,
      businessTypeFilter,
      sortAdminEarned
    );
    ResponseHelper.success(res, StatusCode.OK, ADMIN_MESSAGES.VENDOR_BREAKDOWN_FETCHED, breakdown);
  });
    getRecentTransactions = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
        const search = (req.query.search as string || "").trim();
        const statusFilter = req.query.status as string | undefined;
        const transactions = await this._adminTransactionService.getRecentTransactions(
            page,
            limit,
            search,
            statusFilter
        );
        ResponseHelper.success(res, StatusCode.OK, ADMIN_MESSAGES.RECENT_TRANSACTIONS_FETCHED, transactions);
    });

    getRefunds = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
        const search = (req.query.search as string || "").trim();
        const status = (req.query.status as string || "").trim();
        const refunds = await this._adminTransactionService.getRefundReport(
            page,
            limit,
            search,
            status
        );
        ResponseHelper.success(res, StatusCode.OK, "Refund reports fetched successfully", refunds);
    });

    downloadPdf = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        const search = (req.query.search as string || "").trim();
        const businessTypeFilter = (req.query.businessType as string || "").trim();
        const sortAdminEarned = req.query.sortAdminEarned as "asc" | "desc" | undefined;
        
        const overview = await this._adminTransactionService.getOverview();
        // Fetch vendors without pagination (or a very large limit) to include all in PDF, but apply filters
        const breakdown = await this._adminTransactionService.getVendorBreakdown(1, 10000, search, businessTypeFilter, sortAdminEarned);
        
        const { generateTransactionsPDF } = await import("../utils/pdfService");
        generateTransactionsPDF(res, overview, breakdown.items);
    });
}
