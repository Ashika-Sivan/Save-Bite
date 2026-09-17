import {
  LayoutDashboard,
  Store,
  Users,
  Package,
  WalletCards,
  Star,
  Bell,
  Settings,
  AlertCircle,
  X,
  RotateCcw,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menuItems = [
  {
    label: "Overview",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Vendors",
    path: "/admin/vendorList",
    icon: Store,
  },
  {
    label: "Users",
    path: "/admin/userList",
    icon: Users,
  },
  {
    label: "Concerns & Disputes",
    path: "/admin/concerns",
    icon: AlertCircle,
  },
  {
    label: "Orders & Escrow",
    path: "/admin/orders",
    icon: Package,
  },
  {
    label: "Transactions",
    path: "/admin/transactions",
    icon: WalletCards,
  },
  {
    label: "Refund Reports",
    path: "/admin/refunds",
    icon: RotateCcw,
  },
  {
    label: "Reviews",
    path: "/admin/reviews",
    icon: Star,
  },
  {
    label: "Notifications",
    path: "/admin/notifications",
    icon: Bell,
  },
  {
    label: "Settings",
    path: "/admin/settings",
    icon: Settings,
  },
];

interface AdminSidebarProps {
  onClose?: () => void;
}

const AdminSidebar = ({ onClose }: AdminSidebarProps) => {
  return (
    <aside className="flex min-h-screen w-64 flex-col border-r border-gray-200 bg-white shadow-xl md:shadow-none">
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 overflow-hidden items-center justify-center rounded-full bg-white border border-green-600/20">
            <img src="/logo.png" alt="SaveBite Logo" className="h-full w-full object-cover" />
          </div>
          <div>
            <span className="font-bold text-gray-900">SaveBite</span>
            <span className="ml-2 text-gray-500">Admin</span>
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
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;