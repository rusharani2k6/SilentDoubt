import React from 'react';

export const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  icon: Icon,
  className = '',
  dot = false,
  ...props
}) => {
  const base =
    'inline-flex items-center font-bold tracking-tight rounded-full transition-all select-none';

  const variants = {
    // Soft Cyan — primary accent
    cyan:
      'bg-[#9BE5E3]/35 text-[#1F7A78] border border-[#9BE5E3]/70',
    // Warm Yellow — secondary accent
    warm:
      'bg-[#F6E49F]/50 text-[#7A620E] border border-[#EDCF72]/70',
    // Soft Blue
    blue:
      'bg-[#A6C8DE]/40 text-[#2D6080] border border-[#A6C8DE]/80',
    // Strong / primary
    primary:
      'bg-[#0D0F0D]/8 text-[#0D0F0D] border border-[#0D0F0D]/15',
    // Dark inverted
    dark:
      'bg-[#0D0F0D] text-white',
    // Neutral gray
    neutral:
      'bg-[#F0F2F5] text-[#3D3F4A] border border-[#E4E8EE]',
    // Success
    success:
      'bg-emerald-50 text-emerald-700 border border-emerald-200',
    // Danger
    danger:
      'bg-rose-50 text-rose-700 border border-rose-200',
  };

  const sizes = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1',
    md: 'text-xs px-3 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-extrabold',
  };

  return (
    <span
      className={`${base} ${variants[variant] || variants.neutral} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {Icon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      {children}
    </span>
  );
};
