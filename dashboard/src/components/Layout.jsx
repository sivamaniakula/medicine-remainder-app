import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Users, Bell, LogOut, Pill } from "lucide-react";
import { useAuth } from "../api/AuthContext.jsx";

const NAV_ITEMS = [
  { to: "/", label: "Patients", icon: Users, match: (path) => path === "/" || path.startsWith("/patients") },
  { to: "/alerts", label: "Alerts", icon: Bell, match: (path) => path.startsWith("/alerts") },
];

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-[#f5f2ec]">
      <aside className="w-64 shrink-0 bg-ink-900 px-5 py-6 flex flex-col">
        <div className="mb-10 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-accent-500 flex items-center justify-center shrink-0">
            <Pill size={18} className="text-white" strokeWidth={2.25} />
          </div>
          <div className="leading-tight">
            <p className="font-display text-lg text-white">Medicine Reminder</p>
            <p className="text-xs text-white/50">Caregiver dashboard</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, match }) => {
            const active = match(location.pathname);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-accent-500 text-white font-medium"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={17} strokeWidth={2} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium text-white shrink-0">
            {initials(user?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-white/45 truncate">{user?.phone}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="text-white/45 hover:text-white transition-colors shrink-0"
          >
            <LogOut size={16} strokeWidth={2} />
          </button>
        </div>
      </aside>

      <main className="flex-1 px-10 py-8 max-w-6xl">{children}</main>
    </div>
  );
};

export default Layout;
