import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  return (
    <div className="flex min-h-screen bg-[#f4f8f6]">

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">

        <Topbar
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />

        <main className="flex-1 overflow-auto p-5 sm:p-8">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default AppLayout;