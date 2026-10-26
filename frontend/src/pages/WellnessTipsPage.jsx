import React, { useState, useEffect, useMemo } from 'react';
import { Lightbulb, RotateCcw, RotateCw, ShieldCheck, Sparkles, CheckCircle2, AlertCircle, ArrowRight, Layers, Eye, Filter } from 'lucide-react';
import { fetchRemedies, fetchMyths, FALLBACK_REMEDIES, FALLBACK_MYTHS } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const CATEGORY_NAMES_HI = {
  'All': 'सभी नुस्खे',
  'Immunity & Throat': 'रोग प्रतिरोधक व गला',
  'Digestion & Bloating': 'पाचन व गैस',
  'Sleep & Stress': 'निद्रा व तनाव',
  'Cooling & Pitta': 'शीतलता व पित्त',
  'Joint Care & Mobility': 'जोड़ों का दर्द',
  'Hair & Scalp Health': 'केश व स्कैल्प',
  'Metabolism & Blood Sugar': 'मधुमेह व चयापचय',
  'Eye & Gentle Detox': 'नेत्र व डिटॉक्स',
  'Vitality & Hormonal Balance': 'ओजस व जीवन शक्ति'
};

function sampleItems(pool, count = 4, excludeIds = []) {
  if (!Array.isArray(pool) || pool.length === 0) return [];
  const nonExcluded = pool.filter((item) => !excludeIds.includes(item.id));
  if (nonExcluded.length >= count) {
    const shuffled = [...nonExcluded].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, pool.length));
}

