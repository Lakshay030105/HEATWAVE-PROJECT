import React from 'react';

export function AarogyaEmblem({ size = 36, className = '' }) {
  return (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 border border-orange-500/30 shadow-md shadow-orange-500/20 ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src="/logo-emblem.jpg"
        alt="Aarogya Chhaya Thermal Shield"
        className="w-full h-full object-cover scale-110"
      />
      <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/20 pointer-events-none" />
    </div>
  );
}

export function AarogyaBrand({ showSubtitle = true, size = 'md', className = '' }) {
  const isSm = size === 'sm';
  const emblemSize = isSm ? 30 : 38;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <AarogyaEmblem size={emblemSize} />
      <div className="flex flex-col justify-center min-w-0">
        <span className="font-extrabold tracking-wider text-white text-base leading-tight uppercase font-sans">
          Aarogya <span className="text-teal-400">Chhaya</span>
        </span>
        {showSubtitle && (
          <span className="text-[10px] font-bold text-orange-400/90 tracking-widest uppercase truncate font-mono">
            Data-Driven Mitigation
          </span>
        )}
      </div>
    </div>
  );
}

export default AarogyaBrand;
