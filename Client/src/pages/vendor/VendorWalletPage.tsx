import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import {
  Wallet,
  TrendingUp,
  Percent,
  RefreshCw,
  CheckCircle2,
  ArrowUpRight,
  Receipt,
  Search,
} from "lucide-react";
import DataTable, { type TableColumn } from "../../components/common/DataTable";
import Pagination from "../../components/common/Pagination";
import { getVendorWalletSummary, type WalletData, type WalletTransactionData } from "../../services/wallet.service";

export default function VendorWalletPage() {

  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<WalletTransactionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const limit = 10;

  const fetchWalletSummary = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      const res = await getVendorWalletSummary();
      if (res.success && res.data) {
        setWallet(res.data.wallet);
        setTransactions(res.data.transactions);
        if (showToast) toast.success("Wallet updated");
      }
    } catch (error: unknown) {
      console.error("Failed to load wallet:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to load wallet details");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    getVendorWalletSummary()
      .then((res) => {
        if (isMounted && res.success && res.data) {
          setWallet(res.data.wallet);
          setTransactions(res.data.transactions);
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          console.error("Failed to load wallet:", error);
          const err = error as { response?: { data?: { message?: string } } };
          toast.error(err?.response?.data?.message || "Failed to load wallet details");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter transactions based on search query
  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions;
    const query = searchQuery.toLowerCase();
    return transactions.filter(
      (tx) =>
        tx.description?.toLowerCase().includes(query) ||
        tx.orderId?.toLowerCase().includes(query) ||
        tx.status?.toLowerCase().includes(query)
    );
  }, [transactions, searchQuery]);

  const total = filteredTransactions.length;
  const totalPages = Math.ceil(total / limit);
  const paginatedTransactions = filteredTransactions.slice((page - 1) * limit, page * limit);

  const columns: TableColumn<WalletTransactionData>[] = [
    {
      header: "Transaction Details",
      render: (tx) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100 text-green-700">
            <ArrowUpRight size={18} />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{tx.description}</p>
            {tx.orderId && (
              <p className="text-xs font-mono text-gray-400">Order #: {tx.orderId.slice(-6).toUpperCase()}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Order Total",
      render: (tx) => <span className="font-bold text-gray-900">₹{tx.orderTotal}</span>,
    },
    {
      header: "Vendor 90%",
      render: (tx) => <span className="font-bold text-green-700">+₹{tx.vendorAmount}</span>,
    },
    {
      header: "Platform 10%",
      render: (tx) => <span className="font-semibold text-amber-700">₹{tx.platformCommission}</span>,
    },
    {
      header: "Status",
      render: (tx) => (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-800 border border-green-200">
          <CheckCircle2 size={12} />
          {tx.status}
        </span>
      ),
    },
    {
      header: "Date & Time",
      render: (tx) => <span className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleString()}</span>,
    },
  ];

  return (
    <main className="flex-1 p-5 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Vendor Wallet 💰
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Track your net earnings (90% order payout), platform commission (10%), and complete transaction ledger.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => fetchWalletSummary(true)}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
          <div className="text-right hidden sm:block">
            <p className="font-semibold text-gray-800">Vendor Financials</p>
            <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
              90/10 Payout Model
            </span>
          </div>
        </div>
      </div>

            {loading ? (
              <div className="mt-12 flex flex-col items-center justify-center p-8">
                <RefreshCw size={36} className="animate-spin text-green-700" />
                <p className="mt-4 font-medium text-gray-600">Loading wallet details...</p>
              </div>
            ) : (
              <>
                {/* Financial Summary Cards */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Current Balance Card */}
                  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-700 to-emerald-900 p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-green-200">
                        Available Wallet Balance
                      </span>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
                        <Wallet size={20} />
                      </div>
                    </div>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-2xl font-bold">₹</span>
                      <h3 className="text-4xl font-extrabold tracking-tight">
                        {wallet?.balance?.toFixed(2) || "0.00"}
                      </h3>
                    </div>
                    <p className="mt-4 text-xs text-green-200/90 flex items-center gap-1">
                      <CheckCircle2 size={14} className="text-emerald-300" />
                      Automatic settlement upon pickup verification
                    </p>
                  </div>

                  {/* Total Earnings (90%) */}
                  <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        Total Net Earnings (90%)
                      </span>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700">
                        <TrendingUp size={20} />
                      </div>
                    </div>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-xl font-bold text-gray-700">₹</span>
                      <h3 className="text-3xl font-bold text-gray-900">
                        {wallet?.totalEarnings?.toFixed(2) || "0.00"}
                      </h3>
                    </div>
                    <p className="mt-4 text-xs text-gray-500">Cumulative payout credited to date</p>
                  </div>

                  {/* Platform Commission Paid (10%) */}
                  <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        Platform Commission (10%)
                      </span>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                        <Percent size={20} />
                      </div>
                    </div>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-xl font-bold text-gray-700">₹</span>
                      <h3 className="text-3xl font-bold text-gray-900">
                        {wallet?.totalCommissionPaid?.toFixed(2) || "0.00"}
                      </h3>
                    </div>
                    <p className="mt-4 text-xs text-gray-500">Cumulative 10% platform fee logged</p>
                  </div>
                </div>

                {/* Ledger Transactions History */}
                <div className="mt-10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Transaction History</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Detailed audit trail of all settlement credits and payouts.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="text"
                          placeholder="Search transactions..."
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPage(1); // Reset page on search
                          }}
                          className="w-full sm:w-64 rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-2 rounded-xl border border-gray-200 whitespace-nowrap">
                        {total} Transactions
                      </span>
                    </div>
                  </div>

                  {transactions.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50/50 p-12 text-center">
                      <Receipt className="mx-auto text-gray-300" size={56} />
                      <h4 className="mt-4 text-lg font-bold text-gray-800">No transactions recorded yet</h4>
                      <p className="mt-2 text-sm text-gray-500">When customers pickup food and you verify their pickup code, payouts will appear here automatically.</p>
                    </div>
                  ) : filteredTransactions.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50/50 p-12 text-center">
                      <Search className="mx-auto text-gray-300" size={56} />
                      <h4 className="mt-4 text-lg font-bold text-gray-800">No matching transactions found</h4>
                      <p className="mt-2 text-sm text-gray-500">Try adjusting your search query.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <DataTable
                        columns={columns}
                        data={paginatedTransactions}
                        getRowKey={(tx) => tx.id}
                      />
                      {total > limit && (
                        <Pagination
                          page={page}
                          limit={limit}
                          total={total}
                          totalPages={totalPages}
                          onPageChange={setPage}
                        />
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
    </main>
  );
}
