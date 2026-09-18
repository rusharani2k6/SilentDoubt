import React from 'react';

export const Input = ({
  label,
  error,
  icon: Icon,
  iconRight: IconRight,
  onClickIconRight,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-bold uppercase tracking-wider text-[#3D3F4A] mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 pointer-events-none text-[#8A8B97]">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={id}
          className={`
            w-full bg-white border text-sm text-[#0D0F0D] placeholder-[#8A8B97]
            font-medium py-2.5 rounded-2xl transition-all duration-200
            focus:outline-none focus:ring-2
            ${error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-[#E4E8EE] focus:border-[#9BE5E3] focus:ring-[#9BE5E3]/30'
            }
            ${Icon   ? 'pl-10' : 'pl-3.5'}
            ${IconRight ? 'pr-10' : 'pr-3.5'}
            ${className}
          `}
          {...props}
        />
        {IconRight && (
          <button
            type="button"
            onClick={onClickIconRight}
            className="absolute right-3.5 text-[#8A8B97] hover:text-[#0D0F0D] transition-colors cursor-pointer"
            tabIndex={-1}
          >
            <IconRight className="w-4 h-4" />
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs font-semibold text-rose-500">{error}</p>}
    </div>
  );
};
