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
  ShieldCheck,
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

const AdminSidebar = () => {
  return (
    <aside className="min-h-screen w-64 border-r border-gray-200 bg-white">
      <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white">
          <ShieldCheck size={20} />
        </div>

        <div>
          <span className="font-bold text-gray-900">SaveBite</span>
          <span className="ml-2 text-gray-500">Admin</span>
        </div>
      </div>

      <nav className="space-y-2 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.label}
              to={item.path}
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