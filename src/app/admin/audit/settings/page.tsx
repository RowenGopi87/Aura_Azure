"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

export default function AuditSettingsPage() {
  const { user } = useAuthStore();
  
  // Check if user is admin
  const isAdmin = user?.roles?.includes('system_administrator') || user?.roles?.includes('admin');

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need administrator privileges to configure audit settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Settings</h1>
          <p className="text-gray-600">Configure audit system behavior and feature tracking</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Basic Configuration</CardTitle>
          <CardDescription>
            Configure basic audit system settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>Audit settings will be implemented here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}