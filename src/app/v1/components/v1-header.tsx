"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotificationDropdown } from "@/components/ui/notification-dropdown";
import { MobileSidebarToggle } from "@/components/layout/sidebar";
import { UserProfileCard } from "@/components/rbac/user-profile-card";
import { useAppStore } from '@/store/app-store';
import { useAuthStore } from '@/store/auth-store';
import { useRBAC } from '@/hooks/use-rbac';
import { 
  Search, 
  Settings, 
  Bot, 
  User, 
  LogOut, 
  Shield,
  ChevronDown
} from "lucide-react";
import Link from "next/link";

export function Version1Header() {
  const { rightPanelOpen, toggleRightPanel } = useAppStore();
  const { user, logout } = useAuthStore();
  const { isAdmin, primaryRole } = useRBAC();
  const [showUserProfile, setShowUserProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowUserProfile(false);
      }
    }

    if (showUserProfile) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserProfile]);

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 flex-shrink-0">
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <MobileSidebarToggle />
      </div>

      {/* Right side - Clean Navigation */}
      <div className="flex items-center space-x-2">
        <NotificationDropdown />
        
        <Button 
          variant={rightPanelOpen ? "default" : "ghost"} 
          size="sm" 
          className="p-2"
          onClick={toggleRightPanel}
          title="Toggle Aura Assistant"
        >
          <Bot size={18} />
        </Button>
        
        {/* Admin Dashboard Link for admin users */}
        {isAdmin && (
          <Link href="/admin/audit">
            <Button variant="outline" size="sm" className="border-purple-200 text-purple-700 hover:bg-purple-50">
              <Shield size={16} className="mr-2" />
              <span className="hidden md:inline">Admin</span>
            </Button>
          </Link>
        )}
        
        <div className="h-4 w-px bg-gray-300"></div>
        
        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center space-x-2 p-2"
            onClick={() => setShowUserProfile(!showUserProfile)}
          >
            <User size={18} />
            {user && (
              <>
                <span className="hidden md:inline text-sm font-medium">{user.displayName}</span>
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
          
          {showUserProfile && (
            <div className="absolute right-0 top-full mt-2 z-50">
              <div onClick={() => setShowUserProfile(false)}>
                <UserProfileCard />
              </div>
            </div>
          )}
        </div>
        
        {/* Quick Logout */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={logout}
          className="border-slate-200 text-slate-700 hover:bg-slate-50"
        >
          <LogOut size={16} />
        </Button>
      </div>
    </header>
  );
}
