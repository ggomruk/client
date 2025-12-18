'use client';

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, Settings, Bell, TrendingUp, LayoutDashboard, Sliders, ClipboardList, TrendingDown, Clock, LogOut, Menu, X } from "lucide-react";

interface NavigationBarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/app" },
  { id: "optimizer", label: "Optimizer", icon: Sliders, path: "/app/optimizer" },
  { id: "compare", label: "Compare", icon: ClipboardList, path: "/app/compare" },
  { id: "walkforward", label: "Walk-Forward", icon: TrendingDown, path: "/app/walkforward" },
  { id: "alerts", label: "Alerts", icon: Bell, path: "/app/alerts" },
  { id: "history", label: "History", icon: Clock, path: "/app/history" },
];

export function NavigationBar({ activeTab: propActiveTab, onTabChange }: NavigationBarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  // Determine active tab from pathname if not provided
  const activeTab = propActiveTab || tabs.find(tab => tab.path === pathname)?.id || "dashboard";

  const handleTabChange = (tab: string) => {
    const tabConfig = tabs.find(t => t.id === tab);
    if (tabConfig) {
      router.push(tabConfig.path);
    }
    if (onTabChange) {
      onTabChange(tab);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-[#18181b] border-b border-[#3f3f46]">
      {/* Top Bar */}
      <div className="px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4 md:gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] opacity-100"></div>
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-white relative z-10" />
            </div>
            <span className="text-lg md:text-xl font-bold gradient-text">Ggomruk</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`relative px-4 py-2 text-sm transition-all duration-300 rounded-lg flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "text-[#fafafa]"
                      : "text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#27272a]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] rounded-full"></div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
        
        {/* Right Side Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* User Info - Hidden on small screens */}
          <div className="hidden md:flex items-center gap-2 bg-[#27272a] rounded-lg px-3 py-2 border border-[#3f3f46]">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] flex items-center justify-center text-white text-xs font-semibold">
              RC
            </div>
            <span className="text-sm text-[#fafafa]">Ryan Crawford</span>
          </div>

          {/* Bell Icon */}
          <button className="relative p-2 hover:bg-[#27272a] rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-[#a1a1aa]" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#06b6d4] rounded-full"></span>
          </button>
          
          {/* Search Icon - Hidden on mobile */}
          <button className="hidden sm:block p-2 hover:bg-[#27272a] rounded-lg transition-colors">
            <Search className="w-5 h-5 text-[#a1a1aa]" />
          </button>
          
          {/* Settings Icon - Hidden on mobile */}
          <button className="hidden sm:block p-2 hover:bg-[#27272a] rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-[#a1a1aa]" />
          </button>

          {/* Logout Button - Hidden on mobile */}
          <button className="hidden md:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] text-white text-sm rounded-lg hover:opacity-90 transition-opacity">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-[#27272a] rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-[#fafafa]" />
            ) : (
              <Menu className="w-5 h-5 text-[#fafafa]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[#3f3f46] bg-[#18181b] animate-slideIn">
          <nav className="px-4 py-4 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full px-4 py-3 text-sm transition-all duration-300 rounded-lg flex items-center gap-3 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-[#7c3aed]/20 to-[#06b6d4]/20 text-[#fafafa] border border-[#7c3aed]/30"
                      : "text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#27272a]"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
            
            {/* Mobile User Info */}
            <div className="pt-4 mt-4 border-t border-[#3f3f46]">
              <div className="flex items-center gap-3 px-4 py-3 bg-[#27272a] rounded-lg border border-[#3f3f46]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] flex items-center justify-center text-white text-sm font-semibold">
                  RC
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#fafafa]">Ryan Crawford</p>
                  <button className="text-xs text-[#a1a1aa] hover:text-red-400 transition-colors flex items-center gap-1 mt-1">
                    <LogOut className="w-3 h-3" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
