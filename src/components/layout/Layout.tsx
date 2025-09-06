import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />
      
      <div className={sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"}>
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="min-h-[calc(100vh-73px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}