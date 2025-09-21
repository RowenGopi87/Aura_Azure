"use client";

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Layout } from "@/components/layout/layout";
import { AuditProvider } from "@/components/audit/audit-provider";
import { useAuthStore } from "@/store/auth-store";
import { EmiratesPillNavigation } from "@/components/layout/emirates-pill-nav";

interface ConditionalLayoutProps {
  children: ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  
  // Show raw content (no layout) for the home landing page or when not authenticated
  if (pathname === '/' || !isAuthenticated) {
    return <>{children}</>;
  }
  
  // Admin routes and V1 routes use their own layouts
  if (pathname.startsWith('/admin') || pathname.startsWith('/v1')) {
    return (
      <AuditProvider>
        <EmiratesPillNavigation />
        {children}
      </AuditProvider>
    );
  }
  
  // Use normal AuraV2 layout with audit provider for other authenticated routes
  return (
    <AuditProvider>
      <EmiratesPillNavigation />
      <Layout>{children}</Layout>
    </AuditProvider>
  );
}
