"use client";

import { ReactNode } from 'react';
import { Version1Sidebar } from '@/app/v1/components/v1-sidebar';
import { Version1Header } from '@/app/v1/components/v1-header';
import { RightPanel } from '@/components/layout/right-panel';
import { EmiratesPillNavigation } from '@/components/layout/emirates-pill-nav';
import { useAppStore } from '@/store/app-store';
import { useSettingsInitialization } from '@/hooks/use-settings-initialization';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { 
    sidebarOpen, 
    sidebarCollapsed, 
    getSidebarWidth 
  } = useAppStore();
  
  // Initialize settings from environment variables
  useSettingsInitialization();
  
  const sidebarWidth = getSidebarWidth();
  
  return (
    <div className="h-screen emirates-gradient-bg flex overflow-hidden">
      {/* Emirates Pill Navigation */}
      <EmiratesPillNavigation />
      
      {/* Left Sidebar - Version 1 Style */}
      {/* <Version1Sidebar /> */}
      
      {/* Center Content Area */}
      <div 
        className="flex-1 h-screen flex flex-col transition-all duration-300 ease-in-out"
        style={{
          marginLeft: '89px', // Space for Emirates pill navigation only
        }}
      >
        <Version1Header />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto px-6 py-6">
            {children}
          </div>
        </main>
      </div>
      
      {/* Right Panel - Assistant */}
      <RightPanel />
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => useAppStore.getState().setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
