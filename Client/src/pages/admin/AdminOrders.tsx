import Pagination from "../../components/common/Pagination";
import { useEffect, useState, useCallback } from "react";
import DataTable, { type TableColumn } from "../../components/common/DataTable";
import StatusBadge from "../../components/common/StatusBadge";
import { getAdminOrders } from "../../services/admin.service";
import { downloadOrdersPDF } from "../../utils/pdfExporter";
import toast from "react-hot-toast";
import { Download } from "lucide-react";

type StatusTab = "all" | "pending_payment" | "paid" | "collected" | "cancelled";

const TABS: { key: StatusTab; label: string }[] = [
  { key: "all", label: "All Orders" },
  { key: "pending_payment", label: "Pending Payment" },
  { key: "paid", label: "Paid" },
  { key: "collected", label: "Collected" },
  { key: "cancelled", label: "Cancelled" },
];

const LIMIT = 10;

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [tab, setTab] = useState<StatusTab>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const result = await getAdminOrders({
        page,
        limit: LIMIT,
        status: tab === "all" ? undefined : tab,
      });
      setOrders(result.items || []);
      setTotal(result.total || 0);
      setTotalPages(result.totalPages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch orders");
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [page, tab]);

  useEffect(() => {
    const loadData = async () => {
      await fetchOrders();
    };
    loadData();
  }, [fetchOrders]);

  const handleTabChange = (key: StatusTab) => {
    setTab(key);
    setPage(1);
  };

  const handleDownloadPDF = () => {
    if (orders.length === 0) {
      toast.error("No order records available to export");
      return;
    }
    const currentTabObj = TABS.find((t) => t.key === tab);
    try {
      downloadOrdersPDF(orders, currentTabObj?.label || "All Orders");
      toast.success("Orders PDF downloaded successfully!");
    } catch (err) {
      toast.error("Failed to generate PDF document");
    }
  };

  const columns: TableColumn<any>[] = [
    {
      header: "Order / Pickup Code",
      render: (order: any) => (
        <div className="flex flex-col">
          <span className="font-mono text-sm font-bold text-gray-900 uppercase">
            {order.pickupCode ? `#${order.pickupCode}` : `#${order._id?.slice(-6) || "N/A"}`}
          </span>
          <span className="text-[10px] text-gray-400 font-mono">
            {order._id}
          </span>
        </div>
      ),
    },
    {
      header: "Customer",
      render: (order: any) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{order.customerId?.name || "Unknown"}</span>
          <span className="text-xs text-gray-500">{order.customerId?.email || ""}</span>
        </div>
      ),
    },
    {
      header: "Hotel",
      render: (order: any) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{order.hotelId?.hotelName || "Unknown"}</span>
          <span className="text-xs text-gray-500">{order.vendorId?.businessName || ""}</span>
        </div>
      ),
    },
    {
      header: "Amount",
      render: (order: any) => (
        <span className="font-semibold text-gray-900">
          ₹{(order.totalAmount || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: "Revenue (Platform)",
      render: (order: any) => (
        <span className="font-semibold text-green-600">
          ₹{(order.platformCommissionAmount || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: "Escrow (Vendor)",
      render: (order: any) => (
        <span className="font-semibold text-blue-600">
          ₹{(order.vendorAmount || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: "Order Status",
      render: (order: any) => {
        const status = order.orderStatus || "";
        return (
          <StatusBadge status={status.replace("_", " ")} />
        );
      },
    },
    {
      header: "Settlement",
      render: (order: any) => {
        const status = order.settlementStatus || "";
        return (
          <StatusBadge status={status} />
        );
      },
    },
    {
      header: "Date",
      render: (order: any) => (
        <span className="text-sm text-gray-500">
          {new Date(order.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders & Escrow</h1>
          <p className="text-sm text-gray-500">
            View all platform transactions, revenue, and pending vendor payouts.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadPDF}
          className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800 active:scale-95"
        >
          <Download size={16} />
          Download Orders PDF
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-6 flex flex-col justify-between gap-4 border-b border-gray-200 pb-4 sm:flex-row sm:items-center">
          <div className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => handleTabChange(t.key)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  tab === t.key
                    ? "bg-green-700 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <div className="rounded-xl bg-red-50 p-4 text-red-600 mb-6">{error}</div>
        ) : null}

        <DataTable
          columns={columns}
          data={orders}
          getRowKey={(order) => order._id}
          emptyMessage="No orders found."
        />

        {!loading && totalPages > 1 && (
          <div className="mt-6 flex justify-center border-t border-gray-100 pt-6">
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              limit={LIMIT}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
