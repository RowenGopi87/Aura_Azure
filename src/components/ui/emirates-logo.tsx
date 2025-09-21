import React from 'react';
import Image from 'next/image';
import emiratesLogo from '@/assets/images/emirates-logo.png';

interface EmiratesLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export function EmiratesLogo({ width = 86, height = 124, className = "" }: EmiratesLogoProps) {
  return (
    <div 
      className={`emirates-logo-bg flex items-center justify-center relative ${className}`}
      style={{ width, height }}
    >
      {/* Emirates Logo - Actual Image */}
      <div className="flex items-center justify-center w-full h-full">
        <Image 
          src={emiratesLogo}
          alt="Emirates"
          width={width - 4}
          height={height - 4}
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}
