"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plane, 
  Shield, 
  User, 
  Lock, 
  ArrowRight,
  Building2,
  Globe,
  CheckCircle
} from "lucide-react";
import { useRouter } from "next/navigation";

interface EmiratesLoginProps {
  onLogin: (user: any) => void;
}

// Mock Emirates users for demonstration with actual database IDs
const MOCK_USERS = [
  {
    id: 'c09ee620-95b4-11f0-b1e6-60ff9e34b8d1', // Actual DB ID
    userPrincipalName: 'rowen.gopi@emirates.com',
    displayName: 'Rowen Gopi',
    jobTitle: 'System Administrator',
    department: 'IT Operations',
    roles: ['system_administrator'],
    organizationalLevel: 'executive'
  },
  {
    id: 'e814ff13-95b5-11f0-b1e6-60ff9e34b8d1', // Actual DB ID
    userPrincipalName: 'sarah.ahmed@emirates.com',
    displayName: 'Sarah Ahmed',
    jobTitle: 'Technical Product Manager',
    department: 'Product and Delivery',
    roles: ['technical_product_manager'],
    organizationalLevel: 'art'
  },
  {
    id: 'e8150390-95b5-11f0-b1e6-60ff9e34b8d1', // Actual DB ID
    userPrincipalName: 'mohammed.hassan@emirates.com', 
    displayName: 'Mohammed Hassan',
    jobTitle: 'Manager of Product and Delivery',
    department: 'Product and Delivery',
    roles: ['manager_product_delivery'],
    organizationalLevel: 'portfolio'
  },
  {
    id: 'e815054b-95b5-11f0-b1e6-60ff9e34b8d1', // Actual DB ID
    userPrincipalName: 'fatima.ali@emirates.com',
    displayName: 'Fatima Ali', 
    jobTitle: 'Principal Software Engineer',
    department: 'Software Engineering',
    roles: ['principal_software_engineer'],
    organizationalLevel: 'art'
  },
  {
    id: 'c5a8c998-95b4-11f0-b1e6-60ff9e34b8d1', // Actual DB ID
    userPrincipalName: 'layla.omar@emirates.com',
    displayName: 'Layla Omar',
    jobTitle: 'Software Developer',
    department: 'Software Engineering',
    roles: ['software_developer'],
    organizationalLevel: 'team'
  },
  {
    id: 'c5a8c77d-95b4-11f0-b1e6-60ff9e34b8d1', // Actual DB ID
    userPrincipalName: 'ahmad.hassan@emirates.com',
    displayName: 'Ahmad Hassan',
    jobTitle: 'Senior Quality Engineer',
    department: 'Quality Engineering',
    roles: ['senior_quality_engineer'],
    organizationalLevel: 'team'
  },
  {
    id: 'c5a8ca55-95b4-11f0-b1e6-60ff9e34b8d1', // Actual DB ID
    userPrincipalName: 'khalid.ali@emirates.com',
    displayName: 'Khalid Ali',
    jobTitle: 'Technical Product Owner',
    department: 'Product and Delivery',
    roles: ['technical_product_owner'],
    organizationalLevel: 'team'
  }
];

export function EmiratesLogin({ onLogin }: EmiratesLoginProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Find mock user
      const user = MOCK_USERS.find(u => 
        u.userPrincipalName.toLowerCase() === email.toLowerCase()
      );

      if (!user) {
        setError("User not found in Emirates directory. Please contact IT support.");
        return;
      }

      // Simulate successful login
      const authResult = {
        ...user,
        sessionId: `session_${Date.now()}`,
        loginTime: new Date().toISOString(),
        accessToken: `mock_token_${user.id}`
      };

      onLogin(authResult);
      
      // Redirect to Version 1 for all users
      router.push('/v1');

    } catch (err) {
      setError("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (user: any) => {
    setEmail(user.userPrincipalName);
    // Auto-login for demo purposes
    setTimeout(() => {
      const authResult = {
        ...user,
        sessionId: `session_${Date.now()}`,
        loginTime: new Date().toISOString(),
        accessToken: `mock_token_${user.id}`
      };
      onLogin(authResult);
      router.push('/v1');
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#C4D4D6' }}>
      {/* Subtle geometric background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-repeat" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23334155' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
             }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Emirates Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 bg-white/20 backdrop-blur-md border border-white/30 px-6 py-4 rounded-2xl shadow-xl mb-6">
            <div className="p-2 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg">
              <Plane size={24} className="text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold text-slate-700">Emirates</h1>
              <p className="text-sm text-slate-500">Digital Workplace</p>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Sign in to AURA</h2>
          <p className="text-slate-600">Access your organizational development platform</p>
        </div>

        {/* Login Card */}
        <Card className="bg-white/20 backdrop-blur-md border border-white/30 rounded-lg shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-semibold text-slate-800">Welcome back</CardTitle>
              <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                <Shield size={12} className="mr-1" />
                SSO
              </Badge>
            </div>
            <p className="text-gray-600">Sign in with your Emirates credentials</p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-700 flex items-center">
                  <User size={16} className="mr-2 text-slate-600" />
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.name@emirates.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-black hover:bg-gray-800 text-white font-semibold text-base shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Lock size={16} />
                    <span>Sign in with SSO</span>
                    <ArrowRight size={16} />
                  </div>
                )}
              </Button>
            </form>

            {/* Quick Login for Demo */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-3 text-center">Demo Users - Quick Login:</p>
              <div className="bg-gray-200/80 backdrop-blur-sm border border-gray-300/60 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-2">
                {MOCK_USERS.filter(user => !user.roles.includes('system_administrator')).slice(0, 2).map((user) => (
                  <Button
                    key={user.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickLogin(user)}
                    className="text-xs p-2 h-auto flex-col border-slate-200 hover:bg-slate-50"
                    disabled={isLoading}
                  >
                    <div className="font-medium text-slate-700">{user.displayName.split(' ')[0]}</div>
                    <div className="text-gray-500 text-[10px] leading-tight">{user.jobTitle}</div>
                    <div className="text-gray-400 text-[9px]">{user.organizationalLevel}</div>
                  </Button>
                ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center space-y-4">
          <div className="flex items-center justify-center space-x-4 text-slate-600 text-sm">
            <div className="flex items-center space-x-1">
              <CheckCircle size={16} />
              <span>Secure Authentication</span>
            </div>
            <div className="flex items-center space-x-1">
              <Building2 size={16} />
              <span>Enterprise Grade</span>
            </div>
            <div className="flex items-center space-x-1">
              <Globe size={16} />
              <span>Global Access</span>
            </div>
          </div>
          
          <div className="text-xs text-slate-500 space-y-1">
            <p>© 2025 Emirates. All rights reserved.</p>
            <p>Need help? Contact IT Support: +971 4 214 4444</p>
          </div>
        </div>
      </div>
    </div>
  );
}
