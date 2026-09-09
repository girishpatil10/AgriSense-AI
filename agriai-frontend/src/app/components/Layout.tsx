import { useState } from "react";
import { Menu, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import Sidebar from "./Sidebar";
import { useAuth } from "../auth/AuthContext";
import { ReactNode } from "react";

const PATH_TO_LABEL: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/farms": "Farms",
  "/soil-analysis": "Soil Analysis",
  "/disease-detection": "Disease Detection",
  "/crop-recommendation": "Crop Recommendation",
  "/fertilizer": "Fertilizer Recommendation",
  "/yield-prediction": "Yield Prediction",
  "/weather": "Weather",
  "/history": "History & Feedback",
  "/feedback": "History & Feedback",
  "/settings": "Settings",
};

export default function Layout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const activeLabel = PATH_TO_LABEL[location.pathname] ?? "";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activePath={location.pathname}
      />

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-30 backdrop-blur-lg bg-white/80 border-b border-emerald-100 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-emerald-50 rounded-xl transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <span className="font-semibold text-gray-700">{activeLabel}</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:block">
              {user?.full_name ?? user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
