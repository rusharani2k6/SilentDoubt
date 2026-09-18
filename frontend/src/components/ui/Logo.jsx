import React from 'react';
import { Link } from 'react-router-dom';

/**
 * SD Monogram Logo
 * Renders the "SD" brand mark at various sizes.
 *
 * Props:
 *   size   — 'xs' | 'sm' | 'md' | 'lg' | 'xl'  (default: 'md')
 *   wordmark — whether to show the text "SD" + subtitle next to the monogram (default: true)
 *   subtitle — subtitle string (default: 'Classroom AI')
 *   href   — if provided wraps everything in a <Link>
 *   className — extra classes on wrapper
 */
export const Logo = ({
  size = 'md',
  wordmark = true,
  subtitle = 'Classroom AI',
  href = '/',
  className = '',
}) => {
  const sizeCfg = {
    xs:  { mark: 'w-6 h-6 rounded-lg text-[11px]',          text: 'text-sm',  sub: 'text-[8px]'  },
    sm:  { mark: 'w-7 h-7 rounded-[10px] text-[13px]',      text: 'text-base',sub: 'text-[9px]'  },
    md:  { mark: 'w-9 h-9 rounded-xl text-base',            text: 'text-lg',  sub: 'text-[10px]' },
    lg:  { mark: 'w-11 h-11 rounded-2xl text-xl',           text: 'text-xl',  sub: 'text-[11px]' },
    xl:  { mark: 'w-16 h-16 rounded-3xl text-3xl',          text: 'text-3xl', sub: 'text-xs'     },
  };

  const cfg = sizeCfg[size] || sizeCfg.md;

  const content = (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      {/* Monogram Mark */}
      <div
        className={`
          ${cfg.mark}
          flex items-center justify-center flex-shrink-0
          font-extrabold tracking-tighter
          text-[#0D0F0D]
          relative overflow-hidden
          transition-transform duration-200 group-hover:scale-105
        `}
        style={{
          background: 'linear-gradient(135deg, #F6E49F 0%, #c8e8e7 100%)',
          boxShadow: '0 2px 8px rgba(155,229,227,0.30), 0 1px 3px rgba(246,228,159,0.25)',
        }}
      >
        {/* Subtle inner top-left yellow glow */}
        <span
          className="absolute top-0 left-0 w-3 h-3 rounded-full opacity-60"
          style={{ background: '#F6E49F', filter: 'blur(6px)' }}
        />
        {/* Subtle bottom-right cyan glow */}
        <span
          className="absolute bottom-0 right-0 w-3 h-3 rounded-full opacity-50"
          style={{ background: '#9BE5E3', filter: 'blur(6px)' }}
        />
        <span className="relative z-10 leading-none">SD</span>
      </div>

      {/* Wordmark */}
      {wordmark && (
        <div className="flex flex-col leading-none">
          <span className={`font-extrabold tracking-tight text-[#0D0F0D] ${cfg.text}`}>
            SD
          </span>
          {subtitle && (
            <span className={`font-semibold text-[#8A8B97] uppercase tracking-widest ${cfg.sub}`}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (!href) return content;

  return (
    <Link to={href} className="no-underline">
      {content}
    </Link>
  );
};
