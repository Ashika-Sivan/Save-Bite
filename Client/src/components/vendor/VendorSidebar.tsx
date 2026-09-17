import {
  LayoutDashboard,
  Utensils,
  ShoppingBag,
  Wallet,
  User,
  LogOut,
  X
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { logout } from "../../services/auth.service";
import { clearCredentials } from "../../redux/authSlice";
import { clearCart } from "../../redux/cartSlice";
import type { AppDispatch } from "../../redux/store";

const menuItems = [
  {
    label: "Dashboard",
    path: "/vendor/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Hotel List",
    path: "/vendor/hotels",
    icon: Utensils,
  },
  {
    label: "Orders",
    path: "/vendor/orders",
    icon: ShoppingBag,
  },
  {
    label: "Wallet",
    path: "/vendor/wallet",
    icon: Wallet,
  },
  {
    label: "Profile",
    path: "/vendor/profile",
    icon: User,
  },
];

interface VendorSidebarProps {
  onClose?: () => void;
}

const VendorSidebar = ({ onClose }: VendorSidebarProps) => {
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
    <aside className="flex min-h-screen w-64 flex-col border-r border-gray-200 bg-white shadow-xl md:shadow-none">
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-6">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <div className="flex h-10 w-10 overflow-hidden items-center justify-center rounded-full bg-white shadow-sm border border-green-700/20">
            <img src="/logo.png" alt="SaveBite Logo" className="h-full w-full object-cover" />
          </div>
          <div>
            <span className="text-xl font-bold text-green-700">SaveBite</span>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden p-1 text-gray-500 hover:text-gray-800 focus:outline-none">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="space-y-2 p-4 flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                  isActive
                    ? "bg-green-100 font-semibold text-gray-900"
                    : "text-gray-500 hover:bg-green-50 hover:text-green-700 font-medium"
                }`
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
        
        <button
          onClick={handleLogout}
          className="w-full mt-4 flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-red-500 transition hover:bg-red-50"
        >
          <LogOut size={18} />
          Logout
        </button>
      </nav>
    </aside>
  );
};

export default VendorSidebar;
