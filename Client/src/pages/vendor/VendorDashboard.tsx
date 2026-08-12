import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  Utensils,
  ShoppingBag,
  Wallet,
  User,
  LogOut,
  Plus,
  Clock3,
  IndianRupee,
  Star,
} from "lucide-react";
import { logout } from "../../services/auth.service";
import { clearCredentials } from "../../redux/authSlice";
import { clearCart } from "../../redux/cartSlice";
import type { AppDispatch } from "../../redux/store";

export default function VendorDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogout = () => {
    toast((t) => (
      <div>
        <p className="font-medium text-gray-900">
          Are you sure you want to logout?
        </p>

        <div className="mt-3 flex justify-end gap-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-200"
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
              } catch (error) {
                console.error("Logout failed:", error);
                toast.error("Failed to logout");
              }
            }}
            className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white transition hover:bg-red-700"
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-700 text-white">
              🍃
            </div>

            <h1 className="text-2xl font-bold text-green-700">SaveBite</h1>
          </div>

          <div className="text-right">
            <p className="font-semibold text-gray-800">Green Leaf Restaurant</p>
            <span className="text-sm font-medium text-green-700">Approved</span>
          </div>
        </header>

        <div className="flex flex-1 flex-col md:flex-row">
          {/* Sidebar */}
          <aside className="border-b border-gray-200 bg-gray-50 p-4 md:w-64 md:border-b-0 md:border-r">
            <nav className="space-y-2">
              <button className="flex w-full items-center gap-3 rounded-xl bg-green-700 px-4 py-3 text-left font-medium text-white">
                <LayoutDashboard size={20} />
                Dashboard
              </button>

              <button
                onClick={() => navigate("/vendor/hotels")}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium text-gray-600 transition hover:bg-green-50 hover:text-green-700"
              >
                <Utensils size={20} />
                Hotel List
              </button>

              <button
                onClick={() => navigate("/vendor/orders")}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium text-gray-600 transition hover:bg-green-50 hover:text-green-700"
              >
                <ShoppingBag size={20} />
                Orders
              </button>

              <button
                onClick={() => navigate("/vendor/wallet")}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium text-gray-600 transition hover:bg-green-50 hover:text-green-700"
              >
                <Wallet size={20} />
                Wallet
              </button>

              <button
                onClick={() => navigate("/vendor/profile")}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium text-gray-600 transition hover:bg-green-50 hover:text-green-700"
              >
                <User size={20} />
                Profile
              </button>

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium text-red-500 transition hover:bg-red-50"
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
                Welcome back 👋
              </h2>

              <p className="mt-2 text-gray-500">
                Here is a quick overview of your business.
              </p>
            </div>

            {/* Summary Cards */}
            <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
                  <ShoppingBag size={22} />
                </div>

                <p className="mt-4 text-sm text-gray-500">Today&apos;s Orders</p>
                <h3 className="mt-1 text-3xl font-bold text-gray-900">0</h3>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
                  <IndianRupee size={22} />
                </div>

                <p className="mt-4 text-sm text-gray-500">Today&apos;s Revenue</p>
                <h3 className="mt-1 text-3xl font-bold text-gray-900">₹0</h3>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
                  <Utensils size={22} />
                </div>

                <p className="mt-4 text-sm text-gray-500">Menu Items</p>
                <h3 className="mt-1 text-3xl font-bold text-gray-900">0</h3>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
                  <Star size={22} />
                </div>

                <p className="mt-4 text-sm text-gray-500">Rating</p>
                <h3 className="mt-1 text-3xl font-bold text-gray-900">0.0</h3>
              </div>
            </section>

            {/* Quick Actions */}
            <section className="mt-10">
              <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <button
                  onClick={() => navigate("/vendor/menu/add")}
                  className="flex items-center gap-4 rounded-2xl border border-gray-200 p-5 text-left transition hover:border-green-600 hover:bg-green-50"
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
                  className="flex items-center gap-4 rounded-2xl border border-gray-200 p-5 text-left transition hover:border-green-600 hover:bg-green-50"
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
                  className="flex items-center gap-4 rounded-2xl border border-gray-200 p-5 text-left transition hover:border-green-600 hover:bg-green-50"
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

            {/* Empty Orders Section */}
            <section className="mt-10 rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
              <ShoppingBag className="mx-auto text-gray-300" size={48} />

              <h3 className="mt-4 text-lg font-semibold text-gray-800">
                No orders yet
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Your recent orders will appear here.
              </p>
            </section>
          </main>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-gray-50 px-6 py-5 text-center text-sm text-gray-500 md:px-8">
          © 2026 <span className="font-semibold text-green-700">SaveBite</span>.
          All rights reserved.
        </footer>
      </div>
    </div>
  );
};
