import React from 'react';
import { Card } from './Card';

export const StatCard = ({
  label,
  value,
  icon: Icon,
  trend,
  color = 'cyan', // cyan | yellow | blue | dark
  description,
  className = '',
}) => {
  // Icon badge: pastel tinted background + matching text color
  const colorMap = {
    cyan:   'bg-[#9BE5E3]/30 text-[#1F7A78]',
    yellow: 'bg-[#F6E49F]/50 text-[#7A620E]',
    blue:   'bg-[#A6C8DE]/35 text-[#2D6080]',
    dark:   'bg-[#0D0F0D]/8 text-[#0D0F0D]',
    // backwards-compat
    warm:    'bg-[#F6E49F]/50 text-[#7A620E]',
    primary: 'bg-[#0D0F0D]/8 text-[#0D0F0D]',
  };

  return (
    <Card hover className={`flex flex-col justify-between ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <span className="text-xs font-bold text-[#8A8B97] uppercase tracking-wider block mb-1">
            {label}
          </span>
          <h4 className="text-2xl sm:text-3xl font-extrabold text-[#0D0F0D] tracking-tight">
            {value}
          </h4>
        </div>
        {Icon && (
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${colorMap[color] || colorMap.cyan}`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(trend || description) && (
        <div className="flex items-center gap-2 pt-2 border-t border-[#F0F2F5] text-xs">
          {trend && (
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              {trend}
            </span>
          )}
          {description && (
            <span className="text-[#8A8B97] font-medium">{description}</span>
          )}
        </div>
      )}
    </Card>
  );
};
