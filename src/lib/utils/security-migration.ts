/**
 * Security Migration Script
 * 
 * Removes API keys from client-side storage as part of security refactor.
 * Runs once on app initialization to clean up legacy insecure key storage.
 * 
 * @module security-migration
 */

export function migrateToServerSideKeys(): void {
  if (typeof window === 'undefined') {
    // Server-side, skip
    return;
  }

  try {
    console.log('🔐 [SECURITY MIGRATION] Starting API key cleanup from client storage...');

    // Get the aura-settings from localStorage
    const settingsKey = 'aura-settings';
    const rawSettings = localStorage.getItem(settingsKey);

    if (!rawSettings) {
      console.log('🔐 [SECURITY MIGRATION] No settings found in localStorage');
      return;
    }

    const settings = JSON.parse(rawSettings);
    let hasKeys = false;

    // Check if API keys exist in the settings
    if (settings.state?.llmSettings) {
      const llmSettings = settings.state.llmSettings;

      if (llmSettings.apiKey) {
        console.log('🔐 [SECURITY MIGRATION] Found API key in llmSettings, removing...');
        delete llmSettings.apiKey;
        hasKeys = true;
      }

      if (llmSettings.apiKeys) {
        console.log('🔐 [SECURITY MIGRATION] Found apiKeys object, removing...');
        delete llmSettings.apiKeys;
        hasKeys = true;
      }
    }

    if (hasKeys) {
      // Save the cleaned settings back to localStorage
      localStorage.setItem(settingsKey, JSON.stringify(settings));
      console.log('✅ [SECURITY MIGRATION] API keys removed from localStorage');
      console.log('🔐 [SECURITY MIGRATION] Provider/model preferences preserved');
    } else {
      console.log('✅ [SECURITY MIGRATION] No API keys found in storage (already clean)');
    }

    // Mark migration as complete
    localStorage.setItem('aura-security-migration-v1', 'completed');
    console.log('✅ [SECURITY MIGRATION] Migration completed successfully');

  } catch (error) {
    console.error('❌ [SECURITY MIGRATION] Failed to migrate settings:', error);
    // Non-fatal error, app can continue
  }
}

/**
 * Check if migration has already run
 */
export function hasSecurityMigrationRun(): boolean {
  if (typeof window === 'undefined') {
    return true; // Server-side, consider it run
  }

  return localStorage.getItem('aura-security-migration-v1') === 'completed';
}

/**
 * Run migration if not already completed
 */
export function runSecurityMigrationIfNeeded(): void {
  if (!hasSecurityMigrationRun()) {
    console.log('🔐 [SECURITY MIGRATION] Running first-time security migration...');
    migrateToServerSideKeys();
  } else {
    console.log('✅ [SECURITY MIGRATION] Migration already completed, skipping');
  }
}
