import React from 'react';
import { motion } from 'motion/react';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ children, className = "", title, subtitle, rightElement }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0 }} 
      className={`space-y-6 ${className}`}
    >
      {(title || subtitle || rightElement) && (
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            {title && <h2 className="text-2xl font-bold text-[#1E293B]">{title}</h2>}
            {subtitle && <p className="text-black/50 text-sm">{subtitle}</p>}
          </div>
          {rightElement}
        </div>
      )}
      {children}
    </motion.div>
  );
};
