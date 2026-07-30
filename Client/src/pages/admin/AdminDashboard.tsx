import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Users,
  Store,
  UserCheck,
  UserX,
  Clock3,
  LogOut,
} from "lucide-react";
import { logout } from "../../services/auth.service";
import { useAppDispatch } from "../../hooks/reduxHooks";
import { clearCredentials } from "../../redux/authSlice";

const AdminDashboard = () => {
  const dispatch = useAppDispatch();
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

              navigate("/admin/login", {
                replace: true,
              });
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
  ), {
    duration: Infinity,
  });
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
          {/* Total Users */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
                <Users size={22} />
              </div>

              <span className="text-sm font-medium text-green-700">
                Users
              </span>
            </div>

            <p className="mt-4 text-sm text-gray-500">Total Users</p>

            <h4 className="mt-1 text-3xl font-bold text-gray-900">0</h4>
          </div>

          {/* Total Vendors */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
                <Store size={22} />
              </div>

              <span className="text-sm font-medium text-green-700">
                Vendors
              </span>
            </div>

            <p className="mt-4 text-sm text-gray-500">Total Vendors</p>

            <h4 className="mt-1 text-3xl font-bold text-gray-900">0</h4>
          </div>

          {/* Pending Applications */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                <Clock3 size={22} />
              </div>

              <span className="text-sm font-medium text-orange-600">
                Pending
              </span>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Pending Applications
            </p>

            <h4 className="mt-1 text-3xl font-bold text-gray-900">0</h4>
          </div>

          {/* Blocked Users */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <UserX size={22} />
              </div>

              <span className="text-sm font-medium text-red-600">
                Blocked
              </span>
            </div>

            <p className="mt-4 text-sm text-gray-500">Blocked Users</p>

            <h4 className="mt-1 text-3xl font-bold text-gray-900">0</h4>
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
                <h4 className="font-semibold text-gray-900">
                  Manage Users
                </h4>

                <p className="mt-1 text-sm text-gray-500">
                  View, block or unblock registered users.
                </p>
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
                <h4 className="font-semibold text-gray-900">
                  Manage Vendors
                </h4>

                <p className="mt-1 text-sm text-gray-500">
                  Review, approve or reject vendor applications.
                </p>
              </div>
            </button>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          {/* Vendor applications */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Recent Vendor Applications
              </h3>

              <button
                type="button"
                onClick={() => navigate("/admin/vendorList")}
                className="text-sm font-medium text-green-700 hover:underline"
              >
                View all
              </button>
            </div>

            <div className="mt-8 text-center">
              <Store className="mx-auto text-gray-300" size={44} />

              <p className="mt-3 font-medium text-gray-700">
                No vendor applications found
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Recent applications will appear here.
              </p>
            </div>
          </div>

          {/* Registered users */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Recently Registered Users
              </h3>

              <button
                type="button"
                onClick={() => navigate("/admin/userList")}
                className="text-sm font-medium text-green-700 hover:underline"
              >
                View all
              </button>
            </div>

            <div className="mt-8 text-center">
              <UserCheck className="mx-auto text-gray-300" size={44} />

              <p className="mt-3 font-medium text-gray-700">
                No users found
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Recently registered users will appear here.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-gray-50 px-6 py-5 text-center text-sm text-gray-500">
        © 2026{" "}
        <span className="font-semibold text-green-700">SaveBite</span>. All
        rights reserved.
      </footer>
    </div>
  );
};

export default AdminDashboard;