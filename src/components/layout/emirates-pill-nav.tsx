"use client";

import React from 'react';
import { 
  Lightbulb,
  Target,
  Box,
  Route,
  FileText,
  User,
  Code,
  ToggleLeft
} from 'lucide-react';
import { EmiratesLogo } from '@/components/ui/emirates-logo';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function EmiratesPillNavigation() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };
  
  // Always use V1 routes for main navigation (Ideas, Work Items, Design, Code, Test Cases)
  // Only Admin/User button uses admin routes
  const routePrefix = '/v1';
  
  return (
    <>
      {/* Emirates Logo - Fixed at top left */}
      <div className="fixed left-4 top-0 z-[60]">
        <EmiratesLogo width={86} height={124} />
      </div>
      
      {/* Emirates Pill Navigation */}
      <div className="fixed left-7 top-1/2 transform -translate-y-1/2 z-[60]">
        <div className="emirates-sidebar flex flex-col overflow-hidden" style={{ width: '61px', height: '304px' }}>
          <div className="flex-1 flex flex-col justify-center items-center space-y-2 px-1">
            {/* Ideas - Lightbulb */}
            <Link href="/v1/use-cases">
              <button className={`emirates-nav-button w-8 h-8 flex items-center justify-center ${isActive('/v1/use-cases') ? 'emirates-nav-button-active' : ''}`}>
                <Lightbulb size={19} className={isActive('/v1/use-cases') ? "text-white" : "emirates-text-muted"} />
              </button>
            </Link>
            
            {/* Work Items - Target */}
            <Link href="/v1/requirements">
              <button className={`emirates-nav-button w-8 h-6 flex items-center justify-center ${isActive('/v1/requirements') ? 'emirates-nav-button-active' : ''}`}>
                <Target size={22} className={isActive('/v1/requirements') ? "text-white" : "emirates-text-muted"} />
              </button>
            </Link>
            
            {/* Design - Box */}
            <Link href="/v1/design">
              <button className={`emirates-nav-button w-8 h-6 flex items-center justify-center ${isActive('/v1/design') ? 'emirates-nav-button-active' : ''}`}>
                <Box size={17} className={isActive('/v1/design') ? "text-white" : "emirates-text-muted"} />
              </button>
            </Link>
            
            {/* Code - Code Icon */}
            <Link href="/v1/code">
              <button className={`emirates-nav-button w-8 h-7 flex items-center justify-center ${isActive('/v1/code') ? 'emirates-nav-button-active' : ''}`}>
                <Code size={17} className={isActive('/v1/code') ? "text-white" : "emirates-text-muted"} />
              </button>
            </Link>
            
            {/* Test Cases - Route/Roadmap */}
            <Link href="/v1/test-cases">
              <button className={`emirates-nav-button w-8 h-8 flex items-center justify-center ${isActive('/v1/test-cases') ? 'emirates-nav-button-active' : ''}`}>
                <Route size={17} className={isActive('/v1/test-cases') ? "text-white" : "emirates-text-muted"} />
              </button>
            </Link>
            
            {/* Emirates Perk Toggle */}
            <button className="emirates-nav-button w-8 h-8 flex items-center justify-center">
              <ToggleLeft size={17} className="emirates-text-muted hover:text-white transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
