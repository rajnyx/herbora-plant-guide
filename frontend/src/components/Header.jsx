import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, Camera, User, X, ArrowRight, Leaf } from 'lucide-react';
import { searchPlantsLive } from '../services/api';

export default function Header({ 
  currentUser, 
  onOpenDrawer, 
  onOpenAuth, 
  onOpenIdentify, 
  onSelectPlant,
  setCurrentPage 
}) {
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
    <header className="w-full bg-[#F4F1E5]/95 border-b border-[#D2CFBF] pt-6 pb-4 px-4 sm:px-8 lg:px-12 sticky top-0 z-30 backdrop-blur-md">
      {/* 5.1 Top Brand Header: Centered herbora.com with twin-leaf sprout */}
      <div className="flex flex-col items-center justify-center mb-4">
        <button 
          onClick={() => setCurrentPage('home')}
          className="flex flex-col items-center group transition-transform hover:scale-[1.01] focus:outline-none cursor-pointer"
          title="Herbora Home"
        >
          {/* Twin-leaf accent exactly as in reference */}
          <div className="flex items-center justify-center text-[#285D36] mb-0.5">
            <svg width="24" height="20" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 18C12 18 10 11 4 9C4 9 10 7 12 1C12 1 14 7 20 9C20 9 14 11 12 18Z" fill="#285D36" opacity="0.85"/>
              <path d="M12 18C12 18 13.5 12.5 19 11C19 11 13.5 9.5 12 4C12 4 10.5 9.5 5 11C5 11 10.5 12.5 12 18Z" fill="#8DA56B"/>
            </svg>
          </div>
          <span className="font-serif text-3xl sm:text-4xl lg:text-[2.65rem] font-medium tracking-tight text-[#174B2B] leading-none">
            herbora.com
          </span>
        </button>
      </div>

      {/* 5.2 Main Navigation Bar: Hamburger, Search Input, Camera, Profile */}
      <div className="max-w-[1450px] mx-auto flex items-center gap-3 sm:gap-4">
        {/* Left: Hamburger menu icon */}
        <button
          onClick={onOpenDrawer}
          className="w-12 h-12 shrink-0 flex items-center justify-center rounded-xl bg-[#FAF7EE] border border-[#D2CFBF] text-[#174B2B] hover:bg-[#E8E0CF] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8DA56B] cursor-pointer shadow-2xs"
          aria-label="Open Navigation Menu"
          title="Open Menu"
        >
          <Menu className="w-6 h-6 stroke-[2.2] text-[#174B2B]" />
        </button>

        {/* Center: Wide Search Bar */}
        <div ref={searchRef} className="relative flex-1">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-[#8DA56B] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search herbs, remedies, wellness..."
              className="w-full h-12 pl-12 pr-10 rounded-xl bg-[#FAF7EE] border border-[#D2CFBF] text-[#174B2B] placeholder-[#556B5D]/75 text-sm sm:text-base outline-none focus:border-[#285D36] focus:ring-2 focus:ring-[#8DA56B]/25 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-[#556B5D] hover:text-[#174B2B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Live Search Autocomplete Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#FAF7EE] border border-[#D2CFBF] rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto py-2">
              <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#8DA56B]">
                Matching Herbs & Plants
              </div>
              {searchResults.map((p) => (
                <button
                  key={p.id || p.slug}
                  onClick={() => handleSelectResult(p)}
                  className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-[#E8E0CF]/60 text-left transition-colors cursor-pointer"
                >
                  <div>
                    <span className="font-medium text-[#174B2B] text-sm">{p.common_name}</span>
                    <span className="ml-2 italic text-xs text-[#556B5D]">({p.scientific_name})</span>
                    {p.ayurvedic_name && (
                      <span className="ml-2 inline-block text-[11px] px-2 py-0.5 rounded-full bg-[#D8E1C3] text-[#174B2B]">
                        {p.ayurvedic_name}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#8DA56B] font-medium">{p.category}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right side 1: Photo upload plant identification button */}
        <button
          onClick={onOpenIdentify}
          className="w-12 h-12 shrink-0 flex items-center justify-center rounded-xl bg-[#FAF7EE] border border-[#D2CFBF] text-[#174B2B] hover:bg-[#E8E0CF] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8DA56B] cursor-pointer shadow-2xs"
          aria-label="Identify a Plant via Photo Upload"
          title="Identify a Plant via Photo"
        >
          <Camera className="w-5 h-5 stroke-[2] text-[#174B2B]" />
        </button>

        {/* Right side 2: User Profile button */}
        <button
          onClick={onOpenAuth}
          className={`w-12 h-12 shrink-0 flex items-center justify-center rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-[#8DA56B] cursor-pointer shadow-2xs ${
            currentUser
              ? 'bg-[#285D36] text-[#FAF7EE] border-[#285D36] hover:bg-[#174B2B]'
              : 'bg-[#FAF7EE] border-[#D2CFBF] text-[#174B2B] hover:bg-[#E8E0CF]'
          }`}
          aria-label={currentUser ? `Account: ${currentUser.email}` : "Sign In or Account"}
          title={currentUser ? `Signed in as ${currentUser.email}` : "Sign in / Register"}
        >
          <User className="w-5 h-5 stroke-[2]" />
        </button>
      </div>
    </header>
  );
}
