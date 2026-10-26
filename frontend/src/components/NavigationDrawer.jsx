import React, { useEffect } from 'react';
import { X, Home, BookOpen, Bookmark, Camera, Clock, Sparkles, Sprout, HelpCircle, MessageSquare, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';
import HerboraEmblem from './HerboraEmblem';

export default function NavigationDrawer({
  isOpen,
  onClose,
  currentPage,
  setCurrentPage,
  currentUser,
  onOpenAuth,
  onOpenProfile,
  onSignOut
}) {
  const { t } = useLanguage();

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
    { id: 'home', label: t('nav.home'), icon: Home, desc: t('nav.homeDesc') },
    { id: 'plantopedia', label: t('nav.plantopedia'), icon: BookOpen, desc: t('nav.plantopediaDesc') },
    { id: 'my-plants', label: t('nav.myPlants'), icon: Bookmark, desc: t('nav.myPlantsDesc') },
    { id: 'identify', label: t('nav.identify'), icon: Camera, desc: t('nav.identifyDesc') },
    { id: 'daily-wellness', label: t('nav.dailyWellness'), icon: Clock, desc: t('nav.dailyWellnessDesc') },
    { id: 'wellness-tips', label: t('nav.wellnessTips'), icon: Sparkles, desc: t('nav.wellnessTipsDesc') },
    { id: 'garden-planner', label: t('nav.gardenPlanner'), icon: Sprout, desc: t('nav.gardenPlannerDesc') },
    { id: 'quiz', label: t('nav.quiz'), icon: HelpCircle, desc: t('nav.quizDesc') },
    { id: 'community', label: t('nav.community'), icon: MessageSquare, desc: t('nav.communityDesc') },
    { id: 'about', label: t('nav.about'), icon: Info, desc: t('nav.aboutDesc') }
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
        className="absolute inset-0 bg-[#113E21]/30 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-out panel */}
      <div 
        className="absolute inset-y-0 left-0 max-w-xs w-full bg-[#FAF6EE] border-r border-[#DDD6C3] shadow-2xl flex flex-col justify-between herbora-rise overscroll-contain"
        style={{ overscrollBehavior: 'contain' }}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#DDD6C3] flex items-center justify-between select-none">
          <div className="flex items-center gap-3">
            <HerboraEmblem 
              className="w-10 h-10" 
              alt="Herbora Official Logo" 
              priority={true}
            />
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#113E21] leading-tight">{t('brand.name')}</h2>
              <p className="text-[10px] tracking-widest text-[#4E8738] uppercase font-semibold">{t('brand.tagline')}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#43634E] hover:bg-[#F0E8D7] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language selector in drawer */}
        <div className="px-4 pt-3 pb-1">
          <LanguageSelector variant="drawer" />
        </div>

        {/* Navigation list */}
        <div 
          className="flex-1 overflow-y-auto py-2 px-3 space-y-1 overscroll-contain"
          style={{ overscrollBehavior: 'contain' }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                  active 
                    ? 'bg-[#E2ECD5] text-[#113E21] font-semibold shadow-xs' 
                    : 'text-[#1C3625] hover:bg-[#F0E8D7]/80'
                }`}
              >
                <div className={`p-2 rounded-lg ${active ? 'bg-[#113E21] text-[#FAF6EE]' : 'bg-white text-[#4E8738] border border-[#DDD6C3]'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium leading-tight">{item.label}</div>
                  {item.desc && (
                    <div className="text-[11px] text-[#43634E] leading-tight mt-0.5">{item.desc}</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Drawer Footer: User Profile */}
        {currentUser && (
          <div className="p-4 border-t border-[#DDD6C3] bg-[#FAF6EE]/80">
            <div 
              className="w-full p-2.5 rounded-xl bg-white border border-[#DDD6C3] flex items-center justify-between cursor-pointer hover:border-[#113E21] hover:bg-[#FAF6EE] transition-all group"
              onClick={() => { onClose(); if (onOpenProfile) onOpenProfile(); }}
              title="View Profile"
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-8 h-8 rounded-full bg-[#113E21] text-[#FAF6EE] flex items-center justify-center font-serif font-bold text-xs shrink-0">
                  {(currentUser.full_name || currentUser.email || 'U')[0].toUpperCase()}
                </div>
                <div className="truncate text-left">
                  <p className="text-[10px] text-[#4E8738] font-semibold uppercase tracking-wider leading-none mb-0.5">{t('nav.signedInAs')}</p>
                  <p className="text-xs font-bold text-[#113E21] truncate">
                    {currentUser.full_name || currentUser.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
