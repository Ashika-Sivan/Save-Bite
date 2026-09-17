import { IAdminTransactionService } from "../../interfaces/service/adminTransaction/IAdminTransactionService";
import { IOrderRepository } from "../../interfaces/repository/IOrderRepository";
import { IHotel } from "../../interfaces/models/IHotel.model";
import { IOrder } from "../../interfaces/models/IOrder.model";
import { IHotelRepository } from "../../interfaces/repository/IHotelRepository";
import { IWalletTransactionRepository } from "../../interfaces/repository/IWalletTransactionRepository";

export class AdminTransactionService implements IAdminTransactionService {
    constructor(
        private _orderRepository: IOrderRepository,
        private _hotelRepository: IHotelRepository,
        private _walletTransactionRepository: IWalletTransactionRepository
    ) {}

    async getOverview(): Promise<any> {
        const totalsAggregation = await this._orderRepository.aggregateOrders([
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

        const walletAggregation = await this._walletTransactionRepository.aggregateTotals({ status: "COMPLETED" });

        const walletTotals = walletAggregation[0] || {
            walletGross: 0,
            walletCommission: 0,
            walletVendorAmount: 0,
            walletCount: 0,
        };

        return {
            totalGrossSales: totals.totalGrossSales || walletTotals.walletGross || 0,
            totalAdminCommission: totals.totalAdminCommission || walletTotals.walletCommission || 0,
            totalVendorEarnings: totals.totalVendorEarnings || walletTotals.walletVendorAmount || 0,
            totalTransactions: totals.totalTransactions || walletTotals.walletCount || 0,
        };
    }

    async getVendorBreakdown(
        page: number,
        limit: number,
        search: string,
        businessTypeFilter: string,
        sortAdminEarned?: "desc" | "asc"
    ): Promise<any> {
        // Find distinct business types. 
        // We will assume the hotel repo has a method for distinct or we can fetch all and get unique.
        // For standard base repo, let's just fetch all and map to unique business types.
        const allHotels = await this._hotelRepository.findAll();
        const rawBusinessTypes = allHotels.map(h => h.businessType);
        const businessTypes = Array.from(new Set(rawBusinessTypes.filter(Boolean)));

        const vendorSalesAggregation = await this._orderRepository.aggregateOrders([
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

        const earningsMap = new Map<string, any>();
        vendorSalesAggregation.forEach((item) => {
            if (item._id) earningsMap.set(item._id.toString(), item);
            if (item.vendorId) earningsMap.set(`vendor_${item.vendorId.toString()}`, item);
        });

        // Filter hotels manually as we don't have populate in find query standard in IHotelRepository
        let filteredHotels = allHotels;
        if (businessTypeFilter && businessTypeFilter !== "ALL") {
            filteredHotels = filteredHotels.filter((h: IHotel) => h.businessType?.toLowerCase() === businessTypeFilter.toLowerCase());
        }
        if (search) {
            filteredHotels = filteredHotels.filter((h: IHotel) => 
                h.hotelName?.toLowerCase().includes(search.toLowerCase()) || 
                h.place?.toLowerCase().includes(search.toLowerCase()) ||
                h.businessType?.toLowerCase().includes(search.toLowerCase())
            );
        }

        // We can't easily populate vendorId businessInfo here without a specific repo method,
        // but for now we'll just return what we have (or we could fetch vendors if needed, but let's keep it simple).
        // The original controller populated vendorId. 
        
        let items = filteredHotels.map((hotel: IHotel) => {
            const hotelIdStr = hotel._id.toString();
            // Assuming vendorId is just an object ID string in the model when not populated
            const vendorIdStr = hotel.vendorId?.toString() || null;

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
                vendorId: hotel.vendorId,
                hotelName: hotel.hotelName,
                businessName: hotel.hotelName, // simplified since we don't populate vendor
                place: hotel.place,
                businessType: hotel.businessType,
                totalOrders: earnings.totalOrders,
                grossSales: earnings.grossSales,
                adminCommission: earnings.adminCommission,
                vendorNetPayout: earnings.vendorNetPayout,
            };
        });

        if (sortAdminEarned === "desc") {
            items.sort((a: { adminCommission: number }, b: { adminCommission: number }) => b.adminCommission - a.adminCommission);
        } else if (sortAdminEarned === "asc") {
            items.sort((a: { adminCommission: number }, b: { adminCommission: number }) => a.adminCommission - b.adminCommission);
        }

        const totalHotelsCount = items.length;
        const paginatedItems = items.slice((page - 1) * limit, page * limit);

        return {
            items: paginatedItems,
            businessTypes,
            pagination: {
                total: totalHotelsCount,
                page,
                limit,
                totalPages: Math.ceil(totalHotelsCount / limit) || 1,
            },
        };
    }

    async getRecentTransactions(
        page: number,
        limit: number,
        search: string,
        statusFilter?: string
    ): Promise<any> {
        const query: Record<string, unknown> = {};

        if (statusFilter && statusFilter !== "ALL") {
            query.status = statusFilter;
        }

        if (search) {
            const allHotels = await this._hotelRepository.findAll();
            const matchingHotels = allHotels.filter((h: IHotel) => h.hotelName?.toLowerCase().includes(search.toLowerCase()));
            const hotelIds = matchingHotels.map((h: IHotel) => h._id.toString());

            query.search = search;
            query.hotelIds = hotelIds; // Custom filter passed down, but for standard we will use findAllOrders
        }


        const result = await this._orderRepository.findAllOrders({ page, limit, status: statusFilter !== "ALL" ? statusFilter : undefined });

        let orders = result.orders;
        
        if (search) {
            orders = orders.filter((order: IOrder) => 
                order.pickupCode?.toLowerCase().includes(search.toLowerCase()) ||
                (order.hotelId as unknown as { hotelName?: string })?.hotelName?.toLowerCase().includes(search.toLowerCase())
            );
        }

        const items = orders.map((order: IOrder) => ({
            _id: order._id,
            orderId: order._id,
            pickupCode: order.pickupCode || "N/A",
            customerName: (order.customerId as unknown as { name?: string })?.name || "Customer",
            customerEmail: (order.customerId as unknown as { email?: string })?.email || "N/A",
            hotelName: (order.hotelId as unknown as { hotelName?: string })?.hotelName || "Hotel",
            vendorBusinessName: (order.vendorId as unknown as { businessName?: string })?.businessName || (order.hotelId as unknown as { hotelName?: string })?.hotelName || "Vendor",
            totalAmount: order.totalAmount,
            platformCommissionAmount: order.platformCommissionAmount,
            vendorAmount: order.vendorAmount,
            orderStatus: order.orderStatus,
            paymentStatus: order.paymentStatus,
            createdAt: order.createdAt,
        }));

        return {
            items,
            pagination: {
                total: result.total,
                page,
                limit,
                totalPages: Math.ceil(result.total / limit) || 1,
            },
        };
    }

    async getRefundReport(
        page: number,
        limit: number,
        search: string
    ): Promise<any> {
        // Find orders with refunded statuses
        const refundStatuses = ["resolved", "cancelled", "auto_refunded"];
        
        const totalsAggregation = await this._orderRepository.aggregateOrders([
            {
                $match: {
                    orderStatus: { $in: refundStatuses }
                }
            },
            {
                $project: {
                    refundAmount: {
                        $cond: {
                            if: { $eq: ["$orderStatus", "auto_refunded"] },
                            then: { $multiply: ["$totalAmount", 0.70] },
                            else: "$totalAmount"
                        }
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRefundedAmount: { $sum: "$refundAmount" },
                    totalRefundedTransactions: { $sum: 1 }
                }
            }
        ]);

        const totals = totalsAggregation[0] || { totalRefundedAmount: 0, totalRefundedTransactions: 0 };

        // For pagination and search, fetch all matching orders and map
        let allOrders = await this._orderRepository.findAll();
        let refundedOrders = allOrders.filter(o => refundStatuses.includes(o.orderStatus));

        if (search) {
            refundedOrders = refundedOrders.filter((order: IOrder) => 
                order._id.toString().toLowerCase().includes(search.toLowerCase()) ||
                (order.customerId as unknown as { name?: string })?.name?.toLowerCase().includes(search.toLowerCase()) ||
                (order.hotelId as unknown as { hotelName?: string })?.hotelName?.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Sort by most recent first
        refundedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const totalItems = refundedOrders.length;
        const paginatedOrders = refundedOrders.slice((page - 1) * limit, page * limit);

        const items = paginatedOrders.map((order: IOrder) => {
            let refundPercentage = 100;
            let refundAmount = order.totalAmount;

            if (order.orderStatus === "auto_refunded") {
                refundPercentage = 70;
                refundAmount = Number((order.totalAmount * 0.70).toFixed(2));
            }

            return {
                _id: order._id,
                orderId: order._id,
                customerName: (order.customerId as unknown as { name?: string })?.name || "Customer",
                hotelName: (order.hotelId as unknown as { hotelName?: string })?.hotelName || "Hotel",
                totalAmount: order.totalAmount,
                refundAmount: refundAmount,
                refundPercentage: refundPercentage,
                orderStatus: order.orderStatus,
                refundDate: order.updatedAt,
            };
        });

        return {
            totalRefundedAmount: totals.totalRefundedAmount,
            totalRefundedTransactions: totals.totalRefundedTransactions,
            items,
            pagination: {
                total: totalItems,
                page,
                limit,
                totalPages: Math.ceil(totalItems / limit) || 1,
            }
        };
    }
}
