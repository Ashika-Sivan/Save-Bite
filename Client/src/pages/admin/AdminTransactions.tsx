import { useEffect, useState } from "react";
import {
  getAdminTransactionOverview,
  getVendorFinancialBreakdown,
  type TransactionOverview,
  type VendorFinancialItem,
} from "../../services/adminTransaction.service";
import { downloadTransactionsPDF } from "../../utils/pdfExporter";
import toast from "react-hot-toast";
import Pagination from "../../components/common/Pagination";
import DataTable from "../../components/common/DataTable";
import { Search, RefreshCw, DollarSign, Store, ShieldCheck, CreditCard, Download, ArrowUpDown, Filter } from "lucide-react";

const AdminTransactions = () => {
  // Overview State
  const [overview, setOverview] = useState<TransactionOverview>({
    totalGrossSales: 0,
    totalAdminCommission: 0,
    totalVendorEarnings: 0,
    totalTransactions: 0,
  });
  const [isOverviewLoading, setIsOverviewLoading] = useState(true);

  // Vendor Breakdown State
  const [vendors, setVendors] = useState<VendorFinancialItem[]>([]);
  const [vendorSearch, setVendorSearch] = useState("");
  const [debouncedVendorSearch, setDebouncedVendorSearch] = useState("");
  const [businessTypeFilter, setBusinessTypeFilter] = useState("ALL");
  const [businessTypesOptions, setBusinessTypesOptions] = useState<string[]>([]);
  const [sortAdminEarned, setSortAdminEarned] = useState<"desc" | "asc" | "">("");

  const [vendorPage, setVendorPage] = useState(1);
  const [vendorTotalPages, setVendorTotalPages] = useState(1);
  const [vendorTotal, setVendorTotal] = useState(0);
  const [isVendorsLoading, setIsVendorsLoading] = useState(false);

  // Search Debouncing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedVendorSearch(vendorSearch);
      setVendorPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [vendorSearch]);

  // Fetch Overview Data
  const fetchOverview = async () => {
    try {
      setIsOverviewLoading(true);
      const data = await getAdminTransactionOverview();
      setOverview(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load financial overview");
    } finally {
      setIsOverviewLoading(false);
    }
  };

  // Fetch Vendor Financial Breakdown
  const fetchVendorBreakdown = async () => {
    try {
      setIsVendorsLoading(true);
      const res = await getVendorFinancialBreakdown({
        page: vendorPage,
        limit: 10,
        search: debouncedVendorSearch.trim() || undefined,
        businessType: businessTypeFilter !== "ALL" ? businessTypeFilter : undefined,
        sortAdminEarned: sortAdminEarned || undefined,
      });
      setVendors(res.items || []);
      if (res.businessTypes && res.businessTypes.length > 0) {
        setBusinessTypesOptions(res.businessTypes);
      }
      setVendorTotal(res.pagination.total);
      setVendorTotalPages(res.pagination.totalPages);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load vendor financial breakdown");
    } finally {
      setIsVendorsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    fetchVendorBreakdown();
  }, [vendorPage, debouncedVendorSearch, businessTypeFilter, sortAdminEarned]);

  const handleRefreshAll = () => {
    fetchOverview();
    fetchVendorBreakdown();
    toast.success("Transaction data refreshed");
  };

  const handleDownloadPDF = () => {
    if (vendors.length === 0 && overview.totalGrossSales === 0) {
      toast.error("No transaction data available to export");
      return;
    }
    try {
      downloadTransactionsPDF(overview, vendors);
      toast.success("Financial Transactions PDF downloaded successfully!");
    } catch (err) {
      toast.error("Failed to generate PDF document");
    }
  };



  return (
    <div className="min-h-screen bg-[#f6faf5] p-6 md:p-10 font-sans text-gray-800">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
              Admin Financial Transactions
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Comprehensive platform revenue hub showing total platform sales, admin commission cut, and vendor net payout totals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800 active:scale-95"
            >
              <Download size={16} />
              Download PDF Report
            </button>

            <button
              type="button"
              onClick={handleRefreshAll}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              <RefreshCw size={16} className={isOverviewLoading || isVendorsLoading ? "animate-spin text-green-700" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Overview Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Card 1: Total Gross Sales */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Gross Sales</span>
              <DollarSign size={18} className="text-gray-400" />
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              ₹{overview.totalGrossSales.toLocaleString("en-IN")}
            </p>
            <p className="mt-1 text-xs text-gray-400">Total volume processed</p>
          </div>

          {/* Card 2: Admin Commission Earned */}
          <div className="rounded-2xl border border-green-200 bg-green-50/60 p-5 shadow-sm">
            <div className="flex items-center justify-between text-green-800">
              <span className="text-xs font-semibold uppercase tracking-wider">Admin Earned (Commission)</span>
              <ShieldCheck size={18} className="text-green-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-green-800">
                ₹{overview.totalAdminCommission.toLocaleString("en-IN")}
              </span>
              <span className="rounded-full bg-green-200/80 px-2 py-0.5 text-xs font-bold text-green-800">
                Net Profit
              </span>
            </div>
            <p className="mt-1 text-xs text-green-700 font-medium">Platform cut collected from vendors</p>
          </div>

          {/* Card 3: Vendor Net Earnings */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Vendor Earned</span>
              <Store size={18} className="text-blue-500" />
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              ₹{overview.totalVendorEarnings.toLocaleString("en-IN")}
            </p>
            <p className="mt-1 text-xs text-gray-400">Net payable to all partner hotels</p>
          </div>

          {/* Card 4: Total Completed Transactions */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Successful Transactions</span>
              <CreditCard size={18} className="text-indigo-500" />
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              {overview.totalTransactions}
            </p>
            <p className="mt-1 text-xs text-gray-400">Completed paid orders</p>
          </div>
        </div>

        {/* Vendor Breakdown Section Header */}
        <div className="flex items-center justify-between pt-2">
          <h2 className="text-xl font-bold text-gray-900">
            Amount Received Per Vendor
          </h2>
          <span className="text-xs font-medium text-gray-500">
            Showing <strong className="text-gray-900">{vendors.length}</strong> of <strong className="text-gray-900">{vendorTotal}</strong> vendors
          </span>
        </div>

        {/* Vendor Breakdown Content */}
        <div className="space-y-4">
          
          {/* Filter & Sort Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="relative flex-1 min-w-[240px]">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={vendorSearch}
                onChange={(e) => setVendorSearch(e.target.value)}
                placeholder="Search by vendor name, hotel, or place..."
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Business Type Filter Dropdown */}
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Filter size={14} className="text-gray-400" />
                <select
                  value={businessTypeFilter}
                  onChange={(e) => {
                    setBusinessTypeFilter(e.target.value);
                    setVendorPage(1);
                  }}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-green-600 font-medium"
                >
                  <option value="ALL">All Business Types</option>
                  {businessTypesOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                  {!businessTypesOptions.includes("Restaurant") && <option value="Restaurant">Restaurant</option>}
                  {!businessTypesOptions.includes("Bakery") && <option value="Bakery">Bakery</option>}
                  {!businessTypesOptions.includes("Supermarket") && <option value="Supermarket">Supermarket</option>}
                </select>
              </div>

              {/* Admin Earned Sort Dropdown */}
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <ArrowUpDown size={14} className="text-gray-400" />
                <select
                  value={sortAdminEarned}
                  onChange={(e) => {
                    setSortAdminEarned(e.target.value as "desc" | "asc" | "");
                    setVendorPage(1);
                  }}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-green-600 font-medium"
                >
                  <option value="">Sort: Default</option>
                  <option value="desc">Admin Earned: High to Low ↓</option>
                  <option value="asc">Admin Earned: Low to High ↑</option>
                </select>
              </div>
            </div>
          </div>

          {/* Vendor Table */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {isVendorsLoading ? (
              <div className="flex justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-700 border-t-transparent" />
              </div>
            ) : vendors.length === 0 ? (
              <div className="p-12 text-center text-sm font-medium text-gray-500">
                No vendor breakdown data found matching your search and filter criteria.
              </div>
            ) : (
              <DataTable
                columns={[
                  {
                    header: "Vendor / Hotel",
                    render: (v) => (
                      <>
                        <span className="font-semibold text-gray-900 block">
                          {v.hotelName}
                        </span>
                        <span className="text-xs text-gray-400">
                          {v.place} {v.businessName ? `• ${v.businessName}` : ""}
                        </span>
                      </>
                    ),
                  },
                  {
                    header: "Business Type",
                    render: (v) => (
                      <span className="inline-flex rounded-md bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 border border-gray-200">
                        {v.businessType}
                      </span>
                    ),
                  },
                  {
                    header: "Orders",
                    align: "center",
                    render: (v) => (
                      <span className="font-semibold text-gray-900">
                        {v.totalOrders}
                      </span>
                    ),
                  },
                  {
                    header: "Gross Sales",
                    align: "right",
                    render: (v) => (
                      <span className="font-medium text-gray-900">
                        ₹{v.grossSales.toLocaleString("en-IN")}
                      </span>
                    ),
                  },
                  {
                    header: "Admin Earned",
                    align: "right",
                    render: (v) => (
                      <span className="font-bold text-green-700 bg-green-50/30 px-2 py-1 rounded">
                        ₹{v.adminCommission.toLocaleString("en-IN")}
                      </span>
                    ),
                  },
                  {
                    header: "Vendor Net Total",
                    align: "right",
                    render: (v) => (
                      <span className="font-bold text-blue-700">
                        ₹{v.vendorNetPayout.toLocaleString("en-IN")}
                      </span>
                    ),
                  },
                ]}
                data={vendors}
                getRowKey={(v) => v.hotelId || v.hotelName}
              />
            )}

            {/* Vendor Pagination */}
            {vendorTotalPages > 1 && (
              <div className="border-t border-gray-100 p-4">
                <Pagination
                  page={vendorPage}
                  totalPages={vendorTotalPages}
                  total={vendorTotal}
                  limit={10}
                  onPageChange={(p) => setVendorPage(p)}
                />
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminTransactions;
