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
  ChevronDown,
  Mail,
  Bell
} from "lucide-react";
import { EmiratesLogo } from '@/components/ui/emirates-logo';
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
    <header className="h-20 flex items-center justify-between px-6 flex-shrink-0">
      {/* Left Section - Navigation */}
      <div className="flex items-center space-x-6 min-w-0 flex-1" style={{ marginLeft: '89px' }}>
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold emirates-text-primary letter-spacing-wide">
            AURA AI Platform
          </h1>
          <p className="text-sm emirates-text-muted">Intelligent software development with AI assistance</p>
        </div>
      </div>

      {/* Right Section - Emirates Style Navigation */}
      <div className="flex items-center space-x-1">
        {/* Mail Button */}
        <button className="emirates-nav-button w-9 h-9 flex items-center justify-center relative">
          <Mail size={14} className="emirates-text-secondary" />
          <div className="absolute top-3 right-3 w-1 h-1 bg-red-500 rounded-full border border-white"></div>
        </button>
        
        {/* Notification Button */}
        <div className="emirates-nav-button w-9 h-9 flex items-center justify-center relative">
          <NotificationDropdown />
        </div>
        
        {/* Assistant/Bot Button */}
        <button 
          className={`emirates-nav-button w-9 h-9 flex items-center justify-center ${rightPanelOpen ? 'emirates-nav-button-active' : ''}`}
          onClick={toggleRightPanel}
          title="Toggle Aura Assistant"
        >
          <Bot size={14} className={rightPanelOpen ? "text-white" : "emirates-text-secondary"} />
        </button>
        
        {/* User Profile Button */}
        <div className="relative" ref={profileRef}>
          <button 
            className="emirates-nav-button h-9 px-4 flex items-center space-x-2"
            onClick={() => setShowUserProfile(!showUserProfile)}
          >
            <span className="text-sm font-bold emirates-text-secondary">
              {user?.displayName?.toUpperCase() || 'USER'}
            </span>
            <div className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center ml-2">
              <User size={14} className="text-gray-600" />
            </div>
          </button>
          
          {showUserProfile && (
            <div className="absolute right-0 top-full mt-2 z-50">
              <div onClick={() => setShowUserProfile(false)}>
                <UserProfileCard />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
