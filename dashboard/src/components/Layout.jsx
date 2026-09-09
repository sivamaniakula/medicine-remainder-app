import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../api/AuthContext.jsx";

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 shrink-0 border-r border-[#e8e4dc] bg-white px-5 py-6 flex flex-col">
        <div className="mb-10">
          <p className="font-display text-xl text-[#292521] leading-tight">Medicine Reminder</p>
          <p className="text-sm text-[#8a8478] mt-1">Caregiver dashboard</p>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          <Link
            to="/"
            className="rounded-lg px-3 py-2 text-sm text-[#4a453d] hover:bg-accent-50 hover:text-accent-600 transition-colors"
          >
            Patients
          </Link>
          <Link
            to="/alerts"
            className="rounded-lg px-3 py-2 text-sm text-[#4a453d] hover:bg-accent-50 hover:text-accent-600 transition-colors"
          >
            Alerts
          </Link>
        </nav>

        <div className="pt-4 border-t border-[#e8e4dc]">
          <p className="text-sm font-medium text-[#292521]">{user?.name}</p>
          <p className="text-xs text-[#8a8478] mb-3">{user?.phone}</p>
          <button
            onClick={handleLogout}
            className="text-sm text-[#8a8478] hover:text-accent-600 transition-colors"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 px-10 py-8 max-w-5xl">{children}</main>
    </div>
  );
};

export default Layout;
