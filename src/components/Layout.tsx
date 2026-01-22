// src/components/Layout.tsx
import React, { useEffect, useState } from "react";
import { NavigationItem, Theme } from "../App";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import {
  LayoutDashboard,
  Users,
  FileText,
  Clipboard,
  BicepsFlexed,
  SquareAsterisk,
  IndianRupee,
  BarChart3,
  MessageSquare,
  Menu,
  LogOut,
  Dumbbell,
  Sun,
  Moon,
  Settings as SettingsIcon,
  Rocket,
  ShoppingBag,
} from "lucide-react";
import gymService from "../service/gymService.js";
import { toast } from "sonner";

interface LayoutProps {
  children: React.ReactNode;
  currentPage: NavigationItem;
  onNavigate: (page: NavigationItem) => void;
  onLogout: () => void;
  theme: Theme;
  onThemeToggle: () => void;
}

const navigationItems = [
  { id: "dashboard" as NavigationItem, label: "Dashboard", icon: LayoutDashboard },
  { id: "member-dashboard" as NavigationItem, label: "Member Dashboard", icon: Dumbbell },
  { id: "member-workoutplans" as NavigationItem, label: "Workout Plans", icon: BicepsFlexed },
  { id: "reset-password" as NavigationItem, label: "Reset Password", icon: SquareAsterisk }, 
  { id: "member-renewal" as NavigationItem, label: "Renewal", icon: IndianRupee },
  { id: "members" as NavigationItem, label: "Members", icon: Users },
  { id: "invoices" as NavigationItem, label: "Invoices", icon: FileText },
  { id: "plans" as NavigationItem, label: "Plans", icon: Clipboard },
  { id: "product" as NavigationItem, label: "Product", icon: ShoppingBag },
  { id: "membership" as NavigationItem, label: "Membership", icon: Rocket },
  { id: "communication" as NavigationItem, label: "Messages", icon: MessageSquare },
  { id: "settings" as NavigationItem, label: "Settings", icon: SettingsIcon },
];

