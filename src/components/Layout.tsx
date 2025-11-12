import React from 'react';
import { NavigationItem, Theme } from '../App';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Clipboard, 
  BarChart3, 
  MessageSquare, 
  Menu,
  LogOut,
  Dumbbell,
  Sun,
  Moon,
  Settings
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: NavigationItem;
  onNavigate: (page: NavigationItem) => void;
  onLogout: () => void;
  theme: Theme;
  onThemeToggle: () => void;
}

const navigationItems = [
  { id: 'dashboard' as NavigationItem, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'members' as NavigationItem, label: 'Members', icon: Users },
  { id: 'invoices' as NavigationItem, label: 'Invoices', icon: FileText },
  { id: 'plans' as NavigationItem, label: 'Plans', icon: Clipboard },
  { id: 'reports' as NavigationItem, label: 'Reports', icon: BarChart3 },
  { id: 'communication' as NavigationItem, label: 'Messages', icon: MessageSquare },
  { id: 'settings' as NavigationItem, label: 'Settings', icon: Settings },
];

export function Layout({ children, currentPage, onNavigate, onLogout, theme, onThemeToggle }: LayoutProps) {
  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`${mobile ? '' : 'hidden md:flex'} flex-col h-full bg-card border-r border-border`}>
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-neon-green to-neon-blue rounded-lg">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-semibold">FitnessPro</h2>
            <p className="text-sm text-muted-foreground">Gym Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              className={`w-full justify-start gap-3 text-sidebar-foreground ${
                isActive 
                  ? 'bg-gradient-to-r from-neon-green/10 to-neon-blue/10 text-neon-green border-neon-green/20 font-medium' 
                  : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
              onClick={() => onNavigate(item.id)}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-neon-green' : 'text-sidebar-foreground'}`} />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 hover:bg-accent"
          onClick={onThemeToggle}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-400/10"
          onClick={onLogout}
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex">
      {/* Desktop Sidebar */}
      <div className="w-64 hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-neon-green to-neon-blue rounded-lg">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <h2 className="font-semibold text-foreground">FitnessPro</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onThemeToggle} className="text-foreground hover:text-foreground">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
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

        {/* Desktop Header with Theme Toggle */}
        <div className="hidden md:flex items-center justify-end p-4 bg-card/50 border-b border-border backdrop-blur-sm">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onThemeToggle} 
            className="h-8 w-8 p-0 text-foreground hover:bg-accent"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 bg-background text-foreground">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-2 z-50">
          <div className="flex justify-around">
            {navigationItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  className={`flex-col gap-1 h-auto py-2 px-2 ${
                    isActive ? 'text-neon-green' : 'text-muted-foreground'
                  }`}
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