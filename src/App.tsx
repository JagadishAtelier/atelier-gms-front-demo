import React, { useState, useEffect } from "react";
import { Toaster } from "sonner";
import { Login } from "./components/Login";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import  MembershipDashboard  from "./components/MemberDashboard";
import { MembershipManagement } from "./components/MembershipManagement";
import { InvoiceManagement } from "./components/InvoiceManagement";
import { WorkoutPlans } from "./components/WorkoutPlans";
import { Membership } from "./components/Membership.js";
import { Reports } from "./components/Reports";
import { CommunicationHistory } from "./components/CommunicationHistory";
import { Settings } from "./components/Settings";
import authService from "./service/authService.js";
import MemberWorkoutPlans from "./components/MemberWorkoutPlans";
import  MemberRenewal  from "./components/MemberRenewal";

export type NavigationItem =
  | "dashboard"
  | "member-dashboard"
  | "member-workoutplans"
  | "member-renewal"
  | "members"
  | "invoices"
  | "plans"
  | "membership"
  | "reports"
  | "communication"
  | "settings";

export type Theme = "light" | "dark";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<NavigationItem>("dashboard");
  const [theme, setTheme] = useState<Theme>("dark");
  const [loading, setLoading] = useState(true); // ⏳ to avoid flicker during auth check

  // ✅ Check if user is already logged in (token in localStorage)
  useEffect(() => {
    const token = authService.getToken();
    if (token) {
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
      case "members":
        return <MembershipManagement />;
      case "invoices":
        return <InvoiceManagement />;
      case "plans":
        return <WorkoutPlans />;
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

  return (
    <div className={`${theme === "dark" ? "dark" : ""} min-h-screen bg-background`}>
      <Toaster position="top-right" richColors closeButton />
      {!isAuthenticated ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Layout
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onLogout={handleLogout}
          theme={theme}
          onThemeToggle={toggleTheme}
        >
          {renderCurrentPage()}
        </Layout>
      )}
    </div>
  );
}
