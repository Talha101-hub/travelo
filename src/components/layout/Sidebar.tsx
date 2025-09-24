import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { 
  Car, 
  Users, 
  MapPin, 
  BarChart3, 
  Menu,
  X,
  Home,
  Wrench,
  Building2,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";
import { useAuth } from "@/context/Auth";

const mainNavigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Trips", href: "/trips", icon: MapPin },
  { name: "Reports", href: "/reports", icon: BarChart3 },
];

const managementNavigation = [
  { name: "Driver Details", href: "/drivers", icon: Users },
  { name: "Driver Temp Details", href: "/driver-temp-details", icon: Car },
  { name: "Vendors", href: "/vendors", icon: Building2 },
  { name: "Car Maintenance", href: "/maintenance", icon: Wrench },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const authContext = useAuth();

  const handleLogout = () => {
    console.log('Logout button clicked');
    if (authContext?.logout) {
      authContext.logout();
    } else {
      // Fallback: clear localStorage and redirect
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
    navigate('/login');
  };

  const NavItem = ({ item, isActive }: { item: any; isActive: boolean }) => (
    <NavLink
      to={item.href}
      className={cn(
        "group flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-primary/8 hover:text-foreground",
        isCollapsed && "justify-center"
      )}
      onClick={() => setIsOpen(false)}
      title={isCollapsed ? item.name : undefined}
    >
      <item.icon className={cn(
        "h-5 w-5 transition-colors",
        isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
      )} />
      {!isCollapsed && <span className="font-medium text-sm">{item.name}</span>}
      
      {isActive && !isCollapsed && (
        <div className="absolute right-3 w-1.5 h-1.5 bg-primary-foreground rounded-full"></div>
      )}
    </NavLink>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 h-full bg-card border-r border-border z-50 transition-all duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        isCollapsed ? "w-16" : "w-64"
      )}>
        <div className="flex flex-col h-full min-h-0">
          {/* Header */}
          <div className={cn("border-b border-border", isCollapsed ? "p-3" : "p-6")}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img src={logo} alt="4Dots Haramain Transport" className="h-10 w-10 rounded-lg" />
                </div>
                {!isCollapsed && (
                  <div>
                    <h1 className="text-lg font-bold text-foreground">4Dots</h1>
                    <p className="text-xs text-muted-foreground">Transport</p>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden lg:flex"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                >
                  {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="lg:hidden"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className={cn("flex-1 space-y-6", isCollapsed ? "p-2" : "p-4")}>
            {/* Main Navigation */}
            <div className="space-y-2">
              {!isCollapsed && (
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
                  Main
                </h3>
              )}
              <div className="space-y-1">
                {mainNavigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return <NavItem key={item.name} item={item} isActive={isActive} />;
                })}
              </div>
            </div>

            {!isCollapsed && <Separator className="bg-border/50" />}

            {/* Management */}
            <div className="space-y-2">
              {!isCollapsed && (
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
                  Management
                </h3>
              )}
              <div className="space-y-1">
                {managementNavigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return <NavItem key={item.name} item={item} isActive={isActive} />;
                })}
              </div>
            </div>
          </div>

          {/* Sign Out Button */}
          <div className={cn("border-t border-border mt-auto", isCollapsed ? "p-2" : "p-4")}>
            <div className="space-y-1">
              <Button 
                variant="outline" 
                size="sm"
                className={cn(
                  "w-full text-sm h-9 px-3 border-destructive/20 text-destructive hover:text-white hover:bg-destructive transition-colors",
                  isCollapsed ? "justify-center" : "justify-start"
                )}
                onClick={handleLogout}
                title={isCollapsed ? "Sign Out" : undefined}
                style={{ 
                  border: '1px solid #ef4444',
                  color: '#ef4444',
                  backgroundColor: 'transparent'
                }}
              >
                <LogOut className="h-4 w-4" />
                {!isCollapsed && <span className="ml-3">Sign Out</span>}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}