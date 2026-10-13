import React, { useEffect } from 'react';
import { X, User, Mail, Bookmark, LogOut, ArrowRightLeft, Sprout, Calendar, ShieldCheck, ArrowRight, MessageSquare } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function ProfileModal({
  isOpen,
  onClose,
  currentUser,
  savedPlantsCount = 0,
  onNavigate,
  onSignOut,
  onSwitchAccount
}) {
  const { t, isHindi } = useLanguage();
  // Lock background scroll when profile modal is open
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

  if (!isOpen || !currentUser) return null;

  const displayName = currentUser.full_name || currentUser.email.split('@')[0];
  const initial = displayName[0]?.toUpperCase() || 'U';
  
  // Format member date if available
  const memberSince = currentUser.created_at 
    ? new Date(currentUser.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })
    : '2026';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-[#174B2B]/40 backdrop-blur-xs transition-opacity" 
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-[#FAF7EE] border border-[#D2CFBF] rounded-3xl shadow-2xl p-6 sm:p-8 herbora-rise z-10 overflow-hidden">
        
        {/* Subtle decorative leaf watermark in background */}
        <div className="absolute -top-10 -right-10 w-40 h-40 opacity-5 pointer-events-none text-[#174B2B]">
          <svg viewBox="0 0 24 20" fill="currentColor">
            <path d="M12 18C12 18 10 11 4 9C4 9 10 7 12 1C12 1 14 7 20 9C20 9 14 11 12 18Z" />
          </svg>
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-xl flex items-center justify-center text-[#556B5D] hover:bg-[#E8E0CF] transition-colors cursor-pointer"
          title="Close Profile"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header & User Identity */}
        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-full bg-[#174B2B] text-[#FAF7EE] border-3 border-[#8DA56B] flex items-center justify-center text-3xl font-serif font-bold shadow-md select-none">
              {initial}
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#8DA56B] border-2 border-[#FAF7EE] flex items-center justify-center text-white" title="Active Account">
              <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#174B2B] leading-tight">
            {displayName}
          </h2>
          <p className="text-xs sm:text-sm text-[#556B5D] mt-0.5 flex items-center gap-1.5 font-normal">
            <Mail className="w-3.5 h-3.5 text-[#8DA56B]" />
            <span>{currentUser.email}</span>
          </p>

          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D8E1C3] text-[#174B2B] text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#285D36]" />
            <span>{isHindi ? `हर्बोरा सदस्य • ${memberSince} से` : `Herbora Member • Since ${memberSince}`}</span>
          </div>
        </div>

        {/* Quick Collection Overview */}
        <div className="space-y-2 mb-5">
          <div className="bg-[#FFFFFF] border border-[#D2CFBF] rounded-2xl p-3.5 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E8E0CF]/80 border border-[#8DA56B]/30 flex items-center justify-center text-[#174B2B]">
                <Bookmark className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#8DA56B] uppercase tracking-wider">{t('nav.myPlants', 'My Plant DB')}</p>
                <p className="text-xs sm:text-sm font-bold text-[#174B2B]">
                  {savedPlantsCount} {isHindi ? 'पौधे सहेजे गए' : (savedPlantsCount === 1 ? 'Plant Saved' : 'Plants Saved')}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onNavigate('my-plants');
              }}
              className="text-xs font-semibold text-[#285D36] hover:text-[#174B2B] flex items-center gap-1 py-1.5 px-2.5 rounded-lg hover:bg-[#E8E0CF]/50 transition-colors cursor-pointer"
            >
              <span>{t('profile.viewCollection', 'View DB')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-[#FFFFFF] border border-[#D2CFBF] rounded-2xl p-3.5 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E8E0CF]/80 border border-[#8DA56B]/30 flex items-center justify-center text-[#174B2B]">
                <MessageSquare className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#8DA56B] uppercase tracking-wider">{t('nav.community', 'Community Posts')}</p>
                <p className="text-xs sm:text-sm font-bold text-[#174B2B]">
                  {isHindi ? 'अपने अनुभव प्रबंधित करें' : 'Manage Your Stories'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onNavigate('community');
              }}
              className="text-xs font-semibold text-[#285D36] hover:text-[#174B2B] flex items-center gap-1 py-1.5 px-2.5 rounded-lg hover:bg-[#E8E0CF]/50 transition-colors cursor-pointer"
            >
              <span>{isHindi ? 'देखें' : 'View'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Account Options & Actions */}
        <div className="space-y-2.5">
          {/* Switch Account */}
          <button
            onClick={() => {
              onClose();
              onSwitchAccount();
            }}
            className="w-full py-3 px-4 rounded-xl bg-[#FAF7EE] border border-[#D2CFBF] hover:bg-[#E8E0CF] text-[#174B2B] font-medium text-sm flex items-center justify-between transition-all group cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-2.5">
              <ArrowRightLeft className="w-4 h-4 text-[#8DA56B] group-hover:rotate-180 transition-transform duration-300" />
              <span>{t('profile.switchAccount', 'Log in to another account')}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-[#8DA56B] group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Sign Out */}
          <button
            onClick={() => {
              onClose();
              onSignOut();
            }}
            className="w-full py-3 px-4 rounded-xl bg-[#FFF9F9] border border-[#F5C2BC] hover:bg-[#FDF2F0] text-[#9E2B25] font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('profile.signOut', 'Sign Out')}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
