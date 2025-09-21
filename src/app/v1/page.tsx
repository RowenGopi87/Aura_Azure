"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRBAC } from "@/hooks/use-rbac";
import { 
  Lightbulb, 
  Target, 
  Box, 
  Code,
  Route,
  Play, 
  ArrowRight,
  CheckCircle,
  Sparkles,
  Users,
  Clock,
  Zap,
  ChevronRight,
  Wand2
} from "lucide-react";
import Link from "next/link";

export default function Version1HomePage() {
  const { hasModuleAccess, primaryRole, isAuthenticated } = useRBAC();
  
  // Streamlined workflow steps with clear progression
  const workflowSteps = [
    {
      step: 1,
      icon: Lightbulb,
      title: "Ideas",
      description: "Start with a business idea or use case",
      path: "/v1/use-cases",
      moduleName: "ideas",
      color: "blue",
      isStartPoint: true
    },
    {
      step: 2,
      icon: Target,
      title: "Work Items",
      description: "Break down ideas into actionable work items",
      path: "/v1/requirements",
      moduleName: "work_items",
      color: "purple"
    },
    {
      step: 3,
      icon: Box,
      title: "Design",
      description: "Create system designs and architecture",
      path: "/v1/design",
      moduleName: "design",
      color: "green"
    },
    {
      step: 4,
      icon: Code,
      title: "Code",
      description: "Generate and implement code solutions",
      path: "/v1/code",
      moduleName: "code",
      color: "orange"
    },
    {
      step: 5,
      icon: Route,
      title: "Test Cases",
      description: "Create comprehensive test scenarios",
      path: "/v1/test-cases",
      moduleName: "test_cases",
      color: "teal"
    },
    {
      step: 6,
      icon: Play,
      title: "Execution",
      description: "Execute tests and validate results",
      path: "/v1/execution",
      moduleName: "execution",
      color: "indigo"
    }
  ];

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-600 border-t-transparent mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const accessibleSteps = workflowSteps.filter(step => hasModuleAccess(step.moduleName));
  const nextStep = accessibleSteps.find(step => step.isStartPoint) || accessibleSteps[0];

  return (
    <div className="space-y-6 py-4">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-3 emirates-glass-modal px-6 py-3 rounded-full text-base font-semibold shadow-lg">
          <Sparkles size={18} className="text-purple-600" />
          <span className="emirates-text-primary">Welcome to AURA AI Platform</span>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-3xl font-bold emirates-text-primary">
            Hello, <span className="text-blue-600">{primaryRole}</span>
          </h1>
          <p className="text-lg emirates-text-muted max-w-2xl mx-auto">
            AI-powered workflow to transform your ideas into reality
          </p>
        </div>

        {/* Quick Start */}
        {nextStep && (
          <div className="emirates-glass-card p-6 max-w-lg mx-auto">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-900">Ready to get started?</h3>
                <p className="text-sm text-slate-600">Begin your development workflow</p>
              </div>
            </div>
            
            <Link href={nextStep.path}>
              <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                <nextStep.icon size={20} className="mr-3" />
                <span>Start with AI {nextStep.title}</span>
                <ArrowRight size={16} className="ml-3" />
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Workflow Steps */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold emirates-text-primary mb-2">Your AI Development Workflow</h2>
          <p className="emirates-text-muted">Six intelligent steps to bring your ideas to life</p>
        </div>

        <div className="relative">
          {/* Workflow Connection Line */}
          <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-full max-w-4xl h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 via-green-200 via-orange-200 via-teal-200 to-indigo-200 opacity-50 hidden lg:block" />
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto relative z-10">
            {accessibleSteps.map((step, index) => {
              const Icon = step.icon;
              const isAccessible = hasModuleAccess(step.moduleName);
              const colorClasses = {
                blue: 'from-blue-500 to-blue-600 bg-blue-50 border-blue-200 text-blue-700',
                purple: 'from-purple-500 to-purple-600 bg-purple-50 border-purple-200 text-purple-700',
                green: 'from-green-500 to-green-600 bg-green-50 border-green-200 text-green-700',
                orange: 'from-orange-500 to-orange-600 bg-orange-50 border-orange-200 text-orange-700',
                teal: 'from-teal-500 to-teal-600 bg-teal-50 border-teal-200 text-teal-700',
                indigo: 'from-indigo-500 to-indigo-600 bg-indigo-50 border-indigo-200 text-indigo-700'
              };
              
              const [gradientFrom, gradientTo, bgColor, borderColor, textColor] = colorClasses[step.color as keyof typeof colorClasses].split(' ');
              
              return (
                <Link key={step.step} href={isAccessible ? step.path : '#'}>
                  <Card className={`emirates-glass-card group hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden ${
                    isAccessible 
                      ? `hover:scale-[1.02] hover:shadow-2xl` 
                      : 'opacity-50 cursor-not-allowed'
                  }`}>
                    {/* Step connector */}
                    {index < accessibleSteps.length - 1 && (
                      <div className="absolute top-1/2 -right-3 transform -translate-y-1/2 hidden lg:block">
                        <ChevronRight className="h-6 w-6 text-slate-300" />
                      </div>
                    )}
                    
                    <CardContent className="p-4 text-center relative h-32">
                      {/* Step Number */}
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
                        <span className="text-xs font-bold emirates-text-primary">{step.step}</span>
                      </div>
                      
                      {/* Icon */}
                      <div className={`mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-3 shadow-lg ${
                        isAccessible 
                          ? `bg-gradient-to-br ${gradientFrom} ${gradientTo}`
                          : 'bg-gray-100'
                      }`}>
                        <Icon className={`w-6 h-6 ${isAccessible ? 'text-white' : 'text-gray-400'}`} />
                      </div>
                      
                      {/* Title */}
                      <h3 className={`text-lg font-bold ${isAccessible ? 'emirates-text-primary' : 'text-gray-400'}`}>
                        {step.title}
                      </h3>
                      
                      {step.isStartPoint && isAccessible && (
                        <div className="absolute -top-1 -left-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Role-specific guidance */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <Users className="h-6 w-6 text-slate-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Optimized for {primaryRole}
            </h3>
            <p className="text-slate-600 mb-4">
              Your workflow has been customized based on your role and permissions. 
              You have access to {accessibleSteps.length} modules in the development lifecycle.
            </p>
            
            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Streamlined for efficiency</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-4 w-4" />
                <span>Role-based access</span>
              </div>
              <div className="flex items-center space-x-1">
                <Sparkles className="h-4 w-4" />
                <span>AI-powered generation</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="h-4 w-4" />
                <span>Automated workflows</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}