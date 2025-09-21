"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';
import { useRBAC } from '@/hooks/use-rbac';
import { ResizeHandle } from '@/components/ui/resize-handle';
import { MODULES, WORKFLOW_STEPS, APP_NAME } from '@/lib/config';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  FileText,
  Settings,
  TestTube,
  Play,
  Bug,
  GitBranch,
  BarChart3,
  Menu,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  Palette,
  Code2,
  Shield,
  Users
} from 'lucide-react';

// Version 1 core modules (streamlined for current focus)
const V1_MODULES = [
  { id: "use-cases", name: "Ideas", path: "/v1/use-cases", icon: FileText, moduleName: "ideas" },
  { id: "requirements", name: "Work Items", path: "/v1/requirements", icon: Settings, moduleName: "work_items" },
  { id: "design", name: "Design", path: "/v1/design", icon: Palette, moduleName: "design" },
  { id: "code", name: "Code", path: "/v1/code", icon: Code2, moduleName: "code" },
  { id: "test-cases", name: "Test Cases", path: "/v1/test-cases", icon: TestTube, moduleName: "test_cases" },
  { id: "execution", name: "Execution", path: "/v1/execution", icon: Play, moduleName: "execution" },
  // Defects, Traceability, and Dashboard modules removed for now
];

export function Version1Sidebar() {
  const pathname = usePathname();
  const { 
    sidebarOpen, 
    sidebarCollapsed, 
    toggleSidebar, 
    toggleSidebarCollapsed, 
    currentWorkflowStep, 
    getWorkflowProgress,
    getSidebarWidth,
    setSidebarWidth 
  } = useAppStore();
  
  const { 
    hasModuleAccess, 
    isLoading, 
    primaryRole, 
    isAuthenticated,
    logAccessAttempt 
  } = useRBAC();

  const workflowProgress = getWorkflowProgress();

  const getStepStatus = (stepId: number) => {
    if (stepId < currentWorkflowStep) return 'completed';
    if (stepId === currentWorkflowStep) return 'current';
    return 'pending';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'current': return Clock;
      default: return AlertCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'current': return 'text-blue-600';
      default: return 'text-gray-400';
    }
  };

  const handleResize = (delta: number) => {
    if (sidebarCollapsed) return;
    const currentWidth = getSidebarWidth();
    setSidebarWidth(currentWidth + delta);
  };

  return (
    <>
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r-2 border-gray-300 shadow-sm transition-all duration-300 ease-in-out overflow-y-auto",
        "md:block",
        sidebarCollapsed && "w-20",
        !sidebarOpen && "md:block hidden"
      )}
      style={{
        width: sidebarOpen ? `${getSidebarWidth()}px` : '0px'
      }}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 flex-shrink-0">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900">AURA</div>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">A1</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebarCollapsed}
            className="p-2"
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </Button>
        </div>

        {/* Simple Role Indicator */}
        {!sidebarCollapsed && isAuthenticated && (
          <div className="px-4 py-2 border-b border-gray-200 bg-slate-50 flex-shrink-0">
            <div className="text-xs text-slate-600 text-center">
              {primaryRole}
            </div>
          </div>
        )}



        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {!isAuthenticated ? (
            <div className="flex items-center justify-center p-4">
              <div className="text-sm text-gray-500">Please log in to access modules</div>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent" />
            </div>
          ) : (
            <>
              <div className="space-y-1">
                {V1_MODULES.map((module) => {
                  const Icon = module.icon;
                  const isActive = pathname === module.path;
                  const hasAccess = hasModuleAccess(module.moduleName);
                  
                  // Don't render modules user doesn't have access to
                  if (!hasAccess) {
                    return null;
                  }
                  
                  return (
                    <Link 
                      key={module.id} 
                      href={module.path}
                      onClick={() => logAccessAttempt(module.moduleName, 'navigate', true)}
                    >
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start h-10 px-3",
                          sidebarCollapsed && "justify-center px-2",
                          isActive && "bg-blue-600 text-white hover:bg-blue-700",
                          !isActive && "text-gray-600 hover:text-gray-900"
                        )}
                      >
                        <Icon size={18} />
                        {!sidebarCollapsed && <span className="ml-3 font-medium">{module.name}</span>}
                      </Button>
                    </Link>
                  );
                })}
              </div>
              
              {/* Admin Section for admin users */}
              {isAuthenticated && (
                <>
                  {V1_MODULES.some(module => hasModuleAccess(module.moduleName)) && (
                    <div className="px-3 py-2">
                      <div className="h-px bg-gray-200 mb-3" />
                    </div>
                  )}
                  
                </>
              )}
              
              {/* Show message if no modules are accessible */}
              {V1_MODULES.every(module => !hasModuleAccess(module.moduleName)) && (
                <div className="px-3 py-4 text-center">
                  <div className="text-sm text-gray-500">
                    No modules available for your role
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Contact administrator for access
                  </div>
                </div>
              )}
            </>
          )}
        </nav>



        {/* Mobile Close Button */}
        <div className="md:hidden absolute top-4 right-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="p-2"
          >
            <X size={16} />
          </Button>
        </div>
      </div>
      
      {/* Resize Handle */}
      {sidebarOpen && !sidebarCollapsed && (
        <div className="fixed top-0 bottom-0 z-50 flex items-center" 
             style={{ left: `${getSidebarWidth()}px` }}>
          <ResizeHandle
            direction="horizontal"
            onResize={handleResize}
            className="h-full border-r-2 border-gray-300"
          />
        </div>
      )}
    </>
  );
}
