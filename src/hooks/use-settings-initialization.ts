"use client";

import { useEffect } from 'react';
import { useSettingsStore } from '@/store/settings-store';

/**
 * Hook to initialize settings from environment variables on app startup
 * This should be called in the root layout or main app component
 */
export function useSettingsInitialization() {
  const { initializeFromEnvironment } = useSettingsStore();

  useEffect(() => {
    // Initialize settings from environment variables
    initializeFromEnvironment();
  }, [initializeFromEnvironment]);
}
