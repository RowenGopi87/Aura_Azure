"use client";

import { useEffect, useState } from "react";
import { EmiratesLogin } from "@/components/auth/emirates-login";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const { isAuthenticated, login, user } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    if (isAuthenticated && user) {
      router.push('/v1');
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-slate-800 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-transparent mx-auto mb-4" />
          <p className="text-lg">Loading AURA...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <EmiratesLogin onLogin={login} />;
  }

  return null;
}