import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  iconRight: IconRight,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer';

  const variants = {
    // Dark charcoal primary (strong CTA)
    primary:
      'bg-[#0D0F0D] hover:bg-[#22252A] text-white shadow-sd-sm hover:shadow-sd-md',
    // Soft cyan (interactive / join / resolve)
    cyan:
      'bg-[#9BE5E3] hover:bg-[#7ED8D6] text-[#0D0F0D] shadow-sd-sm font-bold',
    // Warm yellow (instructor tool / highlight)
    warm:
      'bg-[#F6E49F] hover:bg-[#EDD377] text-[#0D0F0D] shadow-sd-sm font-bold',
    // Secondary dark
    secondary:
      'bg-[#0D0F0D] hover:bg-[#22252A] text-white shadow-sd-sm',
    // Ghost outline
    outline:
      'border border-[#E4E8EE] bg-white hover:bg-[#F5F7F8] text-[#0D0F0D] shadow-sd-xs',
    // Subtle ghost
    ghost:
      'text-[#3D3F4A] hover:text-[#0D0F0D] hover:bg-black/5',
    // Danger
    danger:
      'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200',
  };

  const sizes = {
    sm:   'text-xs px-3 py-1.5 gap-1.5',
    md:   'text-sm px-4 py-2.5 gap-2',
    lg:   'text-base px-6 py-3.5 gap-2.5 rounded-2.5xl font-bold',
    icon: 'p-2.5 rounded-xl',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {Icon && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
          {children}
          {IconRight && <IconRight className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
        </>
      )}
    </button>
  );
};
