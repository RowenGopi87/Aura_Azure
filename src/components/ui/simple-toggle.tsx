"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, X } from "lucide-react";

interface SimpleToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

export function SimpleToggle({ 
  checked, 
  onCheckedChange, 
  disabled = false,
  size = "md" 
}: SimpleToggleProps) {
  const sizeClasses = {
    sm: "h-6 w-12",
    md: "h-8 w-16", 
    lg: "h-10 w-20"
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => !disabled && onCheckedChange(!checked)}
      disabled={disabled}
      className={`${sizeClasses[size]} p-0 relative ${
        checked 
          ? "bg-green-600 border-green-600 hover:bg-green-700" 
          : "bg-gray-200 border-gray-300 hover:bg-gray-300"
      }`}
    >
      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${
        checked ? "text-white" : "text-gray-600"
      }`}>
        {checked ? (
          <CheckCircle size={iconSizes[size]} />
        ) : (
          <X size={iconSizes[size]} />
        )}
      </div>
    </Button>
  );
}
