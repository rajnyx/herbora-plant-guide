import React, { useState, useEffect } from 'react';
import { Lightbulb, RotateCcw, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { fetchRemedies, fetchMyths } from '../services/api';

export default function WellnessTipsPage() {
  const [remedies, setRemedies] = useState([]);
  const [myths, setMyths] = useState([]);
  const [flippedCards, setFlippedCards] = useState({});

  useEffect(() => {
    fetchRemedies().then(setRemedies).catch(() => {});
    fetchMyths().then(setMyths).catch(() => {});
  }, []);

  const toggleFlip = (id) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="max-w-2xl mb-10 herbora-rise">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#8DA56B] mb-2">
          <Lightbulb className="w-4 h-4" />
          <span>Ayurvedic Wisdom & Practical Remedies</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#174B2B] leading-tight">
          Herbal Wellness Tips
        </h1>
        <p className="text-sm sm:text-base text-[#556B5D] mt-2 leading-relaxed">
          Time-tested herbal preparations, safe kitchen apothecary traditions, and clear distinctions between popular wellness myths and authentic Ayurvedic principles.
        </p>
      </div>

      {/* Featured Card matching Card 3 image */}
      <div className="bg-[#FAF8F2] border border-[#E2DDD0] rounded-3xl p-6 sm:p-8 mb-12 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-8 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#8DA56B]">Kitchen Apothecary Tip</span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#174B2B]">
            Botanical Elixirs & Carriers (Anupana)
          </h2>
          <p className="text-sm text-[#3B4E41] leading-relaxed">
            In Ayurvedic pharmacology, herbs are paired with specific delivery vehicles called <em>Anupana</em>—such as warm water, raw honey, milk, or ghee—which guide the herb deep into target bodily tissues (Dhatus) for optimal assimilation.
          </p>
        </div>
        <div className="md:col-span-4 flex justify-center">
          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden border border-[#E2DDD0] bg-white shadow-inner">
            <img 
              src="/assets/herbal-tips.jpg" 
              alt="Herbal elixir bottle with fresh medicinal herbs" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Section 1: Practical Home Remedies */}
      <div className="space-y-6 mb-14">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#174B2B] flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-[#8DA56B]" />
          <span>Practical Home Remedies</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {remedies.map((remedy) => (
            <div 
              key={remedy.id}
              className="herbora-card p-6 bg-[#FAF8F2] border border-[#E2DDD0] rounded-2xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{remedy.icon}</span>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#174B2B]">
                      {remedy.title}
                    </h3>
                    <span className="text-[11px] font-semibold text-[#8DA56B] uppercase tracking-wide">
                      {remedy.herb}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs sm:text-sm text-[#3B4E41] leading-relaxed pt-2">
                  <p><strong className="text-[#174B2B]">Preparation:</strong> {remedy.preparation}</p>
                  <p><strong className="text-[#174B2B]">Traditional Benefit:</strong> {remedy.benefits}</p>
                </div>
              </div>

              {remedy.safety && (
                <div className="mt-4 pt-3 border-t border-[#EAE6DC] text-[11px] text-[#8F3A2B] font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-[#8DA56B]" />
                  <span>Note: {remedy.safety}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Myths vs. Facts Interactive Flip Cards */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#174B2B] flex items-center gap-2.5">
            <RotateCcw className="w-5 h-5 text-[#8DA56B]" />
            <span>Myths vs. Facts (Click Card to Flip)</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {myths.map((item) => {
            const isFlipped = flippedCards[item.id];
            return (
              <div 
                key={item.id}
                onClick={() => toggleFlip(item.id)}
                className="cursor-pointer min-h-[200px] p-6 rounded-2xl border transition-all duration-300 relative flex flex-col justify-between select-none shadow-xs hover:shadow-md"
                style={{
                  backgroundColor: isFlipped ? '#F0F7F2' : '#FAF8F2',
                  borderColor: isFlipped ? '#8DA56B' : '#E2DDD0'
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      isFlipped ? 'bg-[#DDE5C9] text-[#174B2B]' : 'bg-[#FDF2F0] text-[#9E2B25]'
                    }`}>
                      {isFlipped ? 'Authentic Fact' : 'Common Myth'}
                    </span>
                    <span className="text-xs text-[#8DA56B] flex items-center gap-1">
                      <RotateCcw className="w-3 h-3" />
                      <span>Flip</span>
                    </span>
                  </div>

                  <p className="text-sm sm:text-base text-[#174B2B] leading-relaxed pt-2 font-medium">
                    {isFlipped ? item.fact : item.myth}
                  </p>
                </div>

                <p className="text-[11px] text-[#637869] italic pt-4">
                  {isFlipped ? 'Click again to re-read myth' : 'Click to discover the classical Ayurvedic reality'}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
