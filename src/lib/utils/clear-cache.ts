// Utility to clear all frontend caches and force data refresh

export function clearAllCaches(): void {
  if (typeof window !== 'undefined') {
    // Clear localStorage caches
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('aura-') || 
        key.includes('initiative-') || 
        key.includes('feature-') || 
        key.includes('epic-') || 
        key.includes('story-') ||
        key.includes('portfolio-')
      )) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear sessionStorage caches
    const sessionKeysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (
        key.includes('aura-') || 
        key.includes('initiative-') || 
        key.includes('feature-') || 
        key.includes('epic-') || 
        key.includes('story-') ||
        key.includes('portfolio-')
      )) {
        sessionKeysToRemove.push(key);
      }
    }
    
    sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
    
    console.log('🧹 Cleared frontend caches:', {
      localStorage: keysToRemove.length,
      sessionStorage: sessionKeysToRemove.length
    });
    
    // Force page reload to ensure fresh data
    window.location.reload();
  }
}

export function clearSpecificCache(cacheType: 'initiatives' | 'features' | 'epics' | 'stories' | 'portfolios'): void {
  if (typeof window !== 'undefined') {
    const pattern = `${cacheType}-`;
    
    // Clear from localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes(pattern)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log(`🧹 Cleared ${cacheType} cache:`, keysToRemove.length, 'items');
  }
}
