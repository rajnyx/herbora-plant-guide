import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function FeatureCards({ onNavigate }) {
  const { t } = useLanguage();

  const cards = [
    {
      id: 'herbal-wellness',
      title: t('featureCards.card1Title'),
      desc: t('featureCards.card1Desc'),
      cta: t('featureCards.card1Cta'),
      targetPage: 'plantopedia',
      image: '/assets/card1_perfect.png',
      alt: 'Herbal bowl with leaves and pestle',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#113E21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 11a8 8 0 0 0 16 0H4Z" />
          <path d="M12 11V6" />
          <path d="M12 6a3 3 0 0 0-3-3c-1.5 0-3 1.5-3 3 3 0 6 0 6 0Z" fill="#113E21" fillOpacity="0.2" />
          <path d="M12 6a3 3 0 0 1 3-3c1.5 0 3 1.5 3 3-3 0-6 0-6 0Z" fill="#113E21" fillOpacity="0.2" />
        </svg>
      )
    },
    {
      id: 'daily-wellness',
      title: t('featureCards.card2Title'),
      desc: t('featureCards.card2Desc'),
      cta: t('featureCards.card2Cta'),
      targetPage: 'daily-wellness',
      image: '/assets/card2_perfect.png',
      alt: 'Glass cup of herbal tea with leaves on wooden saucer',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#113E21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="16" x="3" y="4" rx="3" />
          <path d="M16 2v4M8 2v4M3 10h18" />
          <circle cx="8" cy="14" r="1" fill="#113E21" />
          <circle cx="12" cy="14" r="1" fill="#113E21" />
          <circle cx="16" cy="14" r="1" fill="#113E21" />
        </svg>
      )
    },
    {
      id: 'herbal-wellness-tips',
      title: t('featureCards.card3Title'),
      desc: t('featureCards.card3Desc'),
      cta: t('featureCards.card3Cta'),
      targetPage: 'wellness-tips',
      image: '/assets/card3_perfect.png',
      alt: 'Herbal elixir dropper bottle with fresh green herbs',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#113E21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
          <path d="M9 18h6M10 22h4" />
          <path d="M12 8a2 2 0 0 0-2 2" />
        </svg>
      )
    }
  ];

  return (
    <section className="w-full max-w-[1450px] mx-auto px-4 sm:px-8 lg:px-12 pt-2 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
        {cards.map((card) => (
          <div 
            key={card.id}
            className="relative overflow-hidden flex flex-col justify-between p-5 sm:p-6 min-h-[235px] bg-[#FAF6EE] border border-[#DDD6C3] rounded-2xl shadow-sm hover:shadow-md hover:border-[#6C9352]/60 transition-all duration-300 group"
          >
            {/* Top Row: Icon Badge and Title */}
            <div className="relative z-10 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#DCE6D2] border border-[#C5D4B6] flex items-center justify-center text-[#113E21] shrink-0 shadow-2xs">
                  {card.icon}
                </div>
                <div>
                  <h2 className="font-serif text-xl sm:text-[1.38rem] font-bold text-[#113E21] leading-tight">
                    {card.title}
                  </h2>
                  {/* Small leaf ornament below title matching reference */}
                  <div className="flex items-center gap-1.5 mt-1 text-[#6C9352]">
                    <span className="w-4 h-[1px] bg-[#6C9352]/70" />
                    <svg width="12" height="10" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 12C10 12 8 7 3 6C3 6 8 4 10 0C10 0 12 4 17 6C17 6 12 7 10 12Z" fill="#6C9352"/>
                    </svg>
                    <span className="w-4 h-[1px] bg-[#6C9352]/70" />
                  </div>
                </div>
              </div>
            </div>

            {/* Middle & Bottom: Description and Button on Left */}
            <div className="relative z-10 flex flex-col justify-between mt-3">
              <p className="text-xs sm:text-[13px] text-[#1F3D29] leading-relaxed whitespace-pre-line mb-4 font-normal max-w-[170px] sm:max-w-[190px]">
                {card.desc}
              </p>
              <button
                onClick={() => onNavigate(card.targetPage)}
                className="w-fit bg-[#113E21] hover:bg-[#1C542E] text-[#FAF6EE] text-xs sm:text-[13px] font-semibold py-2 px-4 rounded-full inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer group"
              >
                <span>{card.cta}</span>
              </button>
            </div>

            {/* Right side botanical image naturally resting on cream card surface */}
            <img 
              src={card.image} 
              alt={card.alt}
              className="absolute right-0 bottom-0 w-36 sm:w-44 h-32 sm:h-38 object-contain pointer-events-none select-none z-0"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
