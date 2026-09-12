import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import {
  Users,
  Store,
  UserCheck,
  Clock3,
  LogOut,
  IndianRupee,
  ShoppingBag
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { logout } from "../../services/auth.service";
import { useAppDispatch } from "../../hooks/reduxHooks";
import { clearCredentials } from "../../redux/authSlice";
import { getAdminDashboardOverview, getAdminRevenueChart } from "../../services/admin.service";

interface DashboardOverview {
  totalUsers: number;
  blockedUsers: number;
  totalVendors: number;
  pendingApplications: number;
  totalOrders: number;
  totalRevenue: number;
  recentUsers: any[];
  recentVendors: any[];
}

const AdminDashboard = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewData, chart] = await Promise.all([
          getAdminDashboardOverview(),
          getAdminRevenueChart()
        ]);
        setOverview(overviewData);
        setChartData(chart);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        toast.error("Failed to load dashboard statistics");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    toast((t) => (
      <div>
        <p className="font-medium text-gray-900">
          Are you sure you want to logout?
        </p>
        <div className="mt-3 flex justify-end gap-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await logout();
                dispatch(clearCredentials());
                toast.success("Logged out successfully");
                navigate("/admin/login", { replace: true });
              } catch (error) {
                console.error("Logout failed:", error);
                toast.error("Failed to logout");
              }
            }}
            className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  return (
    <div className="min-h-screen bg-[#faf7ef]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-5 md:px-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Admin Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage users and vendor applications.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="font-semibold text-gray-800">Admin</p>
            <p className="text-sm text-green-700">Administrator</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="p-5 md:p-8">
        {/* Welcome */}
        <section>
          <h3 className="text-3xl font-bold text-gray-900">
            Welcome back, Admin 👋
          </h3>
          <p className="mt-2 text-gray-500">
            Here is a quick overview of the SaveBite platform.
          </p>
        </section>

        {/* Statistics */}
        <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {/* Platform Revenue */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
                <IndianRupee size={22} />
              </div>
              <span className="text-sm font-medium text-green-700">Revenue</span>
            </div>
            <p className="mt-4 text-sm text-gray-500">Total Platform Revenue</p>
            <h4 className="mt-1 text-3xl font-bold text-gray-900">₹{overview?.totalRevenue?.toFixed(2) || "0.00"}</h4>
          </div>

          {/* Total Orders */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <ShoppingBag size={22} />
              </div>
              <span className="text-sm font-medium text-blue-700">Orders</span>
            </div>
            <p className="mt-4 text-sm text-gray-500">Total Orders</p>
            <h4 className="mt-1 text-3xl font-bold text-gray-900">{overview?.totalOrders || 0}</h4>
          </div>

          {/* Total Users */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
                <Users size={22} />
              </div>
              <span className="text-sm font-medium text-green-700">Users</span>
            </div>
            <p className="mt-4 text-sm text-gray-500">Total Users</p>
            <h4 className="mt-1 text-3xl font-bold text-gray-900">{overview?.totalUsers || 0}</h4>
          </div>

          {/* Pending Applications */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                <Clock3 size={22} />
              </div>
              <span className="text-sm font-medium text-orange-600">Pending</span>
            </div>
            <p className="mt-4 text-sm text-gray-500">Pending Applications</p>
            <h4 className="mt-1 text-3xl font-bold text-gray-900">{overview?.pendingApplications || 0}</h4>
          </div>
        </section>

        {/* Revenue Chart */}
        <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Revenue Over Last 7 Days
            </h3>
            <div className="h-80 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#15803d" strokeWidth={3} name="Revenue (₹)" />
                    <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#2563eb" strokeWidth={3} name="Orders" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  {isLoading ? "Loading chart data..." : "No revenue data available for the last 7 days."}
                </div>
              )}
            </div>
        </section>

        {/* Quick Actions */}
        <section className="mt-10">
          <h3 className="text-xl font-bold text-gray-900">
            Quick Actions
          </h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => navigate("/admin/userList")}
              className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 text-left transition hover:border-green-600 hover:bg-green-50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-700 text-white">
                <Users size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Manage Users</h4>
                <p className="mt-1 text-sm text-gray-500">View, block or unblock registered users.</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/vendorList")}
              className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 text-left transition hover:border-green-600 hover:bg-green-50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-700 text-white">
                <Store size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Manage Vendors</h4>
                <p className="mt-1 text-sm text-gray-500">Review, approve or reject vendor applications.</p>
              </div>
            </button>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          {/* Vendor applications */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Recent Vendor Applications</h3>
              <button
                type="button"
                onClick={() => navigate("/admin/vendorList")}
                className="text-sm font-medium text-green-700 hover:underline"
              >
                View all
              </button>
            </div>
            
            <div className="mt-6">
              {overview?.recentVendors && overview.recentVendors.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {overview.recentVendors.map(vendor => (
                    <div key={vendor.id} className="flex items-center justify-between rounded-xl border border-gray-100 p-4 hover:bg-gray-50">
                      <div>
                        <p className="font-semibold text-gray-900">{vendor.businessName}</p>
                        <p className="text-xs text-gray-500">{vendor.ownerName} • {vendor.businessType}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          vendor.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                          vendor.status === 'approved' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                        {vendor.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-8 text-center">
                  <Store className="mx-auto text-gray-300" size={44} />
                  <p className="mt-3 font-medium text-gray-700">No vendor applications found</p>
                  <p className="mt-1 text-sm text-gray-500">Recent applications will appear here.</p>
                </div>
              )}
            </div>
          </div>

          {/* Registered users */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Recently Registered Users</h3>
              <button
                type="button"
                onClick={() => navigate("/admin/userList")}
                className="text-sm font-medium text-green-700 hover:underline"
              >
                View all
              </button>
            </div>

            <div className="mt-6">
              {overview?.recentUsers && overview.recentUsers.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {overview.recentUsers.map(user => (
                    <div key={user.id} className="flex items-center justify-between rounded-xl border border-gray-100 p-4 hover:bg-gray-50">
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {user.isActive ? "ACTIVE" : "BLOCKED"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-8 text-center">
                  <UserCheck className="mx-auto text-gray-300" size={44} />
                  <p className="mt-3 font-medium text-gray-700">No users found</p>
                  <p className="mt-1 text-sm text-gray-500">Recently registered users will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-gray-50 px-6 py-5 text-center text-sm text-gray-500">
        © 2026 <span className="font-semibold text-green-700">SaveBite</span>. All rights reserved.
      </footer>
    </div>
  );
};

export default AdminDashboard;