export default function WellnessTipsPage() {
  const { t, localizeRemedy, localizeMyth, isHindi } = useLanguage();

  // Full datasets
  const [allRemedies, setAllRemedies] = useState(FALLBACK_REMEDIES);
  const [allMyths, setAllMyths] = useState(FALLBACK_MYTHS);

  // Remedies state
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAllRemedies, setShowAllRemedies] = useState(false);
  const [sampledRemedies, setSampledRemedies] = useState(() => sampleItems(FALLBACK_REMEDIES, 4));
  const [isRefreshingRemedies, setIsRefreshingRemedies] = useState(false);

  // Myths state
  const [showAllMyths, setShowAllMyths] = useState(false);
  const [sampledMyths, setSampledMyths] = useState(() => sampleItems(FALLBACK_MYTHS, 4));
  const [flippedCards, setFlippedCards] = useState({});
  const [isRefreshingMyths, setIsRefreshingMyths] = useState(false);

  useEffect(() => {
    fetchRemedies().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setAllRemedies(data);
        setSampledRemedies(sampleItems(data, 4));
      }
    }).catch(() => {});

    fetchMyths().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setAllMyths(data);
        setSampledMyths(sampleItems(data, 4));
      }
    }).catch(() => {});
  }, []);

  // Compute available categories from all remedies
  const categories = useMemo(() => {
    const cats = Array.from(new Set(allRemedies.map((r) => r.category).filter(Boolean)));
    return ['All', ...cats];
  }, [allRemedies]);

  // Filter pool based on selected category
  const filteredRemediesPool = useMemo(() => {
    if (selectedCategory === 'All') return allRemedies;
    return allRemedies.filter((r) => r.category === selectedCategory);
  }, [allRemedies, selectedCategory]);

  // Determine remedies to display
  const displayedRemedies = useMemo(() => {
    if (showAllRemedies) return filteredRemediesPool;
    if (selectedCategory !== 'All') {
      return filteredRemediesPool.slice(0, 4);
    }
    return sampledRemedies;
  }, [showAllRemedies, selectedCategory, filteredRemediesPool, sampledRemedies]);

  // Determine myths to display
  const displayedMyths = useMemo(() => {
    if (showAllMyths) return allMyths;
    return sampledMyths;
  }, [showAllMyths, allMyths, sampledMyths]);

  // Check if all displayed myths are flipped
  const allDisplayedFlipped = useMemo(() => {
    if (displayedMyths.length === 0) return false;
    return displayedMyths.every((m) => !!flippedCards[m.id]);
  }, [displayedMyths, flippedCards]);

  // Actions
  const handleRefreshRemedies = () => {
    setIsRefreshingRemedies(true);
    const currentIds = displayedRemedies.map((r) => r.id);
    const newBatch = sampleItems(filteredRemediesPool, 4, currentIds);
    setSampledRemedies(newBatch);
    setTimeout(() => setIsRefreshingRemedies(false), 400);
  };

  const handleRefreshMyths = () => {
    setIsRefreshingMyths(true);
    const currentIds = displayedMyths.map((m) => m.id);
    const newBatch = sampleItems(allMyths, 4, currentIds);
    setSampledMyths(newBatch);
    setFlippedCards({});
    setTimeout(() => setIsRefreshingMyths(false), 400);
  };

  const handleToggleFlipAll = () => {
    if (allDisplayedFlipped) {
      setFlippedCards({});
    } else {
      const nextFlipped = {};
      displayedMyths.forEach((m) => {
        nextFlipped[m.id] = true;
      });
      setFlippedCards(nextFlipped);
    }
  };

  const toggleFlip = (id) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="max-w-2xl mb-10 herbora-rise">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#4E8738] mb-2">
          <Lightbulb className="w-4 h-4 text-[#4E8738]" />
          <span>{t('wellnessTips.badge', 'Ayurvedic Wisdom & Practical Remedies')}</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#113E21] leading-tight">
          {t('wellnessTips.title', 'Herbal Wellness Tips')}
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
          {t('wellnessTips.subtitle', 'Time-tested herbal preparations, safe kitchen apothecary traditions, and clear distinctions between popular wellness myths and authentic Ayurvedic principles.')}
        </p>
      </div>

      {/* Featured Card matching Card 3 image */}
      <div className="bg-[#FFFDF8] border border-[#DDD6C3] rounded-3xl p-6 sm:p-8 mb-12 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-8 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#4E8738]">
            {t('wellnessTips.apothecaryBadge', 'Kitchen Apothecary Tip')}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#113E21]">
            {t('wellnessTips.apothecaryTitle', 'Botanical Elixirs & Carriers (Anupana)')}
          </h2>
          <p className="text-sm text-[#1F3D29] leading-relaxed">
            {t('wellnessTips.apothecaryDesc', 'In Ayurvedic pharmacology, herbs are paired with specific delivery vehicles called Anupana—such as warm water, raw honey, milk, or ghee—which guide the herb deep into target bodily tissues (Dhatus) for optimal assimilation.')}
          </p>
        </div>
        <div className="md:col-span-4 flex justify-center">
          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden border border-[#DDD6C3] bg-[#FAF6EE] p-2 flex items-center justify-center shadow-inner">
            <img 
              src="/assets/card3_perfect.png" 
              alt="Herbal elixir bottle with fresh medicinal herbs" 
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/assets/herbal-tips.jpg';
              }}
            />
          </div>
        </div>
      </div>

      {/* Section 1: Practical Home Remedies */}
      <div className="space-y-6 mb-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#113E21] flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-[#4E8738]" />
              <span>{t('wellnessTips.remediesTitle', 'Practical Home Remedies')}</span>
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#E2ECD5] text-[#113E21] border border-[#CAD9B5]">
              {displayedRemedies.length} {t('quiz.of', 'of')} {filteredRemediesPool.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!showAllRemedies && filteredRemediesPool.length > 4 && (
              <button
                type="button"
                onClick={handleRefreshRemedies}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2E6B3B] hover:text-[#113E21] bg-[#F4EFE3] hover:bg-[#EAE2D0] active:scale-95 px-3 py-1.5 rounded-lg border border-[#D5CDBC] transition-all cursor-pointer shadow-2xs"
                title={t('wellnessTips.refreshRemedies', 'Refresh Remedies')}
              >
                <RotateCw className={`w-3.5 h-3.5 transition-transform duration-500 ${isRefreshingRemedies ? 'rotate-180 text-[#113E21]' : ''}`} />
                <span>{t('wellnessTips.refreshRemedies', 'Refresh Remedies')}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowAllRemedies(!showAllRemedies)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#113E21] bg-white hover:bg-[#F2EAD9] active:scale-95 px-3 py-1.5 rounded-lg border border-[#DDD6C3] transition-all cursor-pointer shadow-2xs"
            >
              <Layers className="w-3.5 h-3.5 text-[#4E8738]" />
              <span>
                {showAllRemedies 
                  ? t('wellnessTips.showFeaturedRemedies', 'Show Featured (4)') 
                  : `${t('wellnessTips.viewAllRemedies', 'View All')} (${filteredRemediesPool.length})`}
              </span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          <Filter className="w-3.5 h-3.5 text-[#6C9352] shrink-0 ml-0.5" />
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const label = isHindi ? (CATEGORY_NAMES_HI[cat] || cat) : (cat === 'All' ? t('wellnessTips.allCategories', 'All Remedies') : cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  if (cat === 'All') {
                    setSampledRemedies(sampleItems(allRemedies, 4));
                  }
                }}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#113E21] text-[#FAF7EE] border-[#113E21] font-semibold shadow-xs'
                    : 'bg-[#FFFDF8] text-[#43634E] border-[#DDD6C3] hover:border-[#6C9352] hover:bg-[#F2EAD9]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Remedy Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {displayedRemedies.map((rawRemedy) => {
            const remedy = localizeRemedy(rawRemedy);
            const categoryLabel = isHindi ? (CATEGORY_NAMES_HI[rawRemedy.category] || rawRemedy.category) : rawRemedy.category;
            return (
              <div 
                key={remedy.id}
                className="herbora-card p-6 bg-[#FFFDF8] border border-[#DDD6C3] rounded-2xl flex flex-col justify-between hover:border-[#6C9352] transition-all shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-2 rounded-xl bg-[#FAF6EE] border border-[#EAE4D5] shadow-2xs">
                        {remedy.icon}
                      </span>
                      <div>
                        <h3 className="font-serif text-xl font-bold text-[#113E21]">
                          {remedy.title}
                        </h3>
                        <span className="text-[11px] font-semibold text-[#4E8738] uppercase tracking-wide">
                          {remedy.herb}
                        </span>
                      </div>
                    </div>
                    {categoryLabel && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E2ECD5]/70 text-[#113E21] border border-[#CAD9B5] shrink-0">
                        {categoryLabel}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2.5 text-xs sm:text-sm text-[#1F3D29] leading-relaxed pt-2">
                    <p>
                      <strong className="text-[#113E21]">{t('wellnessTips.preparation', 'Preparation:')}</strong> {remedy.preparation}
                    </p>
                    <p>
                      <strong className="text-[#113E21]">{t('wellnessTips.traditionalBenefit', 'Traditional Benefit:')}</strong> {remedy.benefits}
                    </p>
                  </div>
                </div>

                {remedy.safety && (
                  <div className="mt-4 pt-3 border-t border-[#DDD6C3]/60 text-[11px] text-[#8F3A2B] font-medium flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-[#4E8738]" />
                    <span>{t('wellnessTips.safetyNote', 'Note:')} {remedy.safety}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Myths vs. Facts Interactive Flip Cards */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#113E21] flex items-center gap-2.5">
              <RotateCcw className="w-5 h-5 text-[#4E8738]" />
              <span>{t('wellnessTips.mythsTitle', 'Myths vs. Facts')}</span>
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#E2ECD5] text-[#113E21] border border-[#CAD9B5]">
              {displayedMyths.length} {t('quiz.of', 'of')} {allMyths.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleToggleFlipAll}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1F3D29] bg-white hover:bg-[#F2EAD9] active:scale-95 px-3 py-1.5 rounded-lg border border-[#DDD6C3] transition-all cursor-pointer shadow-2xs"
              title="Flip all cards to read authentic facts"
            >
              <Eye className="w-3.5 h-3.5 text-[#4E8738]" />
              <span>{allDisplayedFlipped ? t('wellnessTips.flipBackMyths', 'Reset to Myths') : t('wellnessTips.flipAllFacts', 'Flip All to Facts')}</span>
            </button>
            {!showAllMyths && allMyths.length > 4 && (
              <button
                type="button"
                onClick={handleRefreshMyths}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2E6B3B] hover:text-[#113E21] bg-[#F4EFE3] hover:bg-[#EAE2D0] active:scale-95 px-3 py-1.5 rounded-lg border border-[#D5CDBC] transition-all cursor-pointer shadow-2xs"
                title={t('wellnessTips.refreshMyths', 'Refresh Myths')}
              >
                <RotateCw className={`w-3.5 h-3.5 transition-transform duration-500 ${isRefreshingMyths ? 'rotate-180 text-[#113E21]' : ''}`} />
                <span>{t('wellnessTips.refreshMyths', 'Refresh Myths')}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowAllMyths(!showAllMyths)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#113E21] bg-white hover:bg-[#F2EAD9] active:scale-95 px-3 py-1.5 rounded-lg border border-[#DDD6C3] transition-all cursor-pointer shadow-2xs"
            >
              <Layers className="w-3.5 h-3.5 text-[#4E8738]" />
              <span>
                {showAllMyths 
                  ? t('wellnessTips.showFeaturedMyths', 'Show Featured (4)') 
                  : `${t('wellnessTips.viewAllMyths', 'View All')} (${allMyths.length})`}
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedMyths.map((rawItem) => {
            const item = localizeMyth(rawItem);
            const isFlipped = !!flippedCards[item.id];
            return (
              <div 
                key={item.id}
                onClick={() => toggleFlip(item.id)}
                className="perspective-1000 h-[280px] sm:h-[250px] cursor-pointer select-none group"
                title={t('wellnessTips.clickToFlip', 'Click to flip card')}
              >
                <div className={`flip-card-inner ${isFlipped ? 'is-flipped' : ''}`}>
                  {/* Front Side: Common Myth */}
                  <div className="flip-card-face bg-[#FFFDF8] border-2 border-[#DDD6C3] p-6 flex flex-col justify-between shadow-xs group-hover:border-[#9E2B25]/50 group-hover:shadow-md transition-all rounded-2xl">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#FDF2F0] text-[#9E2B25] border border-[#F4C7C3] flex items-center gap-1.5 shadow-2xs">
                          <AlertCircle className="w-3 h-3 text-[#C0392B]" />
                          <span>{t('wellnessTips.commonMyth', 'Common Myth')}</span>
                        </span>
                        <span className="text-xs text-[#6C9352] group-hover:text-[#113E21] flex items-center gap-1 font-semibold transition-colors">
                          <RotateCcw className="w-3.5 h-3.5 group-hover:-rotate-90 transition-transform duration-300" />
                          <span>{t('wellnessTips.clickToFlip', 'Click to Flip')}</span>
                        </span>
                      </div>

                      <div className="pt-1">
                        <p className="font-serif text-base sm:text-lg text-[#113E21] leading-snug font-bold">
                          “{item.myth}”
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#DDD6C3]/60 flex items-center justify-between text-[11px] text-[#43634E]">
                      <span className="italic">{t('wellnessTips.discoverReality', 'Click to discover Ayurvedic reality')}</span>
                      <span className="font-semibold text-[#4E8738] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>{t('wellnessTips.revealFact', 'Reveal Fact')}</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>

                  {/* Back Side: Authentic Ayurvedic Fact */}
                  <div className="flip-card-face flip-card-back bg-[#F2F8F3] border-2 border-[#4E8738] p-6 flex flex-col justify-between shadow-md group-hover:border-[#113E21] transition-all rounded-2xl">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#E2ECD5] text-[#113E21] border border-[#BBDDC3] flex items-center gap-1.5 shadow-2xs">
                          <CheckCircle2 className="w-3 h-3 text-[#2E7D42]" />
                          <span>{t('wellnessTips.authenticFact', 'Authentic Fact')}</span>
                        </span>
                        <span className="text-xs text-[#4E8738] group-hover:text-[#113E21] flex items-center gap-1 font-semibold transition-colors">
                          <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-300" />
                          <span>{t('wellnessTips.flipBack', 'Flip Back')}</span>
                        </span>
                      </div>

                      <div className="pt-0.5">
                        <p className="text-xs sm:text-sm text-[#143D22] leading-relaxed font-normal">
                          {item.fact}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#BBDDC3]/60 flex items-center justify-between text-[11px] text-[#1C542E]">
                      <span className="font-medium italic">{t('wellnessTips.classicalPrinciple', 'Classical Ayurvedic Principle')}</span>
                      <span className="font-semibold text-[#113E21] flex items-center gap-1">
                        <span>{t('wellnessTips.rereadMyth', 'Re-read Myth')}</span>
                        <RotateCcw className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
