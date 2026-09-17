import React from 'react';

export default function HeroSection() {
  return (
    <section className="relative w-full max-w-[1450px] mx-auto px-4 sm:px-8 lg:px-12 pt-4 pb-6 sm:pt-6 sm:pb-8 lg:py-8 overflow-hidden">
      {/* 1. Subtle, realistic botanical leaves and branches along far-left edge */}
      <div 
        className="absolute -left-3 sm:left-0 top-1/2 -translate-y-1/2 w-28 sm:w-36 lg:w-44 xl:w-48 pointer-events-none select-none z-0 opacity-85"
        aria-hidden="true"
      >
        <img 
          src="/assets/hero_left_leaves_flawless.png" 
          alt="" 
          className="w-full h-auto object-contain pointer-events-none select-none drop-shadow-2xs"
          loading="eager"
        />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-4 items-center">
        
        {/* Left Side: Quote, Headline, and Leaf Divider (50% desktop area) */}
        <div className="lg:col-span-6 flex flex-col justify-center herbora-rise pl-6 sm:pl-10 lg:pl-14">
          {/* Large decorative quotation mark cleanly above text in sage green matching reference */}
          <div className="font-serif text-6xl sm:text-7xl lg:text-[5.25rem] leading-none text-[#8DA56B] select-none font-semibold -mb-2 sm:-mb-3">
            “
          </div>

          {/* Exact Hero Text with preserved 4-line arrangement on desktop */}
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-[2.85rem] xl:text-[3.3rem] font-medium leading-[1.18] tracking-tight text-[#174B2B]">
            Herbora – because<br />
            every herb has a purpose<br />
            and every learner has a<br />
            journey.”
          </h1>

          {/* Decorative design beneath the text: horizontal green lines flanking central leaf */}
          <div className="mt-6 sm:mt-8 flex items-center w-60 sm:w-72">
            <span className="h-[1.5px] flex-1 bg-[#8DA56B]/70" />
            <div className="mx-3 text-[#8DA56B] flex items-center justify-center">
              <svg width="22" height="18" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 18C12 18 10 11 4 9C4 9 10 7 12 1C12 1 14 7 20 9C20 9 14 11 12 18Z" fill="#8DA56B"/>
                <path d="M12 18C12 18 13.5 12.5 19 11C19 11 13.5 9.5 12 4C12 4 10.5 9.5 5 11C5 11 10.5 12.5 12 18Z" fill="#285D36" opacity="0.85"/>
              </svg>
            </div>
            <span className="h-[1.5px] flex-1 bg-[#8DA56B]/70" />
          </div>
        </div>

        {/* Right Side: High-Quality Botanical Ayurvedic Composition with natural blending (50% desktop area) */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end">
          <div className="relative w-full max-w-xl lg:max-w-2xl flex items-center justify-center">
            <img 
              src="/assets/hero_flawless.png" 
              alt="Ayurvedic herbs with stone mortar and pestle, wooden bowl of dried herbs and fresh leaves on warm cream surface" 
              className="w-full h-auto object-contain select-none pointer-events-none"
              loading="eager"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
