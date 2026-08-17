import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  Utensils,
  ShoppingBag,
  Wallet,
  User,
  LogOut,
  TrendingUp,
  Percent,
  RefreshCw,
  ArrowUpRight,
  Receipt,
  CheckCircle2,
} from "lucide-react";
import { getVendorWalletSummary, type WalletData, type WalletTransactionData } from "../../services/wallet.service";
import { logout } from "../../services/auth.service";
import { clearCredentials } from "../../redux/authSlice";
import { clearCart } from "../../redux/cartSlice";
import type { AppDispatch } from "../../redux/store";
import { APP_ROUTES } from "../../constants/appRoutes";

export default function VendorWalletPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

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

  const handleLogout = () => {
    toast((t) => (
      <div>
        <p className="font-medium text-gray-900">Are you sure you want to logout?</p>
        <div className="mt-3 flex justify-end gap-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await logout();
                dispatch(clearCredentials());
                dispatch(clearCart());
                toast.success("Logged out successfully");
                navigate("/login", { replace: true });
              } catch (_error) {
                toast.error("Failed to logout");
              }
            }}
            className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-[#faf7ef] p-4 md:p-6">
      <div className="mx-auto flex min-h-[95vh] max-w-7xl flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-gray-200 px-6 py-5 md:px-8">
          <div
            className="flex cursor-pointer items-center gap-3"
            onClick={() => navigate("/")}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-700 text-white shadow-md">
              🍃
            </div>
            <h1 className="text-2xl font-bold text-green-700">SaveBite</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => fetchWalletSummary(true)}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
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
        </header>

        <div className="flex flex-1 flex-col md:flex-row">
          {/* Sidebar */}
          <aside className="border-b border-gray-200 bg-gray-50 p-4 md:w-64 md:border-b-0 md:border-r">
            <nav className="space-y-2">
              <button
                onClick={() => navigate(APP_ROUTES.VENDOR.DASHBOARD)}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium text-gray-600 hover:bg-green-50 hover:text-green-700 transition"
              >
                <LayoutDashboard size={20} />
                Dashboard
              </button>

              <button
                onClick={() => navigate(APP_ROUTES.VENDOR.HOTELS)}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium text-gray-600 hover:bg-green-50 hover:text-green-700 transition"
              >
                <Utensils size={20} />
                Hotel List
              </button>

              <button
                onClick={() => navigate(APP_ROUTES.VENDOR.ORDERS)}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium text-gray-600 hover:bg-green-50 hover:text-green-700 transition"
              >
                <ShoppingBag size={20} />
                Orders
              </button>

              <button className="flex w-full items-center gap-3 rounded-xl bg-green-700 px-4 py-3 text-left font-medium text-white shadow-sm">
                <Wallet size={20} />
                Wallet
              </button>

              <button
                onClick={() => navigate("/vendor/profile")}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium text-gray-600 hover:bg-green-50 hover:text-green-700 transition"
              >
                <User size={20} />
                Profile
              </button>

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium text-red-500 hover:bg-red-50 transition"
              >
                <LogOut size={20} />
                Logout
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6 md:p-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Vendor Wallet 💰
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Track your net earnings (90% order payout), platform commission (10%), and complete transaction ledger.
              </p>
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
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Transaction History</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Detailed audit trail of all settlement credits and payouts.
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {transactions.length} Transactions
                    </span>
                  </div>

                  {transactions.length === 0 ? (
                    <div className="mt-6 rounded-3xl border border-dashed border-gray-300 bg-gray-50/50 p-12 text-center">
                      <Receipt className="mx-auto text-gray-300" size={56} />
                      <h4 className="mt-4 text-lg font-bold text-gray-800">No transactions recorded yet</h4>
                      <p className="mt-2 text-sm text-gray-500">
                        When customers pickup food and you verify their pickup code, 90% payout credits will appear here automatically.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                          <thead className="border-b border-gray-200 bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500">
                            <tr>
                              <th className="px-6 py-4">Transaction Details</th>
                              <th className="px-6 py-4">Order Total</th>
                              <th className="px-6 py-4 text-green-700">Vendor 90%</th>
                              <th className="px-6 py-4 text-amber-700">Platform 10%</th>
                              <th className="px-6 py-4">Status</th>
                              <th className="px-6 py-4">Date & Time</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 font-medium">
                            {transactions.map((tx) => (
                              <tr key={tx.id} className="hover:bg-gray-50/80 transition">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100 text-green-700">
                                      <ArrowUpRight size={18} />
                                    </div>
                                    <div>
                                      <p className="font-semibold text-gray-900">{tx.description}</p>
                                      {tx.orderId && (
                                        <p className="text-xs font-mono text-gray-400">Order ID: {tx.orderId}</p>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 font-bold text-gray-900">
                                  ₹{tx.orderTotal}
                                </td>
                                <td className="px-6 py-4 font-bold text-green-700">
                                  +₹{tx.vendorAmount}
                                </td>
                                <td className="px-6 py-4 font-semibold text-amber-700">
                                  ₹{tx.platformCommission}
                                </td>
                                <td className="px-6 py-4">
                                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-800 border border-green-200">
                                    <CheckCircle2 size={12} />
                                    {tx.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-500">
                                  {new Date(tx.createdAt).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </main>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-gray-50 px-6 py-5 text-center text-sm text-gray-500 md:px-8">
          © 2026 <span className="font-semibold text-green-700">SaveBite</span>. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
