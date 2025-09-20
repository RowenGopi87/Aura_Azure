"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth-store";
import { useRBAC } from "@/hooks/use-rbac";
import Link from "next/link";
import { 
  User, 
  Shield, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  LogOut,
  Settings,
  Eye,
  Edit3,
  Trash2,
  Crown,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export function UserProfileCard() {
  const { user, logout } = useAuthStore();
  const { 
    permissions, 
    userRoles, 
    isAdmin, 
    isPortfolioLevel, 
    primaryRole,
    accessibleModules 
  } = useRBAC();
  
  const [showPermissions, setShowPermissions] = useState(false);

  if (!user) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getLevelColor = (level: string) => {
    const colors = {
      'executive': 'bg-red-100 text-red-700 border-red-200',
      'portfolio': 'bg-purple-100 text-purple-700 border-purple-200',
      'art': 'bg-blue-100 text-blue-700 border-blue-200',
      'team': 'bg-green-100 text-green-700 border-green-200'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'read': return <Eye className="h-3 w-3" />;
      case 'write': return <Edit3 className="h-3 w-3" />;
      case 'delete': return <Trash2 className="h-3 w-3" />;
      case 'admin': return <Crown className="h-3 w-3" />;
      default: return <Shield className="h-3 w-3" />;
    }
  };

  return (
    <Card className="w-80 shadow-lg border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-start space-x-3">
          <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-slate-700 font-semibold text-lg">
              {getInitials(user.displayName)}
            </span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <CardTitle className="text-lg font-semibold truncate">
                {user.displayName}
              </CardTitle>
              {isAdmin && (
                <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-xs">
                  <Crown className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              )}
            </div>
            <CardDescription className="text-sm">
              {user.jobTitle}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Basic Info */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">{user.email}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <Building className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">{user.department}</span>
          </div>
          
          {user.officeLocation && (
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">{user.officeLocation}</span>
            </div>
          )}
          
          {user.businessPhones && user.businessPhones.length > 0 && (
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">{user.businessPhones[0]}</span>
            </div>
          )}
        </div>

        {/* Access Summary */}
        <div className="p-3 bg-slate-50 rounded-lg">
          <div className="text-sm text-slate-700">
            Access to {accessibleModules.length} modules
          </div>
        </div>

        {/* Permissions Toggle */}
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPermissions(!showPermissions)}
            className="w-full justify-between text-left"
          >
            <span className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Module Permissions</span>
            </span>
            {showPermissions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          
          {showPermissions && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {permissions.map((permission) => (
                <div 
                  key={`${permission.moduleName}`}
                  className={`p-2 rounded border text-xs ${
                    permission.canAccess 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${
                      permission.canAccess ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {permission.moduleDisplayName}
                    </span>
                    <div className="flex space-x-1">
                      {permission.canRead && (
                        <div className="p-1 bg-blue-100 rounded text-blue-600" title="Read">
                          <Eye className="h-3 w-3" />
                        </div>
                      )}
                      {permission.canWrite && (
                        <div className="p-1 bg-orange-100 rounded text-orange-600" title="Write">
                          <Edit3 className="h-3 w-3" />
                        </div>
                      )}
                      {permission.canDelete && (
                        <div className="p-1 bg-red-100 rounded text-red-600" title="Delete">
                          <Trash2 className="h-3 w-3" />
                        </div>
                      )}
                      {permission.canAdmin && (
                        <div className="p-1 bg-purple-100 rounded text-purple-600" title="Admin">
                          <Crown className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Session Info */}
        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>Logged in: {user.loginTime ? new Date(user.loginTime).toLocaleString() : 'Unknown'}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 pt-2">
          {isAdmin && (
            <Link href="/admin/audit" className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Admin Dashboard
              </Button>
            </Link>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={logout}
            className={`${isAdmin ? 'flex-1' : 'w-full'} border-slate-200 text-slate-700 hover:bg-slate-50`}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
