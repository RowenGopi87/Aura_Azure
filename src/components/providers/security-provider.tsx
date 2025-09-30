'use client';

import { useEffect } from 'react';
import { runSecurityMigrationIfNeeded } from '@/lib/utils/security-migration';

/**
 * Security Provider Component
 * 
 * Runs security migrations on app initialization.
 * Currently handles API key cleanup from client storage.
 */
export function SecurityProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Run security migration once on app mount
    runSecurityMigrationIfNeeded();
  }, []);

  return <>{children}</>;
}
