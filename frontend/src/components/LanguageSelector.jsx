import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSelector({ variant = 'header' }) {
  const { language, setLanguage, isHindi } = useLanguage();

  if (variant === 'drawer') {
    return (
      <div className="p-3 bg-[#FAF6EE] border border-[#DDD6C3] rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#113E21]">
          <Globe className="w-4 h-4 text-[#4E8738]" />
          <span>{isHindi ? 'भाषा चुनें' : 'Language'}</span>
        </div>
        <div className="flex items-center bg-white p-1 rounded-xl border border-[#DDD6C3] text-xs font-bold shadow-3xs">
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              !isHindi
                ? 'bg-[#113E21] text-[#FAF6EE] shadow-2xs'
                : 'text-[#43634E] hover:text-[#113E21]'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              isHindi
                ? 'bg-[#113E21] text-[#FAF6EE] shadow-2xs'
                : 'text-[#43634E] hover:text-[#113E21]'
            }`}
          >
            हिन्दी
          </button>
        </div>
      </div>
    );
  }

  // Header default pill toggle
  return (
    <div 
      className="flex items-center bg-white/95 border border-[#DDD6C3] p-0.5 rounded-xl shadow-3xs"
      title={isHindi ? "भाषा बदलें (Switch Language)" : "Switch Language (भाषा बदलें)"}
    >
      <button
        onClick={() => setLanguage('en')}
        className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
          !isHindi
            ? 'bg-[#113E21] text-[#FAF6EE] shadow-2xs'
            : 'text-[#43634E] hover:text-[#113E21] hover:bg-[#F0E8D7]'
        }`}
        aria-label="Switch to English"
      >
        <span className="hidden sm:inline">English</span>
        <span className="sm:hidden">EN</span>
      </button>
      <button
        onClick={() => setLanguage('hi')}
        className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
          isHindi
            ? 'bg-[#113E21] text-[#FAF6EE] shadow-2xs'
            : 'text-[#43634E] hover:text-[#113E21] hover:bg-[#F0E8D7]'
        }`}
        aria-label="Switch to Hindi"
      >
        <span>हिन्दी</span>
      </button>
    </div>
  );
}
