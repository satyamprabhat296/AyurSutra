import {
  Bell,
  Menu,
  Search,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const Topbar = ({ onMenuClick }) => {
  const { user } = useAuth();

  const initials =
    user?.name
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "SA";

  return (
    <header className="flex h-20 items-center justify-between border-b border-gray-200 bg-white px-5 sm:px-8">

      {/* Left */}
      <div className="flex items-center gap-4">

        <button
          onClick={onMenuClick}
          className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
        >
          <Menu size={21} />
        </button>

        <div className="hidden items-center gap-3 rounded-xl bg-gray-50 px-4 py-2.5 sm:flex">

          <Search
            size={17}
            className="text-gray-400"
          />

          <input
            type="text"
            placeholder="Search anything..."
            className="w-48 bg-transparent text-sm outline-none placeholder:text-gray-400"
          />

        </div>

      </div>

      {/* Right */}
      <div className="flex items-center gap-3">

        <button className="relative rounded-xl p-2.5 text-gray-500 transition hover:bg-gray-100">

          <Bell size={20} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />

        </button>

        <div className="mx-1 h-8 w-px bg-gray-200" />

        <div className="flex items-center gap-3">

          <div className="hidden text-right sm:block">

            <p className="text-sm font-semibold text-gray-800">
              {user?.name || "Super Admin"}
            </p>

            <p className="text-[11px] capitalize text-gray-400">
              {user?.role?.replace("_", " ") || "Administrator"}
            </p>

          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#123c35] text-sm font-bold text-emerald-200">
            {initials}
          </div>

        </div>

      </div>

    </header>
  );
};

export default Topbar;