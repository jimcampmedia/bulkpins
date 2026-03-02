import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Video, LayoutDashboard, Calendar, Settings, LogOut,
  Plus, Zap
} from "lucide-react";

const PLAN_LIMITS: Record<string, number> = {
  free: 5,
  starter: 100,
  pro: 250,
  business: 1000,
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const limit = PLAN_LIMITS[user.plan] || 5;
  const usagePercent = Math.min((user.videos_used_this_month / limit) * 100, 100);

  const navItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/dashboard/schedule", icon: Calendar, label: "Schedule" },
    { path: "/dashboard/settings", icon: Settings, label: "Settings" },
  ];

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-40 hidden lg:block">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-100">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
                BulkPins
              </span>
            </Link>
          </div>

          {/* Create Button */}
          <div className="px-4 pt-6 pb-2">
            <Link to="/dashboard/create">
              <Button variant="gradient" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Create Video Pin
              </Button>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-violet-50 text-violet-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Usage */}
          <div className="px-4 pb-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500">Monthly Usage</span>
                <Badge variant="secondary" className="text-xs capitalize">{user.plan}</Badge>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-bold text-slate-900">{user.videos_used_this_month}</span>
                <span className="text-sm text-slate-500">/ {limit}</span>
              </div>
              <Progress value={usagePercent} className="mb-3" />
              {user.plan === "free" && (
                <Link to="/dashboard/settings">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    Upgrade Plan
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* User */}
          <div className="border-t border-slate-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-violet-400 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {(user.name || user.email)[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{user.name || user.email}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="text-slate-400 hover:text-slate-600">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 w-full bg-white border-b border-slate-200 z-40">
        <div className="flex items-center justify-between px-4 h-14">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center">
              <Video className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
              BulkPins
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/dashboard/create">
              <Button variant="gradient" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
        {/* Mobile nav */}
        <div className="flex border-t border-slate-100">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex-1 flex flex-col items-center py-2 text-xs ${
                  isActive ? "text-violet-600" : "text-slate-500"
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                {label}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:pl-64 pt-24 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
