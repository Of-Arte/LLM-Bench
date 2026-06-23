import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-white/75 dark:bg-[#13161c]/80 backdrop-blur-md border border-gray-200/40 dark:border-white/10 rounded-2xl shadow-lg transition-all duration-350 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
