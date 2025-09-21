"use client";

import { ReactNode } from 'react';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';
import { Version1Sidebar } from './components/v1-sidebar';
import { Version1Header } from './components/v1-header';
import { RightPanel } from '@/components/layout/right-panel';
import { EmiratesPillNavigation } from '@/components/layout/emirates-pill-nav';
import { ResizeHandle } from '@/components/ui/resize-handle';
import { useSettingsInitialization } from '@/hooks/use-settings-initialization';

interface Version1LayoutProps {
  children: ReactNode;
}

export default function Version1Layout({ children }: Version1LayoutProps) {
  const { 
    sidebarOpen, 
    sidebarCollapsed, 
    getSidebarWidth,
    rightPanelOpen,
    rightPanelCollapsed,
    getRightPanelWidth,
    setRightPanelWidth
  } = useAppStore();
  
  // Initialize settings from environment variables
  useSettingsInitialization();
  
  const sidebarWidth = getSidebarWidth();
  const rightPanelWidth = getRightPanelWidth();

  // Handle right panel resize
  const handleRightPanelResize = (deltaX: number) => {
    const newWidth = rightPanelWidth - deltaX; // Subtract because we're resizing from the left edge
    setRightPanelWidth(newWidth);
  };
  
  return (
    <div className="h-screen emirates-gradient-bg flex overflow-hidden">
      {/* Emirates Pill Navigation */}
      <EmiratesPillNavigation />
      
      {/* Left Sidebar - Version 1 Specific */}
      {/* <Version1Sidebar /> */}
      
      {/* Center Content Area */}
      <div 
        className="flex-1 h-screen flex flex-col transition-all duration-300 ease-in-out"
        style={{
          marginLeft: '89px', // Space for Emirates pill navigation only
          marginRight: rightPanelOpen ? `${rightPanelWidth + (rightPanelCollapsed ? 0 : 8)}px` : '0', // Add resize handle width
        }}
      >
        <Version1Header />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto px-6 py-6">
            {children}
          </div>
        </main>
      </div>
      
      {/* Right Panel Resize Handle */}
      {rightPanelOpen && !rightPanelCollapsed && (
        <div className="fixed top-0 bottom-0 z-50 flex items-center" 
             style={{ right: `${rightPanelWidth}px` }}>
          <ResizeHandle
            direction="horizontal"
            onResize={handleRightPanelResize}
            className="h-full border-l-2 border-gray-300"
          />
        </div>
      )}
      
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
