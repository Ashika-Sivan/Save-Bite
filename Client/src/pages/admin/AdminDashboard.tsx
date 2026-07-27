import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  Users,
  Store,
  LogOut,
  UserCheck,
  UserX,
  Clock3,
  Menu,
} from "lucide-react";
import { useAppDispatch } from "../../hooks/reduxHooks";
import { clearCredentials } from "../../redux/authSlice";
import { logout } from "../../services/auth.service";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

    const confirmLogout = async (toastId: string) => {
    toast.dismiss(toastId);

    try {
      await logout();

      dispatch(clearCredentials());

      toast.success("Admin logged out successfully");

      navigate("/admin/login", {
        replace: true,
      });
    } catch (error) {
      console.error("Admin logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  const handleLogout = () => {
    toast.custom(
      (currentToast) => (
        <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
          <h3 className="font-semibold text-gray-900">
            Confirm logout
          </h3>

          <p className="mt-1 text-sm text-gray-600">
            Are you sure you want to log out from the admin panel?
          </p>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => toast.dismiss(currentToast.id)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => confirmLogout(currentToast.id)}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
            >
              Yes, Logout
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-center",
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#faf7ef] p-4 md:p-6">
      <div className="mx-auto flex min-h-[95vh] max-w-7xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg">
        {/* Sidebar */}
        <aside className="hidden w-64 flex-col border-r border-gray-200 bg-gray-50 md:flex">
          <div
            onClick={() => navigate("/")}
            className="flex cursor-pointer items-center gap-3 border-b border-gray-200 px-6 py-6"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-700 text-white">
              🍃
            </div>

            <div>
              <h1 className="text-xl font-bold text-green-700">SaveBite</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2 p-4">
            <button className="flex w-full items-center gap-3 rounded-xl bg-green-700 px-4 py-3 font-medium text-white">
              <LayoutDashboard size={20} />
              Dashboard
            </button>

            <button
              onClick={() => navigate("/admin/userList")}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium text-gray-600 transition hover:bg-green-50 hover:text-green-700"
            >
              <Users size={20} />
              Users
            </button>

            <button
              onClick={() => navigate("/admin/vendorList")}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium text-gray-600 transition hover:bg-green-50 hover:text-green-700"
            >
              <Store size={20} />
              Vendors
            </button>
          </nav>

          <div className="border-t border-gray-200 p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium text-red-500 transition hover:bg-red-50"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex flex-1 flex-col">
          {/* Header */}
          <header className="flex items-center justify-between border-b border-gray-200 px-5 py-5 md:px-8">
            <div className="flex items-center gap-3">
              <button className="text-gray-600 md:hidden">
                <Menu size={24} />
              </button>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Admin Dashboard
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Manage users and vendor applications.
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="font-semibold text-gray-800">Admin</p>
              <p className="text-sm text-green-700">Administrator</p>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-5 md:p-8">
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
                  onClick={() => navigate("/admin/userList")}
                  className="flex items-center gap-4 rounded-2xl border border-gray-200 p-5 text-left transition hover:border-green-600 hover:bg-green-50"
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
                  onClick={() => navigate("/admin/vendorList")}
                  className="flex items-center gap-4 rounded-2xl border border-gray-200 p-5 text-left transition hover:border-green-600 hover:bg-green-50"
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
              {/* Recent Vendors */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">
                    Recent Vendor Applications
                  </h3>

                  <button
                    onClick={() => navigate("/admin/vendors")}
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

              {/* Recent Users */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">
                    Recently Registered Users
                  </h3>

                  <button
                    onClick={() => navigate("/admin/users")}
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

          {/* Footer */}
          <footer className="border-t border-gray-200 bg-gray-50 px-6 py-5 text-center text-sm text-gray-500">
            © 2026{" "}
            <span className="font-semibold text-green-700">SaveBite</span>.
            All rights reserved.
          </footer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;