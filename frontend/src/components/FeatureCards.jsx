import React from 'react';
import { ArrowRight, Sprout, Calendar, Lightbulb } from 'lucide-react';

export default function FeatureCards({ onNavigate }) {
  const cards = [
    {
      id: 'herbal-wellness',
      title: 'Herbal Wellness',
      desc: 'Explore the power of\nnatural herbs for a\nhealthier you.',
      cta: 'Explore Herbs',
      targetPage: 'plantopedia',
      icon: Sprout,
      image: '/assets/card1_trans.png',
      alt: 'Herbal bowl with leaves and pestle'
    },
    {
      id: 'daily-wellness',
      title: 'Daily Wellness',
      desc: 'Simple daily habits\nfor a balanced and\nhealthy lifestyle.',
      cta: 'Read More',
      targetPage: 'daily-wellness',
      icon: Calendar,
      image: '/assets/card2_trans.png',
      alt: 'Glass cup of herbal tea with leaves on wooden saucer'
    },
    {
      id: 'herbal-wellness-tips',
      title: 'Herbal Wellness Tips',
      desc: 'Practical tips and natural\nremedies to support your\nwellness journey.',
      cta: 'Explore Tips',
      targetPage: 'wellness-tips',
      icon: Lightbulb,
      image: '/assets/card3_trans.png',
      alt: 'Herbal elixir dropper bottle with fresh green herbs'
    }
  ];

  return (
    <section className="w-full max-w-[1450px] mx-auto px-4 sm:px-8 lg:px-12 pb-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div 
              key={card.id}
              className="relative overflow-hidden flex flex-col justify-between p-6 sm:p-7 min-h-[265px] bg-[#FAF7EE] border border-[#D2CFBF] rounded-3xl shadow-2xs hover:shadow-md transition-all duration-300 group"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              {/* Top Row: Icon Badge and Title */}
              <div className="relative z-10 flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#E8E0CF]/80 border border-[#8DA56B]/35 flex items-center justify-center text-[#174B2B] shadow-2xs">
                    <Icon className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl sm:text-[1.55rem] font-bold text-[#174B2B] leading-tight">
                      {card.title}
                    </h2>
                    {/* Small leaf ornament below title matching reference */}
                    <div className="flex items-center gap-2 mt-1 text-[#8DA56B]">
                      <span className="w-5 h-[1px] bg-[#8DA56B]/60" />
                      <svg width="14" height="10" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 12C10 12 8 7 3 6C3 6 8 4 10 0C10 0 12 4 17 6C17 6 12 7 10 12Z" fill="#8DA56B"/>
                      </svg>
                      <span className="w-5 h-[1px] bg-[#8DA56B]/60" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle & Bottom: Description and Button on Left */}
              <div className="relative z-10 flex flex-col justify-between mt-4">
                <p className="text-sm sm:text-[0.92rem] text-[#285D36] leading-snug whitespace-pre-line mb-5 font-normal max-w-[190px] sm:max-w-[215px]">
                  {card.desc}
                </p>
                <button
                  onClick={() => onNavigate(card.targetPage)}
                  className="herbora-btn-primary w-fit text-xs sm:text-sm py-2.5 px-5 group cursor-pointer shadow-2xs"
                >
                  <span>{card.cta}</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Right side botanical image naturally resting on cream card surface */}
              <img 
                src={card.image} 
                alt={card.alt}
                className="absolute right-1 bottom-1 sm:right-2 sm:bottom-2 w-36 sm:w-44 lg:w-48 h-32 sm:h-38 object-contain pointer-events-none select-none drop-shadow-2xs z-0"
                loading="lazy"
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
