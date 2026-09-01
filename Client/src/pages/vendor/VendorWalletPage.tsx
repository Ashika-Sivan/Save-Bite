import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Wallet,
  TrendingUp,
  Percent,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import TransactionTable from "../../components/common/TransactionTable";
import { getVendorWalletSummary, type WalletData, type WalletTransactionData } from "../../services/wallet.service";

export default function VendorWalletPage() {

  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<WalletTransactionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

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
                <TransactionTable transactions={transactions} />
              </>
            )}
    </main>
  );
}
