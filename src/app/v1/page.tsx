"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRBAC } from "@/hooks/use-rbac";
import { 
  FileText, 
  Settings, 
  TestTube, 
  Play, 
  ArrowRight,
  CheckCircle,
  Palette,
  Code2,
  Sparkles,
  Users,
  Clock,
  Target,
  Zap,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

export default function Version1HomePage() {
  const { hasModuleAccess, primaryRole, isAuthenticated } = useRBAC();
  
  // Streamlined workflow steps with clear progression
  const workflowSteps = [
    {
      step: 1,
      icon: FileText,
      title: "Ideas",
      description: "Start with a business idea or use case",
      path: "/v1/use-cases",
      moduleName: "ideas",
      color: "blue",
      isStartPoint: true
    },
    {
      step: 2,
      icon: Settings,
      title: "Work Items",
      description: "Break down ideas into actionable work items",
      path: "/v1/requirements",
      moduleName: "work_items",
      color: "purple"
    },
    {
      step: 3,
      icon: Palette,
      title: "Design",
      description: "Create system designs and architecture",
      path: "/v1/design",
      moduleName: "design",
      color: "green"
    },
    {
      step: 4,
      icon: Code2,
      title: "Code",
      description: "Generate and implement code solutions",
      path: "/v1/code",
      moduleName: "code",
      color: "orange"
    },
    {
      step: 5,
      icon: TestTube,
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
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 text-slate-700 px-6 py-3 rounded-full text-base font-semibold shadow-sm">
          <Sparkles size={18} className="text-blue-600" />
          <span>Welcome to AURA Development Platform</span>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-slate-900">
            Hello, <span className="text-blue-600">{primaryRole}</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Follow the guided workflow to transform your ideas into reality
          </p>
        </div>

        {/* Quick Start */}
        {nextStep && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 max-w-lg mx-auto">
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
                <span>Start with {nextStep.title}</span>
                <ArrowRight size={16} className="ml-3" />
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Workflow Steps */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Development Workflow</h2>
          <p className="text-slate-600">Follow these steps to bring your ideas to life</p>
        </div>

        <div className="relative">
          {/* Workflow Connection Line */}
          <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-full max-w-4xl h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 via-green-200 via-orange-200 via-teal-200 to-indigo-200 opacity-50 hidden lg:block" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
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
                  <Card className={`group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 relative overflow-hidden ${
                    isAccessible 
                      ? `hover:scale-[1.02] ${bgColor} ${borderColor} hover:shadow-${step.color}-200/50` 
                      : 'border-gray-200 opacity-50 cursor-not-allowed bg-gray-50'
                  }`}>
                    {/* Step connector */}
                    {index < accessibleSteps.length - 1 && (
                      <div className="absolute top-1/2 -right-3 transform -translate-y-1/2 hidden lg:block">
                        <ChevronRight className="h-6 w-6 text-slate-300" />
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-4 relative">
                      <div className="relative">
                        <div className={`mx-auto w-16 h-16 rounded-xl flex items-center justify-center mb-4 shadow-lg ${
                          isAccessible 
                            ? `bg-gradient-to-br ${gradientFrom} ${gradientTo}`
                            : 'bg-gray-100'
                        }`}>
                          <Icon className={`w-8 h-8 ${isAccessible ? 'text-white' : 'text-gray-400'}`} />
                        </div>
                        
                        <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ${
                          isAccessible 
                            ? `bg-gradient-to-br ${gradientFrom} ${gradientTo}`
                            : 'bg-gray-400'
                        }`}>
                          {step.step}
                        </div>
                      </div>
                      
                      <CardTitle className={`text-xl font-bold mb-2 ${isAccessible ? 'text-slate-900' : 'text-gray-400'}`}>
                        {step.title}
                      </CardTitle>
                      <CardDescription className={`text-sm leading-relaxed ${isAccessible ? 'text-slate-600' : 'text-gray-400'}`}>
                        {step.description}
                      </CardDescription>
                      
                      <div className="mt-3 space-y-2">
                        {step.isStartPoint && isAccessible && (
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Start Here
                          </Badge>
                        )}
                        
                        {!isAccessible && (
                          <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                            No Access
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
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