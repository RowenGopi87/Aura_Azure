"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRBAC } from '@/hooks/use-rbac';
import { Shield, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredModule: string;
  requiredPermission?: 'read' | 'write' | 'delete' | 'admin';
  fallbackPath?: string;
}

export function RouteGuard({ 
  children, 
  requiredModule, 
  requiredPermission = 'read',
  fallbackPath = '/'
}: RouteGuardProps) {
  const router = useRouter();
  const { 
    hasModuleAccess, 
    hasPermission, 
    isLoading, 
    isAuthenticated, 
    logAccessAttempt,
    primaryRole 
  } = useRBAC();
  
  const [accessChecked, setAccessChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && !accessChecked) {
      const moduleAccess = hasModuleAccess(requiredModule);
      const permissionAccess = hasPermission(requiredModule, requiredPermission);
      const finalAccess = moduleAccess && permissionAccess;
      
      setHasAccess(finalAccess);
      setAccessChecked(true);
      
      // Log the access attempt
      logAccessAttempt(requiredModule, `route_access_${requiredPermission}`, finalAccess);
      
      // If no access, could redirect to fallback or show error
      // For now, we'll show the access denied screen
    }
  }, [
    isLoading, 
    isAuthenticated, 
    accessChecked, 
    hasModuleAccess, 
    hasPermission, 
    requiredModule, 
    requiredPermission,
    logAccessAttempt
  ]);

  // Show loading state while checking authentication and permissions
  if (!isAuthenticated || isLoading || !accessChecked) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto" />
          <div className="text-gray-600">
            {!isAuthenticated ? 'Checking authentication...' : 'Verifying permissions...'}
          </div>
        </div>
      </div>
    );
  }

  // Show access denied if user doesn't have permission
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-6 max-w-md mx-auto">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
              <p className="text-gray-600">
                You don't have permission to access this module.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Required Module:</span>
                <span className="font-medium text-gray-900">{requiredModule}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Required Permission:</span>
                <span className="font-medium text-gray-900">{requiredPermission}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Your Role:</span>
                <span className="font-medium text-gray-900">{primaryRole}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Link href={fallbackPath}>
              <Button className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </Link>
            
            <p className="text-xs text-gray-500">
              Contact your administrator if you believe you should have access to this module.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // User has access, render the protected content
  return <>{children}</>;
}

// Higher-order component version for easier use
export function withRouteGuard(
  Component: React.ComponentType,
  requiredModule: string,
  requiredPermission: 'read' | 'write' | 'delete' | 'admin' = 'read',
  fallbackPath: string = '/'
) {
  return function GuardedComponent(props: any) {
    return (
      <RouteGuard 
        requiredModule={requiredModule} 
        requiredPermission={requiredPermission}
        fallbackPath={fallbackPath}
      >
        <Component {...props} />
      </RouteGuard>
    );
  };
}
