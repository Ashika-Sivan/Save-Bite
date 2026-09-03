import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Wallet,
  User,
  Plus,
  Clock3,
  IndianRupee,
  Star,
  ChevronDown,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getVendorOrders, type Order } from "../../services/order.service";
import { getVendorWalletSummary, type WalletData } from "../../services/wallet.service";
import { APP_ROUTES } from "../../constants/appRoutes";
import { getVendorHotels } from "../../services/hotel.service";
import type { Hotel } from "../../types/hotel.types";

export default function VendorDashboard() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [ordersRes, walletRes, hotelsRes] = await Promise.all([
          getVendorOrders().catch(() => null),
          getVendorWalletSummary().catch(() => null),
          getVendorHotels().catch(() => null),
        ]);

        if (ordersRes?.success && Array.isArray(ordersRes.data)) {
          setOrders(ordersRes.data);
        }
        if (walletRes?.success && walletRes.data?.wallet) {
          setWallet(walletRes.data.wallet);
        }
        if (hotelsRes?.success && Array.isArray(hotelsRes.data) && hotelsRes.data.length > 0) {
          setHotels(hotelsRes.data);
          setSelectedHotelId(hotelsRes.data[0]._id);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const isToday = (d?: string) => d && new Date(d).toDateString() === new Date().toDateString();
  const filteredOrders = selectedHotelId
    ? orders.filter((o) => o.hotelId === selectedHotelId)
    : orders;
  
  const todayOrders = filteredOrders.filter((o) => isToday(o.createdAt));
  const todayNetRevenue = todayOrders
    .filter((o) => o.orderStatus === "collected")
    .reduce((sum, o) => sum + o.totalAmount * 0.9, 0);

  // Trend Data for the last 7 days
  const trendData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      
      const startOfDay = new Date(d.setHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setHours(23, 59, 59, 999));

      const dailyOrders = filteredOrders.filter(o => {
        if (!o.createdAt) return false;
        const orderDate = new Date(o.createdAt);
        return orderDate >= startOfDay && orderDate <= endOfDay;
      });

      const dailyRevenue = dailyOrders
        .filter(o => o.orderStatus === "collected")
        .reduce((sum, o) => sum + o.totalAmount * 0.9, 0); // 90% payout model

      data.push({
        date: dateString,
        orders: dailyOrders.length,
        revenue: Number(dailyRevenue.toFixed(2))
      });
    }
    return data;
  }, [filteredOrders]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-5 md:px-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Vendor Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your hotels, menus, and orders.
          </p>
        </div>

        <div className="relative text-right flex items-center gap-4">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2 hover:bg-gray-100 transition border border-gray-200"
          >
            <div className="text-left hidden sm:block">
              <p className="font-semibold text-gray-800">
                {hotels.find((h) => h._id === selectedHotelId)?.hotelName || "Loading..."}
              </p>
              <span className="text-sm font-medium text-green-700">Approved</span>
            </div>
            <ChevronDown size={20} className="text-gray-500" />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-lg z-10">
              <div className="p-2">
                {hotels.map((hotel) => (
                  <button
                    key={hotel._id}
                    onClick={() => {
                      setSelectedHotelId(hotel._id);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full rounded-lg px-4 py-2 text-left text-sm transition ${
                      selectedHotelId === hotel._id
                        ? "bg-green-50 text-green-700 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {hotel.hotelName}
                  </button>
                ))}
                {hotels.length === 0 && (
                  <p className="px-4 py-2 text-sm text-gray-500">No hotels found</p>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 p-5 md:p-8">
        <div>
          <h3 className="text-3xl font-bold text-gray-900">
            Welcome back 👋
          </h3>

          <p className="mt-2 text-gray-500">
            Here is a quick overview of your business.
          </p>
        </div>

        {/* Summary Cards */}
        <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
                <ShoppingBag size={22} />
              </div>
              <span className="text-sm font-medium text-green-700">Orders</span>
            </div>
            <p className="mt-4 text-sm text-gray-500">Today&apos;s Orders</p>
            <h3 className="mt-1 text-3xl font-bold text-gray-900">{loading ? "..." : todayOrders.length}</h3>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
                <IndianRupee size={22} />
              </div>
              <span className="text-sm font-medium text-green-700">Revenue</span>
            </div>
            <p className="mt-4 text-sm text-gray-500">Today&apos;s Revenue (90%)</p>
            <h3 className="mt-1 text-3xl font-bold text-gray-900">
              {loading ? "..." : `₹${todayNetRevenue.toFixed(2)}`}
            </h3>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm cursor-pointer hover:border-green-500 transition" onClick={() => navigate(APP_ROUTES.VENDOR.WALLET)}>
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Wallet size={22} />
              </div>
              <span className="text-sm font-medium text-emerald-700">Balance</span>
            </div>
            <p className="mt-4 text-sm text-gray-500">Wallet Balance</p>
            <h3 className="mt-1 text-3xl font-bold text-gray-900">
              {loading ? "..." : `₹${wallet?.balance?.toFixed(2) || "0.00"}`}
            </h3>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
                <Star size={22} />
              </div>
              <span className="text-sm font-medium text-green-700">Status</span>
            </div>
            <p className="mt-4 text-sm text-gray-500">Partner Status</p>
            <h3 className="mt-1 text-2xl font-bold text-green-700">Approved</h3>
          </div>
        </section>

        {/* Chart Section */}
        <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">7-Day Revenue & Order Trend</h3>
              <p className="mt-1 text-sm text-gray-500">Visualizing net revenue and total order volume.</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenueDb" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#047857" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#047857" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0fdf4" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#374151' }}
                />
                <Area yAxisId="right" type="monotone" dataKey="revenue" name="Net Revenue (₹)" stroke="#047857" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenueDb)" />
                <Area yAxisId="left" type="monotone" dataKey="orders" name="Orders" stroke="#f59e0b" strokeWidth={2} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mt-10">
          <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button
              onClick={() => navigate("/vendor/menu/add")}
              className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 text-left transition hover:border-green-600 hover:bg-green-50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-700 text-white">
                <Plus size={24} />
              </div>

              <div>
                <h4 className="font-semibold text-gray-900">
                  Add Menu Item
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  Add leftover food for sale.
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate("/vendor/orders")}
              className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 text-left transition hover:border-green-600 hover:bg-green-50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-700 text-white">
                <Clock3 size={24} />
              </div>

              <div>
                <h4 className="font-semibold text-gray-900">
                  View Orders
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  Check new and pending orders.
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate("/vendor/profile")}
              className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 text-left transition hover:border-green-600 hover:bg-green-50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-700 text-white">
                <User size={24} />
              </div>

              <div>
                <h4 className="font-semibold text-gray-900">
                  Business Profile
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  Update your business details.
                </p>
              </div>
            </button>
          </div>
        </section>

        {/* Recent Orders Section */}
        <section className="mt-10">
          <h3 className="text-xl font-bold text-gray-900 mb-5">Recent Orders</h3>
          
          {(() => {
            if (filteredOrders.length === 0) {
              return (
                <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                  <ShoppingBag className="mx-auto text-gray-300" size={48} />
                  <h3 className="mt-4 text-lg font-semibold text-gray-800">
                    No orders yet
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Your recent orders for this location will appear here.
                  </p>
                </div>
              );
            }

            // Show up to 5 most recent orders
            const recentOrders = [...filteredOrders]
              .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
              .slice(0, 5);

            return (
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Order ID</th>
                      <th className="px-6 py-4 font-semibold">Date</th>
                      <th className="px-6 py-4 font-semibold">Items</th>
                      <th className="px-6 py-4 font-semibold">Amount</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          #{order.id.slice(-6).toUpperCase()}
                        </td>
                        <td className="px-6 py-4">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          {order.items.map(i => i.itemName).join(", ")}
                        </td>
                        <td className="px-6 py-4 font-medium">
                          ₹{order.totalAmount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            order.orderStatus === 'collected' ? 'bg-green-100 text-green-700' :
                            order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.orderStatus.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 px-6 py-5 text-center text-sm text-gray-500">
        © 2026 <span className="font-semibold text-green-700">SaveBite</span>.
        All rights reserved.
      </footer>
    </div>
  );
}
