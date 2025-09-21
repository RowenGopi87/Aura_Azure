"use client";

import React from 'react';
import { useDashboardStore } from '@/store/dashboard-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function Version1DashboardPage() {
  const { dashboardData } = useDashboardStore();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <Link href="/v1">
            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
              <ArrowLeft size={16} />
              <span>Back to Version 1</span>
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-6 w-6" />
            <span>Dashboard Overview</span>
          </CardTitle>
          <CardDescription>
            System overview and key metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>Dashboard content will be implemented here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}