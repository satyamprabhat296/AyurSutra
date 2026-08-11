import {
  Activity,
  CalendarDays,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Pill,
  Receipt,
  Settings,
  ShoppingCart,
  Stethoscope,
  Users,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navigation = [
  {
    label: "Overview",
    items: [
      {
        name: "Dashboard",
        path: "/",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Clinic",
    items: [
      {
        name: "Patients",
        path: "/patients",
        icon: Users,
      },
      {
        name: "Appointments",
        path: "/appointments",
        icon: CalendarDays,
      },
      {
        name: "Consultations",
        path: "/consultations",
        icon: Stethoscope,
      },
    ],
  },
  {
    label: "Pharmacy",
    items: [
      {
        name: "Prescriptions",
        path: "/prescriptions",
        icon: ClipboardList,
      },
      {
        name: "Medicines",
        path: "/medicines",
        icon: Pill,
      },
      {
        name: "Inventory",
        path: "/inventory",
        icon: Activity,
      },
      {
        name: "Purchases",
        path: "/purchases",
        icon: ShoppingCart,
      },
    ],
  },
  {
    label: "Finance",
    items: [
      {
        name: "Billing",
        path: "/billing",
        icon: Receipt,
      },
      {
        name: "Reports",
        path: "/reports",
        icon: FileText,
      },
    ],
  },
];

const Sidebar = ({ open, onClose }) => {
  const { logout } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-72 flex-col
          border-r border-gray-200 bg-white
          transition-transform duration-300
          lg:static lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Brand */}
        <div className="flex h-20 items-center justify-between border-b border-gray-100 px-6">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#123c35]">
              <span className="text-lg text-emerald-300">
                🌿
              </span>
            </div>

            <div>
              <h1 className="font-bold text-[#123c35]">
                AyurSutra
              </h1>

              <p className="text-[10px] text-gray-400">
                Clinic Management
              </p>
            </div>

          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 lg:hidden"
          >
            <X size={20} />
          </button>

        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">

          {navigation.map((section) => (
            <div
              key={section.label}
              className="mb-7"
            >

              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {section.label}
              </p>

              <div className="space-y-1">

                {section.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `
                        flex items-center gap-3 rounded-xl px-3 py-2.5
                        text-sm font-medium transition
                        ${
                          isActive
                            ? "bg-[#123c35] text-white shadow-sm"
                            : "text-gray-600 hover:bg-emerald-50 hover:text-[#123c35]"
                        }
                        `
                      }
                    >
                      <Icon size={18} />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}

              </div>

            </div>
          ))}

        </nav>

        {/* Bottom */}
        <div className="border-t border-gray-100 p-4">

          <NavLink
            to="/settings"
            className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            <Settings size={18} />
            Settings
          </NavLink>

          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>

      </aside>
    </>
  );
};

export default Sidebar;