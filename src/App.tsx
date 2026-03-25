import React, { useState, useEffect } from "react";
import { Toaster } from "sonner";
import { Login } from "./components/Login";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import MembershipDashboard from "./components/MemberDashboard";
import { MembershipManagement } from "./components/MembershipManagement";
import { InvoiceManagement } from "./components/InvoiceManagement";
import { WorkoutPlans } from "./components/WorkoutPlans";
import { Membership } from "./components/Membership.js";
import { Reports } from "./components/Reports";
import { CommunicationHistory } from "./components/CommunicationHistory";
import { Settings } from "./components/Settings";
import authService from "./service/authService.js";
import MemberWorkoutPlans from "./components/MemberWorkoutPlans";
import MemberRenewal from "./components/MemberRenewal";
import ResetPassword from "./components/ResetPassword";
import ProductManagement from "./components/ProductManagement.js";
import PWAInstallBanner from "./components/PWAInstallBanner.js";
import MaintenancePage from "./components/MaintenancePage.js";
import GymForm from "./components/GymForm.js";
import DemoExpired from "./components/DemoExpired.js";
export type NavigationItem =
  | "dashboard"
  | "member-dashboard"
  | "reset-password"
  | "member-workoutplans"
  | "member-renewal"
  | "members"
  | "invoices"
  | "plans"
  | "product"
  | "membership"
  | "reports"
  | "communication"
  | "settings";

export type Theme = "light" | "dark";

export default function App() {
type AuthView = "login" | "signup";

const [authView, setAuthView] = useState<AuthView>("login");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDemoExpired, setIsDemoExpired] = useState(false);
  const [currentPage, setCurrentPage] = useState<NavigationItem>("dashboard");
  const [theme, setTheme] = useState<Theme>("dark");
  const [loading, setLoading] = useState(true); // ⏳ to avoid flicker during auth check
  const isMaintenanceMode = false;
  // ✅ Check if user is already logged in (token in localStorage)
useEffect(() => {
  const token = authService.getToken();
  const expired = localStorage.getItem("demo_expired") === "true";

  if (expired) {
    setIsDemoExpired(true);
  } else if (token) {
    setIsAuthenticated(true);
  }

  setLoading(false);
}, []);

  

  // ✅ Load saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("gym-app-theme") as Theme;
    if (savedTheme) setTheme(savedTheme);
  }, []);

  // ✅ Save theme changes
  useEffect(() => {
    localStorage.setItem("gym-app-theme", theme);
  }, [theme]);

  const handleLogin = () => setIsAuthenticated(true);

  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setCurrentPage("dashboard");
  };

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard onNavigate={setCurrentPage} />;
      case "member-dashboard":
        return <MembershipDashboard />;
      case "member-workoutplans":
        return <MemberWorkoutPlans />;
      case "member-renewal":
        return <MemberRenewal />
      case "reset-password":
        return <ResetPassword />
      case "members":
        return <MembershipManagement />;
      case "invoices":
        return <InvoiceManagement />;
      case "plans":
        return <WorkoutPlans />;
      case "product":
        return <ProductManagement />;
      case "membership":
        return <Membership />;
      case "reports":
        return <Reports />;
      case "communication":
        return <CommunicationHistory />;
      case "settings":
        return <Settings theme={theme} onThemeChange={setTheme} />;
      default:
        return <Dashboard />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }
// 1️⃣ Highest priority → Maintenance Mode
if (isMaintenanceMode) {
  return <MaintenancePage />;
}

// 2️⃣ Next → Demo Expired
if (isDemoExpired) {
  return <DemoExpired />;
}
  return (
    <div
      className={`${theme === "dark" ? "dark" : ""} min-h-screen bg-background`}>
      <Toaster position="top-right" richColors closeButton />
      {!isAuthenticated ? (
        <>
          {authView === "login" && <Login onLogin={handleLogin} onNavigateSignup={() => setAuthView("signup")} />}
          {authView === "signup" && <GymForm onLogin={() => setAuthView("login")} />}
        </>
      ) : (
        <>
          <Layout
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            onLogout={handleLogout}
            theme={theme}
            onThemeToggle={toggleTheme}
          >
            {renderCurrentPage()}
          </Layout>
        </>
      )}

      <PWAInstallBanner />
    </div>
  );
}
