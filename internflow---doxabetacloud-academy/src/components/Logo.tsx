import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showSubText = true, className = '' }) => {
  const sizeClasses = {
    sm: 'h-8 px-2.5 py-1 text-xs',
    md: 'h-10 px-3.5 py-1.5 text-sm',
    lg: 'h-14 px-5 py-2.5 text-base'
  };

  const titleSizes = {
    sm: 'text-sm font-extrabold',
    md: 'text-lg font-extrabold',
    lg: 'text-2xl font-extrabold'
  };

  const subSizes = {
    sm: 'text-[10px] font-light',
    md: 'text-xs font-light',
    lg: 'text-sm font-light'
  };

  return (
    <div className={`inline-flex items-center gap-2.5 bg-[#5243e3] text-white rounded-lg shadow-sm ${sizeClasses[size]} ${className}`}>
      <div className="relative flex flex-col leading-none select-none">
        <div className="flex items-start gap-0.5">
          <span className={`${titleSizes[size]} tracking-tight text-white`}>Doxabeta</span>
          {/* Yellow quarter circle accent icon */}
          <div className="w-2.5 h-2.5 bg-amber-400 rounded-tr-full mt-0.5 shrink-0" title="Doxabeta Cloud Accent" />
        </div>
        {showSubText && (
          <span className={`${subSizes[size]} tracking-normal text-indigo-100 opacity-95 -mt-0.5`}>
            Cloud Academy
          </span>
        )}
      </div>
    </div>
  );
};
