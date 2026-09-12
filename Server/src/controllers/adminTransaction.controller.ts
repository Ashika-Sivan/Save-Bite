import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/authRequest";
import { Order } from "../models/order/order.model";
import { Hotel } from "../models/vendor/hotel.model";
import { WalletTransaction } from "../models/wallet/walletTransaction.model";
import { ResponseHelper } from "../utils/ResponseHelper";
import { StatusCode } from "../constants/statusCode";

export class AdminTransactionController {
  /**
   * Financial Overview: Total Gross Sales, Admin Commission, Vendor Net Earnings, Total Count
   */
  async getOverview(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Aggregate over paid orders
      const totalsAggregation = await Order.aggregate([
        {
          $match: {
            paymentStatus: "paid",
          },
        },
        {
          $group: {
            _id: null,
            totalGrossSales: { $sum: "$totalAmount" },
            totalAdminCommission: { $sum: "$platformCommissionAmount" },
            totalVendorEarnings: { $sum: "$vendorAmount" },
            totalTransactions: { $sum: 1 },
          },
        },
      ]);

      const totals = totalsAggregation[0] || {
        totalGrossSales: 0,
        totalAdminCommission: 0,
        totalVendorEarnings: 0,
        totalTransactions: 0,
      };

      // Fallback check if WalletTransactions exist for additional verification
      const walletAggregation = await WalletTransaction.aggregate([
        {
          $match: {
            status: "COMPLETED",
          },
        },
        {
          $group: {
            _id: null,
            walletGross: { $sum: "$orderTotal" },
            walletCommission: { $sum: "$platformCommission" },
            walletVendorAmount: { $sum: "$vendorAmount" },
            walletCount: { $sum: 1 },
          },
        },
      ]);

      const walletTotals = walletAggregation[0] || {
        walletGross: 0,
        walletCommission: 0,
        walletVendorAmount: 0,
        walletCount: 0,
      };

      // If Order table has no paid records but WalletTransaction has records, use WalletTransaction totals
      const finalOverview = {
        totalGrossSales: totals.totalGrossSales || walletTotals.walletGross || 0,
        totalAdminCommission: totals.totalAdminCommission || walletTotals.walletCommission || 0,
        totalVendorEarnings: totals.totalVendorEarnings || walletTotals.walletVendorAmount || 0,
        totalTransactions: totals.totalTransactions || walletTotals.walletCount || 0,
      };

      ResponseHelper.success(
        res,
        StatusCode.OK,
        "Admin transaction overview fetched successfully",
        finalOverview
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Vendor Breakdown: Financial breakdown per vendor/hotel showing earnings & admin cuts
   * Supports filtering by businessType and sorting by adminCommission (high to low / low to high)
   */
  async getVendorBreakdown(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
      const search = (req.query.search as string || "").trim();
      const businessTypeFilter = (req.query.businessType as string || "").trim();
      const sortAdminEarned = req.query.sortAdminEarned as string | undefined; // "desc" | "asc"

      // Get distinct business types from Hotel model for UI filter dropdown
      const rawBusinessTypes = await Hotel.distinct("businessType");
      const businessTypes = Array.from(new Set(rawBusinessTypes.filter(Boolean)));

      // Aggregate earnings per vendor/hotel from Order collection
      const vendorSalesAggregation = await Order.aggregate([
        {
          $match: {
            paymentStatus: "paid",
          },
        },
        {
          $group: {
            _id: "$hotelId",
            vendorId: { $first: "$vendorId" },
            totalOrders: { $sum: 1 },
            grossSales: { $sum: "$totalAmount" },
            adminCommission: { $sum: "$platformCommissionAmount" },
            vendorNetPayout: { $sum: "$vendorAmount" },
          },
        },
      ]);

      // Create a map for quick lookup by hotelId / vendorId
      const earningsMap = new Map<string, any>();
      vendorSalesAggregation.forEach((item) => {
        if (item._id) {
          earningsMap.set(item._id.toString(), item);
        }
        if (item.vendorId) {
          earningsMap.set(`vendor_${item.vendorId.toString()}`, item);
        }
      });

      // Fetch hotels to list all hotels with business details
      const hotelQuery: any = {};

      if (businessTypeFilter && businessTypeFilter !== "ALL") {
        hotelQuery.businessType = { $regex: new RegExp(`^${businessTypeFilter}$`, "i") };
      }

      if (search) {
        hotelQuery.$or = [
          { hotelName: { $regex: search, $options: "i" } },
          { place: { $regex: search, $options: "i" } },
          { businessType: { $regex: search, $options: "i" } },
        ];
      }

      const hotels = await Hotel.find(hotelQuery).populate("vendorId", "businessInfo status");

      let items = hotels.map((hotel: any) => {
        const hotelIdStr = hotel._id.toString();
        const vendorIdStr = hotel.vendorId ? hotel.vendorId._id.toString() : null;

        const earnings =
          earningsMap.get(hotelIdStr) ||
          (vendorIdStr ? earningsMap.get(`vendor_${vendorIdStr}`) : null) || {
            totalOrders: 0,
            grossSales: 0,
            adminCommission: 0,
            vendorNetPayout: 0,
          };

        return {
          hotelId: hotel._id,
          vendorId: hotel.vendorId ? hotel.vendorId._id : null,
          hotelName: hotel.hotelName,
          businessName: hotel.vendorId?.businessInfo?.businessName || hotel.hotelName,
          place: hotel.place,
          businessType: hotel.businessType,
          totalOrders: earnings.totalOrders,
          grossSales: earnings.grossSales,
          adminCommission: earnings.adminCommission,
          vendorNetPayout: earnings.vendorNetPayout,
        };
      });

      // Sort by Admin Commission Earned if specified
      if (sortAdminEarned === "desc") {
        items.sort((a, b) => b.adminCommission - a.adminCommission);
      } else if (sortAdminEarned === "asc") {
        items.sort((a, b) => a.adminCommission - b.adminCommission);
      }

      const totalHotelsCount = items.length;
      const paginatedItems = items.slice((page - 1) * limit, page * limit);

      ResponseHelper.success(res, StatusCode.OK, "Vendor breakdown fetched successfully", {
        items: paginatedItems,
        businessTypes,
        pagination: {
          total: totalHotelsCount,
          page,
          limit,
          totalPages: Math.ceil(totalHotelsCount / limit) || 1,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Recent Transactions Ledger: Paginated list of recent order transactions
   */
  async getRecentTransactions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
      const search = (req.query.search as string || "").trim();
      const statusFilter = req.query.status as string | undefined;

      const skip = (page - 1) * limit;

      const query: any = {};

      if (statusFilter && statusFilter !== "ALL") {
        query.orderStatus = statusFilter;
      }

      if (search) {
        // Find matching users or hotels
        const matchingHotels = await Hotel.find({
          hotelName: { $regex: search, $options: "i" },
        }).select("_id");

        const hotelIds = matchingHotels.map((h) => h._id);

        query.$or = [
          { pickupCode: { $regex: search, $options: "i" } },
          { hotelId: { $in: hotelIds } },
        ];
      }

      const total = await Order.countDocuments(query);
      const orders = await Order.find(query)
        .populate("customerId", "name email phone")
        .populate("hotelId", "hotelName place")
        .populate("vendorId", "businessInfo")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const items = orders.map((order: any) => ({
        _id: order._id,
        orderId: order._id,
        pickupCode: order.pickupCode || "N/A",
        customerName: order.customerId?.name || "Customer",
        customerEmail: order.customerId?.email || "N/A",
        hotelName: order.hotelId?.hotelName || "Hotel",
        vendorBusinessName: order.vendorId?.businessInfo?.businessName || order.hotelId?.hotelName || "Vendor",
        totalAmount: order.totalAmount,
        platformCommissionAmount: order.platformCommissionAmount,
        vendorAmount: order.vendorAmount,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
      }));

      ResponseHelper.success(res, StatusCode.OK, "Recent transactions fetched successfully", {
        items,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminTransactionController = new AdminTransactionController();
