import React, { useState } from 'react';
import herboraEmblem from '../assets/herbora-emblem.png';
import herboraLogoClean from '../assets/herbora-logo-clean.png';
import herboraLogo from '../assets/herbora-logo.png';

/**
 * HerboraEmblem - Bulletproof official logo emblem
 * Automatically tries multiple bundled and public asset paths with graceful SVG fallback.
 */
export default function HerboraEmblem({ 
  className = "w-10 h-10", 
  imgClassName = "w-full h-full object-contain",
  alt = "Herbora Official Logo",
  showBorder = true,
  priority = false
}) {
  const [srcIndex, setSrcIndex] = useState(0);

  const sources = [
    herboraEmblem,
    '/assets/herbora-emblem.png',
    herboraLogoClean,
    '/assets/herbora-logo-clean.png',
    herboraLogo,
    '/assets/herbora-logo.png'
  ];

  const handleImgError = () => {
    setSrcIndex((prev) => prev + 1);
  };

  const hasFailedAll = srcIndex >= sources.length;

  return (
    <div 
      className={`${className} ${
        showBorder ? 'rounded-full border border-[#DDD6C3] bg-white/95 p-0.5 shadow-xs' : ''
      } flex items-center justify-center shrink-0 overflow-hidden select-none transition-transform`}
    >
      {!hasFailedAll ? (
        <img
          src={sources[srcIndex]}
          alt={alt}
          className={`${imgClassName} rounded-full`}
          onError={handleImgError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-[#113E21] flex items-center justify-center text-[#DDE5C9] shadow-inner p-1">
          <svg viewBox="0 0 32 32" className="w-full h-full fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Ayurvedic Mortar & Pestle with Sprouting Leaf */}
            <path d="M7 16c0 5 4 9 9 9s9-4 9-9H7z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" />
            <path d="M5 16h22" stroke="currentColor" />
            <path d="M12 25v3h8v-3" stroke="currentColor" />
            <path d="M20 7l-6 9" stroke="currentColor" strokeWidth="2.5" />
            <path d="M16 6c-2 0-4 2-4 5 3 0 5-2 5-5z" fill="#8DA56B" stroke="#8DA56B" />
            <path d="M18 4c0 3 2 5 5 5 0-3-2-5-5-5z" fill="#4E8738" stroke="#4E8738" />
          </svg>
        </div>
      )}
    </div>
  );
}
