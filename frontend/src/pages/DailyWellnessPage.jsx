import React, { useState, useEffect } from 'react';
import { Clock, Sun, Moon, Utensils, Heart, ShieldAlert, Sparkles } from 'lucide-react';
import { fetchDincharya } from '../services/api';

export default function DailyWellnessPage() {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDincharya()
      .then(setTimeline)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="max-w-2xl mb-10 herbora-rise">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#4E8738] mb-2">
          <Clock className="w-4 h-4 text-[#4E8738]" />
          <span>Classical Ayurvedic Circadian Rhythm</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#113E21] leading-tight">
          Daily Wellness (Dincharya)
        </h1>
        {/* Leaf divider */}
        <div className="flex items-center gap-2 mt-2 mb-3 text-[#6C9352]">
          <span className="w-8 h-[1.5px] bg-[#6C9352]/70" />
          <svg width="14" height="12" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 12C10 12 8 7 3 6C3 6 8 4 10 0C10 0 12 4 17 6C17 6 12 7 10 12Z" fill="#6C9352"/>
          </svg>
          <span className="w-8 h-[1.5px] bg-[#6C9352]/70" />
        </div>
        <p className="text-sm sm:text-base text-[#43634E] leading-relaxed">
          In Ayurveda, “Dincharya” (daily regimen) aligns our bodily doshas with the natural clock of the sun and seasons, fostering natural vitality, digestion, and restorative sleep.
        </p>
      </div>

      {/* Featured Tea Card matching reference Card 2 image */}
      <div className="bg-[#FFFDF8] border border-[#DDD6C3] rounded-3xl p-6 sm:p-8 mb-12 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-8 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#4E8738]">Daily Morning Ritual</span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#113E21]">
            Ushapan & Herbal Tea Infusion
          </h2>
          <p className="text-sm text-[#1F3D29] leading-relaxed">
            Begin the morning with lukewarm water or a gentle herbal tea of fresh holy basil and crushed ginger to gently kindle Agni (digestive fire) and flush overnight metabolites (Ama).
          </p>
        </div>
        <div className="md:col-span-4 flex justify-center">
          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden border border-[#DDD6C3] bg-[#FAF6EE] p-2 flex items-center justify-center shadow-inner">
            <img 
              src="/assets/card2_perfect.png" 
              alt="Herbal tea infusion on wooden saucer" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* Dincharya Timeline Cards */}
      <div className="space-y-6">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#113E21] flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-[#4E8738]" />
          <span>The Circadian Routine Timeline</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {timeline.map((step, idx) => (
            <div 
              key={idx}
              className="herbora-card p-6 bg-[#FFFDF8] border border-[#DDD6C3] rounded-2xl flex flex-col justify-between hover:border-[#6C9352] transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{step.icon}</span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E2ECD5] text-[#113E21]">
                    {step.time}
                  </span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#113E21]">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#1F3D29] leading-relaxed mt-2.5">
                  {step.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Notice */}
      <div className="mt-10 p-4 rounded-2xl bg-[#F5EFE0] border border-[#DDD6C3] text-xs text-[#43634E] flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-[#4E8738] shrink-0 mt-0.5" />
        <p>
          Dincharya guidelines are traditional wellness practices and lifestyle philosophies. They are not intended as medical prescriptions or substitutions for clinical medical care.
        </p>
      </div>
    </div>
  );
}
