import React from 'react';

export default function HeroSection() {
  return (
    <section className="relative w-full max-w-[1450px] mx-auto px-4 sm:px-8 lg:px-12 pt-2 pb-6 sm:pt-4 sm:pb-8 lg:py-4 overflow-hidden">
      {/* Subtle organic left watercolor foliage entering from left screen edge */}
      <div className="absolute left-0 top-0 bottom-0 w-32 sm:w-44 pointer-events-none select-none z-0 opacity-80 sm:opacity-95">
        <img 
          src="/assets/hero_left_seamless.png" 
          alt="" 
          className="h-full w-auto object-contain object-left" 
        />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-2 items-center">
        
        {/* Left Side: Quote, Headline, and Leaf Divider (50% desktop area) */}
        <div className="lg:col-span-6 flex flex-col justify-center herbora-rise pl-4 sm:pl-8 lg:pl-12 pt-2">
          {/* Large decorative quotation mark cleanly above text in sage green matching reference */}
          <div className="font-serif text-5xl sm:text-6xl lg:text-[4.75rem] leading-none text-[#6C9352] select-none font-bold -mb-1 sm:-mb-2">
            “
          </div>

          {/* Exact Hero Text with preserved 4-line arrangement on desktop */}
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-[2.85rem] xl:text-[3.25rem] font-bold leading-[1.18] tracking-tight text-[#113E21]">
            Herbora – because<br />
            every herb has a purpose<br />
            and every learner has a<br />
            journey.”
          </h1>

          {/* Decorative design beneath the text: horizontal green lines flanking central leaf */}
          <div className="mt-5 sm:mt-7 flex items-center w-56 sm:w-68">
            <span className="h-[1.5px] flex-1 bg-[#6C9352]/70" />
            <div className="mx-3 text-[#6C9352] flex items-center justify-center">
              <svg width="22" height="18" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 18C12 18 10 11 4 9C4 9 10 7 12 1C12 1 14 7 20 9C20 9 14 11 12 18Z" fill="#6C9352"/>
                <path d="M12 18C12 18 13.5 12.5 19 11C19 11 13.5 9.5 12 4C12 4 10.5 9.5 5 11C5 11 10.5 12.5 12 18Z" fill="#113E21" opacity="0.85"/>
              </svg>
            </div>
            <span className="h-[1.5px] flex-1 bg-[#6C9352]/70" />
          </div>
        </div>

        {/* Right Side: Seamless Botanical Scene directly resting on warm studio surface */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end">
          <div className="relative w-full max-w-xl lg:max-w-2xl flex items-center justify-center">
            <img 
              src="/assets/hero_right_seamless.png" 
              alt="Ayurvedic herbs with stone mortar and pestle, wooden bowl of dried herbs and fresh leaves on warm studio surface" 
              className="w-full h-auto object-contain select-none pointer-events-none"
              loading="eager"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
