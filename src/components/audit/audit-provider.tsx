"use client";

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { auditService } from '@/lib/audit/audit-service';

interface AuditContextType {
  trackPageView: (page: string, metadata?: any) => void;
  trackUserAction: (action: string, metadata?: any) => void;
}

const AuditContext = createContext<AuditContextType | null>(null);

interface AuditProviderProps {
  children: ReactNode;
}

export function AuditProvider({ children }: AuditProviderProps) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();

  // Track page views automatically
  useEffect(() => {
    if (isAuthenticated && user && pathname) {
      const pageCategory = getPageCategory(pathname);
      const pageName = getPageName(pathname);

      auditService.logEvent({
        userId: user.id,
        sessionId: user.sessionId,
        eventType: 'view',
        featureCategory: pageCategory,
        action: 'page_view',
        resourceType: 'page',
        resourceId: pathname,
        resourceTitle: pageName,
        metadata: {
          pathname,
          timestamp: new Date().toISOString()
        }
      });
    }
  }, [pathname, isAuthenticated, user]);

  // Track session activity
  useEffect(() => {
    if (isAuthenticated && user) {
      const handleActivity = () => {
        auditService.logEvent({
          userId: user.id,
          sessionId: user.sessionId,
          eventType: 'view',
          featureCategory: 'system',
          action: 'user_activity',
          metadata: {
            timestamp: new Date().toISOString(),
            pathname
          }
        });
      };

      // Track user activity every 5 minutes
      const activityInterval = setInterval(handleActivity, 5 * 60 * 1000);
      
      // Track on page visibility change
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          handleActivity();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        clearInterval(activityInterval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [isAuthenticated, user, pathname]);

  const trackPageView = (page: string, metadata?: any) => {
    if (isAuthenticated && user) {
      const pageCategory = getPageCategory(page);
      
      auditService.logEvent({
        userId: user.id,
        sessionId: user.sessionId,
        eventType: 'view',
        featureCategory: pageCategory,
        action: 'page_view',
        resourceType: 'page',
        resourceId: page,
        resourceTitle: getPageName(page),
        metadata
      });
    }
  };

  const trackUserAction = (action: string, metadata?: any) => {
    if (isAuthenticated && user) {
      auditService.logEvent({
        userId: user.id,
        sessionId: user.sessionId,
        eventType: 'view',
        featureCategory: 'system',
        action,
        metadata
      });
    }
  };

  return (
    <AuditContext.Provider value={{ trackPageView, trackUserAction }}>
      {children}
    </AuditContext.Provider>
  );
}

export function useAuditContext() {
  const context = useContext(AuditContext);
  if (!context) {
    throw new Error('useAuditContext must be used within an AuditProvider');
  }
  return context;
}

// Utility functions
function getPageCategory(pathname: string): 'brief' | 'initiative' | 'feature' | 'epic' | 'story' | 'code' | 'design' | 'test' | 'auth' | 'system' {
  if (pathname.includes('/business-brief')) return 'brief';
  if (pathname.includes('/initiative')) return 'initiative';
  if (pathname.includes('/feature')) return 'feature';
  if (pathname.includes('/epic')) return 'epic';
  if (pathname.includes('/story')) return 'story';
  if (pathname.includes('/code')) return 'code';
  if (pathname.includes('/design')) return 'design';
  if (pathname.includes('/test')) return 'test';
  if (pathname.includes('/auth') || pathname.includes('/login')) return 'auth';
  return 'system';
}

function getPageName(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  
  if (segments.length === 0) return 'Landing Page';
  if (segments[0] === 'aurav2') {
    if (segments.length === 1) return 'AuraV2 Dashboard';
    return segments.slice(1).map(segment => 
      segment.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    ).join(' - ');
  }
  if (segments[0] === 'v1') {
    if (segments.length === 1) return 'Version 1 Dashboard';
    return segments.slice(1).map(segment => 
      segment.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    ).join(' - ');
  }
  
  return segments.map(segment => 
    segment.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  ).join(' - ');
}
