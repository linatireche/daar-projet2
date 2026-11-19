import React from 'react';

export default function SorbonneLogo({ className = "h-11", showText = true }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo officiel Sorbonne Université fourni */}
      <img
        src="/sorbonne-logo.png"
        alt="Logo Sorbonne Université"
        className="h-10 sm:h-12 w-auto object-contain rounded-lg shadow-xs hover:scale-105 transition-transform"
        onError={(e) => {
          // Fallback au SVG vectoriel stylisé en cas de besoin
          e.target.style.display = 'none';
        }}
      />

      {showText && (
        <div className="flex flex-col border-l border-rose-200/80 pl-3">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-cinzel text-base md:text-lg font-bold tracking-wider text-slate-900">
              SORBONNE
            </span>
            <span className="font-cinzel text-base md:text-lg font-bold tracking-wider text-rose-700">
              UNIVERSITÉ
            </span>
          </div>
          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-medium mt-1">
            Créateurs de futurs depuis 1257
          </span>
        </div>
      )}
    </div>
  );
}
