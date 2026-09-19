import { useEffect, useState } from "react";
import {
  getAdminRefundReports,
  triggerAutoRefunds,
  type RefundReportResponse,
} from "../../services/adminTransaction.service";
import toast from "react-hot-toast";
import Pagination from "../../components/common/Pagination";
import DataTable from "../../components/common/DataTable";
import { Search, RefreshCw, Undo2, RotateCcw } from "lucide-react";

const AdminRefunds = () => {
  const [data, setData] = useState<RefundReportResponse>({
    totalRefundedAmount: 0,
    totalRefundedTransactions: 0,
    items: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isTriggering, setIsTriggering] = useState(false);

  // Search Debouncing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchRefunds = async () => {
    try {
      setIsLoading(true);
      const res = await getAdminRefundReports({
        page,
        limit: 10,
        search: debouncedSearch.trim() || undefined,
      });
      setData(res);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load refund reports");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, [page, debouncedSearch]);

  const handleRefresh = () => {
    fetchRefunds();
    toast.success("Refund data refreshed");
  };

  const handleTriggerRefunds = async () => {
    try {
      setIsTriggering(true);
      const res = await triggerAutoRefunds();
      toast.success(res.message || "Auto-refunds triggered successfully!");
      fetchRefunds(); // Refresh the table after triggering
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to trigger auto-refunds");
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6faf5] p-6 md:p-10 font-sans text-gray-800">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
              Refund Reports
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Overview of all refunded orders, including administrative approvals, auto-refunds for no-shows, and cancellations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleTriggerRefunds}
              disabled={isTriggering}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800 shadow-sm transition hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw size={16} className={isTriggering ? "animate-spin" : ""} />
              Trigger Auto-Refunds
            </button>
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin text-green-700" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Overview Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
          
          {/* Card 1: Total Refunded Amount */}
          <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-5 shadow-sm">
            <div className="flex items-center justify-between text-rose-800">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Amount Refunded</span>
              <Undo2 size={18} className="text-rose-600" />
            </div>
            <p className="mt-3 text-3xl font-bold text-rose-900">
              ₹{data.totalRefundedAmount.toLocaleString("en-IN")}
            </p>
            <p className="mt-1 text-xs text-rose-700 font-medium">Total refunds issued to customers</p>
          </div>

          {/* Card 2: Total Refunded Transactions */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Refunded Orders</span>
              <RotateCcw size={18} className="text-indigo-500" />
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              {data.totalRefundedTransactions}
            </p>
            <p className="mt-1 text-xs text-gray-400">Number of orders partially or fully refunded</p>
          </div>
        </div>

        {/* Breakdown Section Header */}
        <div className="flex items-center justify-between pt-2">
          <h2 className="text-xl font-bold text-gray-900">
            Refunds Ledger
          </h2>
          <span className="text-xs font-medium text-gray-500">
            Showing <strong className="text-gray-900">{data.items.length}</strong> of <strong className="text-gray-900">{data.pagination.total}</strong> refunds
          </span>
        </div>

        {/* Breakdown Content */}
        <div className="space-y-4">
          
          {/* Filter & Sort Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="relative flex-1 min-w-[240px]">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Order ID, customer, or hotel..."
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-700 border-t-transparent" />
              </div>
            ) : data.items.length === 0 ? (
              <div className="p-12 text-center text-sm font-medium text-gray-500">
                No refunds found matching your criteria.
              </div>
            ) : (
              <DataTable
                columns={[
                  {
                    header: "Order / Date",
                    render: (v) => (
                      <>
                        <span className="font-semibold text-gray-900 block">
                          ORD-{v.orderId.slice(-5).toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(v.refundDate).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric"
                          })}
                        </span>
                      </>
                    ),
                  },
                  {
                    header: "Customer & Hotel",
                    render: (v) => (
                      <>
                        <span className="font-semibold text-gray-900 block">
                          {v.customerName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {v.hotelName}
                        </span>
                      </>
                    ),
                  },
                  {
                    header: "Status / Type",
                    render: (v) => {
                      let typeLabel = "Unknown";
                      let color = "bg-gray-100 text-gray-700";
                      
                      if (v.orderStatus === "resolved") {
                        typeLabel = "Concern Resolved";
                        color = "bg-emerald-100 text-emerald-800 border-emerald-200";
                      } else if (v.orderStatus === "auto_refunded") {
                        typeLabel = "No-show Auto Refund";
                        color = "bg-amber-100 text-amber-800 border-amber-200";
                      } else if (v.orderStatus === "cancelled") {
                        typeLabel = "Cancelled";
                        color = "bg-rose-100 text-rose-800 border-rose-200";
                      }

                      return (
                        <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold border ${color}`}>
                          {typeLabel}
                        </span>
                      );
                    },
                  },
                  {
                    header: "Total Value",
                    align: "right",
                    render: (v) => (
                      <span className="font-medium text-gray-500 line-through">
                        ₹{v.totalAmount.toLocaleString("en-IN")}
                      </span>
                    ),
                  },
                  {
                    header: "Refund Amount",
                    align: "right",
                    render: (v) => (
                      <span className="font-bold text-rose-700 bg-rose-50/50 px-2 py-1 rounded">
                        ₹{v.refundAmount.toLocaleString("en-IN")}
                        <span className="text-[10px] text-rose-500 block">({v.refundPercentage}%)</span>
                      </span>
                    ),
                  },
                ]}
                data={data.items}
                getRowKey={(v) => v.orderId}
              />
            )}

            {/* Pagination */}
            {data.pagination.totalPages > 1 && (
              <div className="border-t border-gray-100 p-4">
                <Pagination
                  page={data.pagination.page}
                  totalPages={data.pagination.totalPages}
                  total={data.pagination.total}
                  limit={data.pagination.limit}
                  onPageChange={(p) => setPage(p)}
                />
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminRefunds;
