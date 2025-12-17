import { Outlet } from "react-router-dom";
import SidebarNavigation from "../components/SidebarNavigation"; // <-- import your sidebar

const SellerDashboard = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar (replaces old static links) */}
      <SidebarNavigation />

      {/* Main content */}
      <main className="flex-1 p-6 bg-gray-100 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default SellerDashboard;
