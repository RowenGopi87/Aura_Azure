"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '@/store/app-store';
import { MODULES, APP_NAME } from '@/lib/config';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NotificationDropdown } from '@/components/ui/notification-dropdown';
import { MobileSidebarToggle } from './sidebar';
import { Search, Settings, User, MessageSquare, Bot, Mail, Bell } from 'lucide-react';
import { EmiratesLogo } from '@/components/ui/emirates-logo';

export function Header() {
  const pathname = usePathname();
  const { rightPanelOpen, toggleRightPanel } = useAppStore();
  
  const currentModule = MODULES.find(module => module.path === pathname);
  
  // Get page-specific title and description
  const getPageInfo = () => {
    switch (pathname) {
      case '/use-cases':
        return { title: 'Business Brief Management', description: 'Create, search and track business briefs' };
      case '/requirements':
        return { title: 'Work Items Management', description: 'Hierarchical breakdown: Initiative → Feature → Epic → Story' };
      case '/design':
        return { title: 'Design Management', description: 'Create and manage system designs' };
      case '/code':
        return { title: 'Code Management', description: 'Generate and manage code artifacts' };
      case '/test-cases':
        return { title: 'Test Cases Management', description: 'Create and execute test cases' };
      default:
        return { title: 'AURA Development Platform', description: 'Enterprise software development lifecycle management' };
    }
  };
  
  const pageInfo = getPageInfo();
  
  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="flex h-20 items-center justify-between px-6">
        {/* Left Section - Navigation */}
        <div className="flex items-center space-x-6 min-w-0 flex-1">
          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold emirates-text-primary letter-spacing-wide">
              {pageInfo.title}
            </h1>
            <p className="text-sm emirates-text-muted">{pageInfo.description}</p>
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
          <button className="emirates-nav-button w-9 h-9 flex items-center justify-center relative">
            <Bell size={14} className="emirates-text-secondary" />
            <div className="absolute top-3 right-3 w-1 h-1 bg-red-500 rounded-full border border-white"></div>
          </button>
          
          {/* Admin Button */}
          <button className="emirates-nav-button h-9 px-4 flex items-center space-x-2">
            <User size={14} className="emirates-text-secondary" />
            <span className="text-sm font-bold emirates-text-secondary">Admin</span>
          </button>
          
        {/* Assistant/Bot Button */}
        <button 
          className={`emirates-nav-button w-9 h-9 flex items-center justify-center ${rightPanelOpen ? 'emirates-nav-button-active' : ''}`}
          onClick={toggleRightPanel}
          title="Toggle Aura Assistant"
        >
          <Bot size={14} className={rightPanelOpen ? "text-white" : "emirates-text-secondary"} />
        </button>
        
        {/* User Profile Button */}
        <button className="emirates-nav-button h-9 px-4 flex items-center space-x-2">
          <span className="text-sm font-bold emirates-text-secondary">JOSHUA PAYNE</span>
          <div className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center ml-2">
            <User size={14} className="text-gray-600" />
          </div>
        </button>
        </div>
      </div>
    </header>
  );
} 