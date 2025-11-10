import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { MembershipManagement } from './components/MembershipManagement';
import { InvoiceManagement } from './components/InvoiceManagement';
import { WorkoutPlans } from './components/WorkoutPlans';
import { Reports } from './components/Reports';
import { CommunicationHistory } from './components/CommunicationHistory';

export type NavigationItem = 'dashboard' | 'members' | 'invoices' | 'plans' | 'reports' | 'communication';
export type Theme = 'light' | 'dark';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<NavigationItem>('dashboard');
  const [theme, setTheme] = useState<Theme>('dark');

  // Load theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('gym-app-theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('gym-app-theme', theme);
  }, [theme]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'members':
        return <MembershipManagement />;
      case 'invoices':
        return <InvoiceManagement />;
      case 'plans':
        return <WorkoutPlans />;
      case 'reports':
        return <Reports />;
      case 'communication':
        return <CommunicationHistory />;
      default:
        return <Dashboard />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={theme === 'dark' ? 'dark' : ''}>
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} min-h-screen bg-background`}>
      <Layout 
        currentPage={currentPage} 
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
        theme={theme}
        onThemeToggle={toggleTheme}
      >
        {renderCurrentPage()}
      </Layout>
    </div>
  );
}