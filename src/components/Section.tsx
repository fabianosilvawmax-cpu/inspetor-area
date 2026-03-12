import React from 'react';

interface SectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export default function Section({ title, icon, children }: SectionProps) {
  return (
    <div className="pt-4 border-t border-black/5 space-y-4">
      <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}
