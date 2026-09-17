import React, { useEffect } from 'react';
import { X, Home, BookOpen, Bookmark, Camera, Clock, Sparkles, Sprout, HelpCircle, MessageSquare, Info, LogOut, LogIn } from 'lucide-react';

export default function NavigationDrawer({
  isOpen,
  onClose,
  currentPage,
  setCurrentPage,
  currentUser,
  onOpenAuth,
  onSignOut
}) {
  // Prevent background and home screen scrolling while the menu drawer is open
  useEffect(() => {
    if (!isOpen) return;

    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, desc: 'Ayurvedic Discovery Home' },
    { id: 'plantopedia', label: 'Plantopedia', icon: BookOpen, desc: 'Ayurvedic Plant Database' },
    { id: 'my-plants', label: 'My Plant DB', icon: Bookmark, desc: 'Personal Saved Plants' },
    { id: 'identify', label: 'Identify a Plant', icon: Camera, desc: 'AI Botanical Vision' },
    { id: 'daily-wellness', label: 'Daily Wellness (Dincharya)', icon: Clock, desc: 'Circadian Routine' },
    { id: 'wellness-tips', label: 'Herbal Remedies & Tips', icon: Sparkles, desc: 'Home Remedies & Myths' },
    { id: 'garden-planner', label: 'Home Garden Planner', icon: Sprout, desc: 'Watering & Care Tracker' },
    { id: 'quiz', label: 'Ayurvedic Quiz', icon: HelpCircle, desc: 'Test Botanical Knowledge' },
    { id: 'community', label: 'Community Stories', icon: MessageSquare, desc: 'Herb Grower Notes' },
    { id: 'about', label: 'About Herbora', icon: Info, desc: 'Mission & Health Disclaimer' }
  ];

  const handleNavigate = (pageId) => {
    setCurrentPage(pageId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden overscroll-contain">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-[#174B2B]/30 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-out panel */}
      <div 
        className="absolute inset-y-0 left-0 max-w-xs w-full bg-[#FAF7EE] border-r border-[#D2CFBF] shadow-2xl flex flex-col justify-between herbora-rise overscroll-contain"
        style={{ overscrollBehavior: 'contain' }}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#D2CFBF] flex items-center justify-between select-none">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/herbora-logo.png" 
              alt="Herbora Logo" 
              className="w-10 h-10 object-contain rounded-full border border-[#D2CFBF]"
            />
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#174B2B] leading-tight">Herbora</h2>
              <p className="text-[10px] tracking-widest text-[#8DA56B] uppercase font-semibold">Ancient Wisdom • Modern Discovery</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#556B5D] hover:bg-[#E8E0CF] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div 
          className="flex-1 overflow-y-auto py-3 px-3 space-y-1 overscroll-contain"
          style={{ overscrollBehavior: 'contain' }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-left transition-all ${
                  active 
                    ? 'bg-[#D8E1C3] text-[#174B2B] font-semibold shadow-xs' 
                    : 'text-[#2D3E33] hover:bg-[#E8E0CF]/70'
                }`}
              >
                <div className={`p-2 rounded-lg ${active ? 'bg-[#174B2B] text-[#FAF7EE]' : 'bg-[#FAF7EE] text-[#285D36] border border-[#D2CFBF]'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium leading-tight">{item.label}</div>
                  {item.desc && (
                    <div className="text-[11px] text-[#637869] leading-tight mt-0.5">{item.desc}</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Drawer Footer: User Profile / Auth State */}
        <div className="p-4 border-t border-[#D2CFBF] bg-[#E8E0CF]/40">
          {currentUser ? (
            <div className="flex items-center justify-between">
              <div className="truncate pr-2">
                <p className="text-xs text-[#637869]">Signed in as</p>
                <p className="text-xs font-semibold text-[#174B2B] truncate">{currentUser.email}</p>
              </div>
              <button
                onClick={() => { onSignOut(); onClose(); }}
                className="flex items-center gap-1 text-xs font-medium text-[#8F3A2B] hover:underline px-2 py-1 rounded"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Exit</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => { onClose(); onOpenAuth(); }}
              className="w-full py-2.5 px-4 bg-[#174B2B] hover:bg-[#285D36] text-[#FAF7EE] rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In to Save Plants</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
