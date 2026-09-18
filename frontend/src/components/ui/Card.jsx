import React from 'react';

export const Card = ({
  children,
  className = '',
  hover = false,
  glass = false,
  padding = 'p-6',
  ...props
}) => {
  return (
    <div
      className={`rounded-3xl border border-[#E4E8EE] ${
        glass ? 'glass-panel' : 'bg-white'
      } ${
        hover ? 'hover:shadow-sd-lg hover:border-[#CBD5E1] transition-all duration-300' : 'shadow-sd-sm'
      } ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
