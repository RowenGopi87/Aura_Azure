import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { rbacService, UserPermission, ModuleInfo, RoleInfo } from '@/lib/rbac/rbac-service';
import { auditService } from '@/lib/audit/audit-service';

export function useRBAC() {
  const { user, isAuthenticated } = useAuthStore();
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [accessibleModules, setAccessibleModules] = useState<ModuleInfo[]>([]);
  const [userRoles, setUserRoles] = useState<RoleInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPortfolioLevel, setIsPortfolioLevel] = useState(false);

  // Load user permissions and roles
  const loadUserData = useCallback(async () => {
    if (!user || !isAuthenticated) {
      setPermissions([]);
      setAccessibleModules([]);
      setUserRoles([]);
      setIsAdmin(false);
      setIsPortfolioLevel(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      const [userPermissions, modules, roles, adminStatus, portfolioStatus] = await Promise.all([
        rbacService.loadUserPermissions(user.id),
        rbacService.getAccessibleModules(user),
        rbacService.getUserRoles(user),
        rbacService.isAdmin(user),
        rbacService.isPortfolioLevel(user)
      ]);

      setPermissions(userPermissions);
      setAccessibleModules(modules);
      setUserRoles(roles);
      setIsAdmin(adminStatus);
      setIsPortfolioLevel(portfolioStatus);

      // Log access check for audit
      await auditService.logEvent({
        userId: user.id,
        sessionId: user.sessionId,
        eventType: 'view',
        featureCategory: 'system',
        action: 'rbac_check',
        metadata: {
          rolesLoaded: roles.length,
          modulesAccessible: modules.length,
          isAdmin: adminStatus,
          isPortfolioLevel: portfolioStatus
        }
      });

    } catch (error) {
      console.error('Failed to load user RBAC data:', error);
      setPermissions([]);
      setAccessibleModules([]);
      setUserRoles([]);
      setIsAdmin(false);
      setIsPortfolioLevel(false);
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthenticated]);

  // Load data when user changes
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Check if user has access to a specific module
  const hasModuleAccess = useCallback((moduleName: string): boolean => {
    return permissions.some(p => p.moduleName === moduleName && p.canAccess);
  }, [permissions]);

  // Check if user has specific permission for a module
  const hasPermission = useCallback((
    moduleName: string, 
    permissionType: 'read' | 'write' | 'delete' | 'admin'
  ): boolean => {
    const modulePermission = permissions.find(p => p.moduleName === moduleName);
    if (!modulePermission?.canAccess) return false;
    
    switch (permissionType) {
      case 'read': return modulePermission.canRead;
      case 'write': return modulePermission.canWrite;
      case 'delete': return modulePermission.canDelete;
      case 'admin': return modulePermission.canAdmin;
      default: return false;
    }
  }, [permissions]);

  // Get permission info for a specific module
  const getModulePermission = useCallback((moduleName: string): UserPermission | null => {
    return permissions.find(p => p.moduleName === moduleName) || null;
  }, [permissions]);

  // Check if user can access a route
  const canAccessRoute = useCallback((routePath: string): boolean => {
    return accessibleModules.some(m => m.routePath === routePath);
  }, [accessibleModules]);

  // Get filtered navigation items based on permissions
  const getFilteredNavigation = useCallback((navigationItems: any[]): any[] => {
    return navigationItems.filter(item => {
      if (item.href) {
        return canAccessRoute(item.href);
      }
      if (item.moduleName) {
        return hasModuleAccess(item.moduleName);
      }
      return true; // Allow items without specific module requirements
    });
  }, [canAccessRoute, hasModuleAccess]);

  // Log access attempt for audit
  const logAccessAttempt = useCallback(async (
    moduleName: string, 
    action: string, 
    granted: boolean
  ) => {
    if (!user) return;

    await auditService.logEvent({
      userId: user.id,
      sessionId: user.sessionId,
      eventType: 'view',
      featureCategory: 'system',
      action: 'access_attempt',
      metadata: {
        moduleName,
        action,
        accessGranted: granted,
        userRole: userRoles.map(r => r.name).join(','),
        timestamp: new Date().toISOString()
      }
    });
  }, [user, userRoles]);

  // Refresh permissions (useful after role changes)
  const refreshPermissions = useCallback(async () => {
    if (user) {
      rbacService.clearUserCache(user.id);
      await loadUserData();
    }
  }, [user, loadUserData]);

  return {
    // Data
    permissions,
    accessibleModules,
    userRoles,
    isLoading,
    isAdmin,
    isPortfolioLevel,
    
    // Methods
    hasModuleAccess,
    hasPermission,
    getModulePermission,
    canAccessRoute,
    getFilteredNavigation,
    logAccessAttempt,
    refreshPermissions,
    
    // Computed values
    isAuthenticated: isAuthenticated && !!user,
    hasAnyAccess: accessibleModules.length > 0,
    primaryRole: userRoles[0]?.displayName || 'No Role Assigned'
  };
}

// Type definitions for RBAC protection
export interface RBACProtectionConfig {
  requiredModule: string;
  requiredPermission?: 'read' | 'write' | 'delete' | 'admin';
}
