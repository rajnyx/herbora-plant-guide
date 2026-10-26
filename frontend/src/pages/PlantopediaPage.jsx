import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Bookmark, BookmarkCheck, ArrowRight, Sprout, AlertCircle } from 'lucide-react';
import { fetchPlants, FALLBACK_PLANTS } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function PlantopediaPage({ 
  initialSearch = '', 
  onSelectPlant, 
  savedPlantIds, 
  onSavePlant 
}) {
  const { t, localizePlant, localizeCategory, isHindi } = useLanguage();
  const [plants, setPlants] = useState(FALLBACK_PLANTS);
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'All',
    'Immunity',
    'Adaptogens',
    'Skin Care',
    'Stress Relief',
    'Heart Health',
    'Digestion',
    'Diabetes'
  ];

  useEffect(() => {
    if (initialSearch !== undefined) {
      setSearch(initialSearch);
    }
  }, [initialSearch]);

  const loadData = async () => {
    try {
      const data = await fetchPlants('All', '');
      if (Array.isArray(data) && data.length > 0) {
        setPlants(data);
      }
    } catch {
      // Keep canonical FALLBACK_PLANTS
    }
  };

  useEffect(() => {
    loadData();
  }, [isHindi]);

  const filteredPlants = useMemo(() => {
    if (!Array.isArray(plants)) return [];
    const q = (search || '').trim().toLowerCase();

    return plants.map((p) => localizePlant(p)).filter((p) => {
      if (!p) return false;
      const matchCat = 
        category === 'All' || 
        p.category === category || 
        p.category === localizeCategory(category);

      if (!matchCat) return false;
      if (!q) return true;

      const commonName = (p.common_name || '').toLowerCase();
      const sciName = (p.scientific_name || '').toLowerCase();
      const ayurName = (p.ayurvedic_name || '').toLowerCase();
      const engName = (p.english_name || '').toLowerCase();
      const slug = (p.slug || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      const uses = (p.traditional_uses || '').toLowerCase();
      const virya = (p.virya || '').toLowerCase();
      const vipaka = (p.vipaka || '').toLowerCase();

      const regionalMatch = Array.isArray(p.regional_names)
        ? p.regional_names.some((rn) => typeof rn === 'string' && rn.toLowerCase().includes(q))
        : false;

      const synonymsMatch = Array.isArray(p.sanskrit_synonyms)
        ? p.sanskrit_synonyms.some((sn) => typeof sn === 'string' && sn.toLowerCase().includes(q))
        : false;

      const indicationsMatch = Array.isArray(p.main_indications)
        ? p.main_indications.some((ind) => typeof ind === 'string' && ind.toLowerCase().includes(q))
        : false;

      const rasaMatch = Array.isArray(p.rasa)
        ? p.rasa.some((r) => typeof r === 'string' && r.toLowerCase().includes(q))
        : false;

      const prabhavMatch = Array.isArray(p.prabhav)
        ? p.prabhav.some((pr) => typeof pr === 'string' && pr.toLowerCase().includes(q))
        : false;

      return (
        commonName.includes(q) ||
        sciName.includes(q) ||
        ayurName.includes(q) ||
        engName.includes(q) ||
        slug.includes(q) ||
        cat.includes(q) ||
        desc.includes(q) ||
        uses.includes(q) ||
        virya.includes(q) ||
        vipaka.includes(q) ||
        regionalMatch ||
        synonymsMatch ||
        indicationsMatch ||
        rasaMatch ||
        prabhavMatch
      );
    });
  }, [plants, category, search, isHindi, localizePlant, localizeCategory]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="max-w-2xl mb-8 herbora-rise">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#4E8738] mb-2">
          <Sprout className="w-4 h-4 text-[#4E8738]" />
          <span>{t('plantopedia.badge')}</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#113E21] leading-tight">
          {t('plantopedia.title')}
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
          {t('plantopedia.subtitle')}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FFFDF8] border border-[#DDD6C3] rounded-2xl p-4 sm:p-5 mb-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-8 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4E8738]" />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('plantopedia.searchPlaceholder')}
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-white border border-[#DDD6C3] text-sm text-[#113E21] outline-none focus:border-[#113E21] transition-all"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-4 relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#DDD6C3] text-sm text-[#113E21] font-medium outline-none focus:border-[#113E21] cursor-pointer transition-all"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {isHindi ? `श्रेणी: ${localizeCategory(c)}` : `Category: ${c}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-20 text-center text-[#43634E] flex flex-col items-center gap-3">
          <Sprout className="w-10 h-10 animate-bounce text-[#4E8738]" />
          <p className="font-serif text-xl text-[#113E21]">
            {isHindi ? 'पादप डेटाबेस खोला जा रहा है...' : 'Opening the Herbarium...'}
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-4 rounded-2xl bg-[#FDF2F0] border border-[#F5C2BC] text-[#9E2B25] text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredPlants.length === 0 && (
        <div className="py-16 text-center bg-[#FFFDF8] border border-[#DDD6C3] rounded-2xl p-8">
          <div className="w-14 h-14 rounded-full bg-[#E2ECD5] flex items-center justify-center mx-auto mb-3 text-[#113E21]">
            <Sprout className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#113E21]">
            {t('plantopedia.noPlantsFound')}
          </h3>
          <p className="text-sm text-[#43634E] mt-1 max-w-sm mx-auto">
            {isHindi ? 'कृपया खोज शब्द बदलें या श्रेणी फ़िल्टर को रीसेट करें।' : 'Try adjusting your search keywords or switching category filters.'}
          </p>
          {plants.length === 0 ? (
            <button
              onClick={loadData}
              className="mt-4 px-5 py-2 rounded-full bg-[#113E21] text-[#FAF6EE] text-xs font-semibold hover:bg-[#1C542E] transition-all shadow-xs cursor-pointer"
            >
              <span>{isHindi ? 'डेटाबेस पुनः लोड करें' : 'Reload Botanical Database'}</span>
            </button>
          ) : (
            <button
              onClick={() => { setSearch(''); setCategory('All'); }}
              className="mt-4 px-5 py-2 rounded-full bg-[#113E21] text-[#FAF6EE] text-xs font-semibold hover:bg-[#1C542E] transition-all shadow-xs cursor-pointer"
            >
              {t('plantopedia.clearSearch')}
            </button>
          )}
        </div>
      )}

      {/* Plants Grid */}
      {!loading && !error && filteredPlants.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlants.map((plant) => {
            const isSaved = savedPlantIds.has(plant.id) || savedPlantIds.has(plant.slug);
            return (
              <div
                key={plant.id || plant.slug}
                className="herbora-card flex flex-col justify-between overflow-hidden p-5 bg-[#FFFDF8] border border-[#DDD6C3] rounded-2xl hover:shadow-md hover:border-[#6C9352] transition-all group"
              >
                <div>
                  {/* Top: Category Tag & Save Bookmark */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#E2ECD5] text-[#113E21]">
                      {localizeCategory(plant.category)}
                    </span>
                    <button
                      onClick={() => onSavePlant(plant)}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        isSaved
                          ? 'bg-[#E2ECD5] border-[#4E8738] text-[#113E21]'
                          : 'bg-white border-[#DDD6C3] text-[#4E8738] hover:text-[#113E21] hover:bg-[#F2EAD9]'
                      }`}
                      title={isSaved ? t('plantopedia.saved') : t('plantopedia.savePlant')}
                    >
                      {isSaved ? <BookmarkCheck className="w-4 h-4 text-[#113E21]" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Plant Image */}
                  <div className="w-full h-44 rounded-xl overflow-hidden mb-4 border border-[#DDD6C3] bg-[#F7F4EA] relative">
                    <img 
                      src={plant.image_url || `/assets/${plant.slug}.jpg`} 
                      alt={plant.common_name} 
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        if (!e.currentTarget.src.includes(`${plant.slug}.jpg`)) {
                          e.currentTarget.src = `/assets/${plant.slug}.jpg`;
                        } else {
                          e.currentTarget.src = '/assets/herbal-wellness.jpg';
                        }
                      }}
                    />
                  </div>

                  {/* Names */}
                  <h2 className="font-serif text-2xl font-bold text-[#113E21] leading-tight">
                    {plant.common_name}
                  </h2>
                  <p className="italic text-xs font-serif text-[#43634E] mt-0.5">
                    {plant.scientific_name}
                  </p>
                  {plant.ayurvedic_name && (
                    <p className="text-xs font-medium text-[#1C542E] mt-1">
                      {isHindi ? 'आयुर्वेदिक नाम:' : 'Ayurvedic:'} <span className="font-semibold text-[#113E21]">{plant.ayurvedic_name}</span>
                    </p>
                  )}

                  {/* Short Description */}
                  <p className="text-xs text-[#1F3D29] line-clamp-3 leading-relaxed mt-2.5">
                    {plant.description}
                  </p>

                  {/* Dravyaguna Quick Tags */}
                  {(plant.virya || plant.tridosha || (plant.rasa && plant.rasa.length > 0)) && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2 border-t border-[#DDD6C3]/40">
                      {plant.tridosha ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E2ECD5] text-[#113E21] font-semibold border border-[#8DA56B]/60">
                          Tridoshic
                        </span>
                      ) : null}
                      {plant.virya && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF6EE] text-[#285D36] font-medium border border-[#DDD6C3]">
                          Virya: {plant.virya}
                        </span>
                      )}
                      {plant.rasa && plant.rasa.length > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF6EE] text-[#43634E] border border-[#DDD6C3]">
                          {plant.rasa.slice(0, 2).join(', ')}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom CTA */}
                <div className="pt-4 mt-3 border-t border-[#DDD6C3]/60 flex items-center justify-between">
                  <button
                    onClick={() => onSelectPlant(plant)}
                    className="herbora-btn-primary text-xs py-2 px-3.5 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{t('plantopedia.viewDetails')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] text-[#43634E] italic">
                    {plant.plant_parts_used ? `${isHindi ? 'अंग:' : 'Part:'} ${plant.plant_parts_used.split(',')[0]}` : 'Ayurvedic'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dataset Attribution Footer (CC BY 4.0) */}
      <div className="mt-12 pt-6 border-t border-[#DDD6C3] text-center text-xs text-[#556B5D] leading-relaxed">
        <p>
          <span>Botanical & Ayurvedic pharmacological metadata sourced from </span>
          <a
            href="https://www.amidhaayurveda.com/p/herb-database.html"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-semibold text-[#174B2B] hover:text-[#285D36]"
          >
            Amidha Ayurveda Herb Database v2.0
          </a>
          <span> by Sparsh Varshney (Licensed under </span>
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-semibold text-[#174B2B] hover:text-[#285D36]"
          >
            CC BY 4.0
          </a>
          <span>, DOI: </span>
          <a
            href="https://doi.org/10.5281/zenodo.17475351"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-semibold text-[#174B2B] hover:text-[#285D36]"
          >
            10.5281/zenodo.17475351
          </a>
          <span>).</span>
        </p>
      </div>
    </div>
  );
}