export function Layout({
  children,
  currentPage,
  onNavigate,
  onLogout,
  theme,
  onThemeToggle,
}: LayoutProps) {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  // Gym name state (fetched from API). Default to static fallback.
  const [gymName, setGymName] = useState<string>("Atelier Fit");
  const [gymLoading, setGymLoading] = useState(false);

  // Role from localStorage (controls which nav items are shown)
  const [role, setRole] = useState<string | null>(null);

  // Helper to extract gyms array from a variety of response shapes
  const extractGymsArray = (res: any): any[] => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.data?.data)) return res.data.data;
    if (Array.isArray(res.data?.rows)) return res.data.rows;
    if (Array.isArray(res.rows)) return res.rows;
    if (res?.data && res.data?.data && Array.isArray(res.data.data.data)) return res.data.data.data;
    return [];
  };

  const loadGymName = async () => {
    setGymLoading(true);
    try {
      const res = await gymService.getGyms({ limit: 1 });
      const arr = extractGymsArray(res);
      const g = arr[0];
      if (g && g.name) {
        setGymName(String(g.name));
      }
    } catch (err: any) {
      console.error("Failed to load gym name:", err);
      // optional toast
      // toast.error(err?.message || "Failed to load gym name");
    } finally {
      setGymLoading(false);
    }
  };

  /**
   * parseRole
   * Accepts raw localStorage value and returns a string role or null.
   * Handles:
   *  - plain string: "member"
   *  - JSON stringified string: "\"member\""
   *  - JSON object: '{"role":"member"}' or { role: "member" }
   */
  const parseRole = (raw: string | null): string | null => {
    if (raw === null) return null;
    // try to parse JSON (covers JSON-stringified values and objects)
    try {
      const parsed = JSON.parse(raw);
      if (!parsed) return null;
      // if parsed is an object with role property
      if (typeof parsed === "object" && parsed !== null && "role" in parsed) {
        const r = (parsed as any).role;
        return typeof r === "string" ? r : String(r);
      }
      // if parsed is a string (JSON-stringified string), return it
      if (typeof parsed === "string") return parsed;
      // fallback to raw
    } catch {
      // ignore parse error — raw is likely a plain string
    }
    return raw;
  };

  // Read role from localStorage on mount
  useEffect(() => {
    const stored = parseRole(localStorage.getItem("role"));
    setRole(stored);
  }, []);

  // Listen to storage events so role updates if changed in another tab
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "role") {
        setRole(parseRole(e.newValue));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    loadGymName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Decide which navigation items to show based on role
  // member -> only show a limited subset, others -> full menu
  const visibleItems = React.useMemo(() => {
    const roleNorm = (role || "").toLowerCase().trim();
    if (roleNorm === "member") {
      const allowed = new Set(["member-dashboard", "member-workoutplans", "member-renewal", "reset-password"]);
      return navigationItems.filter((it) => allowed.has(it.id));
    }
    if (roleNorm === "super admin") {
      const allowed = new Set(["dashboard", "members", "invoices", "plans","product", "membership", "settings"]);
      return navigationItems.filter((it) => allowed.has(it.id));
    }
    // Super Admin or any other role - show full menu
    return navigationItems;
  }, [role]);

  /**
   * If the current page is not allowed for the role, navigate to the first allowed page.
   * This ensures members don't land on the (admin) "dashboard" by default.
   */
  useEffect(() => {
    // Wait until role is known and visibleItems computed
    if (role === null) return;

    // Build allowed IDs
    const allowedIds = visibleItems.map((it) => it.id);

    // If currentPage is not in allowedIds, navigate to first allowed item (if exists)
    if (!allowedIds.includes(currentPage)) {
      if (allowedIds.length > 0) {
        // navigate to first allowed item (for members this is "member-dashboard")
        onNavigate(allowedIds[0]);
      }
    }
    // only re-run when role, visibleItems or currentPage changes
  }, [role, visibleItems, currentPage, onNavigate]);

  const Sidebar = ({ mobile = false, collapsed: sideCollapsed = false }: { mobile?: boolean; collapsed?: boolean }) => (
    <div className={`flex-col h-full bg-card border-r border-border ${mobile ? "" : "md:flex"} ${mobile ? "" : "flex"}`}>
      {/* Brand */}
      <div className="p-6 border-b border-border flex items-center gap-3">
        <div className={`p-2 rounded-lg ${sideCollapsed ? "mx-auto" : ""} bg-gradient-to-r from-neon-green to-neon-blue`}>
          <Dumbbell className="w-6 h-6 text-white" />
        </div>

        {!sideCollapsed && (
          <div>
            <h2 className="font-semibold text-muted-foreground">
              {gymLoading ? "Loading..." : gymName}
            </h2>
            <p className="text-sm text-muted-foreground">Gym Management</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          const baseClasses = `w-full ${sideCollapsed ? "justify-center" : "justify-start gap-3"} flex items-center`;
          const activeExtra = isActive
            ? "bg-gradient-to-r from-neon-green/10 to-neon-blue/10 text-neon-green border-neon-green/20 font-medium"
            : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              className={`${baseClasses} text-sidebar-foreground ${activeExtra}`}
              onClick={() => onNavigate(item.id)}
              title={item.label}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-neon-green" : "text-sidebar-foreground"}`} />
              {!sideCollapsed && <span>{item.label}</span>}
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">

        <Button
          variant="ghost"
          className={`w-full ${sideCollapsed ? "justify-center" : "justify-start gap-3"} flex items-center text-red-400 hover:text-red-300 hover:bg-red-400/10`}
          onClick={onLogout}
          title={sideCollapsed ? "Logout" : undefined}
        >
          <LogOut className="w-5 h-5" />
          {!sideCollapsed && "Logout"}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex">
      {/* Tablet Sidebar (fixed w-20) */}
      <div className={`${collapsed ? "w-13" : "w-21"} hidden md:block lg:hidden transition-all duration-200`}>
        <Sidebar collapsed={collapsed} />
      </div>

      {/* Desktop Sidebar (collapsible w-64 / w-20) */}
      <div className={`${collapsed ? "w-20" : "w-64"} hidden lg:block transition-all duration-200`}>
        <Sidebar collapsed={collapsed} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-1 bg-gradient-to-r from-neon-green to-neon-blue rounded-lg">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <h2 className="!text-[10px] font-semibold text-foreground">{gymLoading ? "Loading..." : gymName}</h2>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onThemeToggle} className="text-foreground hover:text-foreground">
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground hover:text-foreground">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <Sidebar mobile />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between p-4 bg-card/50 border-b border-border backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed((s) => !s)}
              className="h-8 w-8 p-0 text-foreground hover:bg-accent"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onThemeToggle}
              className="h-8 w-8 p-0 text-foreground hover:bg-accent"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 bg-slate-50 text-foreground">{children}</main>

        {/* Mobile Bottom Nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-2 z-50">
          <div className="flex justify-around">
            {visibleItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  className={`flex-col  gap-1 h-auto py-2 px-2 ${isActive ? "text-neon-green" : "text-muted-foreground"}`}
                  onClick={() => onNavigate(item.id)}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Layout;
