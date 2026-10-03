import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, Camera, User, X, ArrowRight, Leaf } from 'lucide-react';
import { searchPlantsLive } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';

export default function Header({ 
  currentUser, 
  onOpenDrawer, 
  onOpenAuth, 
  onOpenProfile,
  onOpenIdentify, 
  onSelectPlant,
  setCurrentPage 
}) {
  const { t, localizePlant, localizeCategory } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);

  // Debounced live search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchPlantsLive(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close search dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchResults([]);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectResult = (plant) => {
    setSearchQuery('');
    setSearchResults([]);
    if (onSelectPlant) onSelectPlant(plant);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCurrentPage('plantopedia', { search: searchQuery });
      setSearchResults([]);
    }
  };

  return (
    <header className="w-full bg-[#FAF6EE]/85 backdrop-blur-md pt-5 pb-3 px-4 sm:px-8 lg:px-12 sticky top-0 z-30">
      {/* 5.1 Top Brand Header: Centered herbora.com with twin-leaf sprout */}
      <div className="flex flex-col items-center justify-center mb-3">
        <button 
          onClick={() => setCurrentPage('home')}
          className="flex flex-col items-center group transition-transform hover:scale-[1.01] focus:outline-none cursor-pointer"
          title="Herbora Home"
        >
          {/* Twin-leaf accent centered exactly as in reference */}
          <div className="flex items-center justify-center text-[#6C9352] mb-0.5">
            <svg width="24" height="18" viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 16C12 16 10 9 4 7C4 7 10 5 12 0C12 0 14 5 20 7C20 7 14 9 12 16Z" fill="#6C9352"/>
              <path d="M12 16C12 16 13.5 11 19 9.5C19 9.5 13.5 8 12 3C12 3 10.5 8 5 9.5C5 9.5 10.5 11 12 16Z" fill="#113E21" opacity="0.8"/>
            </svg>
          </div>
          <span className="font-serif text-3xl sm:text-4xl lg:text-[2.65rem] font-bold tracking-tight text-[#113E21] leading-none">
            {t('brand.domain')}
          </span>
        </button>
      </div>

      {/* 5.2 Unified Main Navigation Bar Container matching reference */}
      <div className="max-w-[1450px] mx-auto bg-[#FAF6EE]/95 border border-[#DDD6C3] rounded-2xl px-3 sm:px-4 py-2 flex items-center gap-2 sm:gap-3.5 shadow-sm backdrop-blur-sm">
        {/* Left: Hamburger menu icon */}
        <button
          onClick={onOpenDrawer}
          className="p-2 sm:p-2.5 text-[#113E21] hover:bg-[#F0E8D7] rounded-xl transition-colors cursor-pointer flex items-center justify-center"
          aria-label="Open Navigation Menu"
          title="Open Menu"
        >
          <Menu className="w-6 h-6 stroke-[2.2] text-[#113E21]" />
        </button>

        {/* Center: Inner Search Box */}
        <div ref={searchRef} className="relative flex-1">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <div className="w-full h-11 rounded-xl bg-white/95 border border-[#DDD6C3] flex items-center px-3.5 focus-within:border-[#113E21] focus-within:bg-white transition-all shadow-3xs">
              <Search className="w-4.5 h-4.5 text-[#4E8738] shrink-0 mr-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('nav.searchPlaceholder')}
                className="w-full bg-transparent text-sm sm:text-base text-[#113E21] placeholder-[#43634E]/70 outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-[#43634E] hover:text-[#113E21] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>

          {/* Live Search Autocomplete Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#FFFDF8] border border-[#DDD6C3] rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto py-2">
              <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#4E8738]">
                {t('nav.matchingHerbs')}
              </div>
              {searchResults.map((rawP) => {
                const p = localizePlant(rawP);
                return (
                  <button
                    key={p.id || p.slug}
                    onClick={() => handleSelectResult(p)}
                    className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-[#F4ECE0] text-left transition-colors cursor-pointer"
                  >
                    <div>
                      <span className="font-medium text-[#113E21] text-sm">{p.common_name}</span>
                      <span className="ml-2 italic text-xs text-[#43634E]">({p.scientific_name})</span>
                      {p.ayurvedic_name && (
                        <span className="ml-2 inline-block text-[11px] px-2 py-0.5 rounded-full bg-[#E2ECD5] text-[#113E21] font-medium">
                          {p.ayurvedic_name}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#4E8738] font-medium">{localizeCategory(p.category)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right side 1: Language Switcher */}
        <LanguageSelector variant="header" />

        {/* Right side 2: Camera button for visual plant identification */}
        <button
          onClick={onOpenIdentify}
          className="p-2 sm:p-2.5 text-[#113E21] hover:bg-[#F0E8D7] rounded-xl transition-colors cursor-pointer flex items-center justify-center shrink-0"
          aria-label={t('nav.identifyPhoto')}
          title={t('nav.identifyPhoto')}
        >
          <Camera className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2] text-[#113E21]" />
        </button>

        {/* Right side 3: Profile button */}
        <button
          onClick={currentUser ? onOpenProfile : onOpenAuth}
          className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full border-2 border-[#113E21] flex items-center justify-center text-[#113E21] hover:bg-[#F0E8D7] transition-colors cursor-pointer shadow-3xs"
          aria-label={currentUser ? `Profile: ${currentUser.email}` : t('nav.signIn')}
          title={currentUser ? `${t('nav.signedInAs')} ${currentUser.full_name || currentUser.email}` : t('nav.signIn')}
        >
          {currentUser ? (
            <span className="font-serif font-bold text-sm select-none">
              {(currentUser.full_name || currentUser.email || 'U')[0].toUpperCase()}
            </span>
          ) : (
            <User className="w-5 h-5 stroke-[2] text-[#113E21]" />
          )}
        </button>
      </div>
    </header>
  );
}
