import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Bookmark, BookmarkCheck, ArrowRight, Sprout, AlertCircle } from 'lucide-react';
import { fetchPlants } from '../services/api';

export default function PlantopediaPage({ 
  initialSearch = '', 
  onSelectPlant, 
  savedPlantIds, 
  onSavePlant 
}) {
  const [plants, setPlants] = useState([]);
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
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
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchPlants(category, search);
        setPlants(data);
      } catch (err) {
        setError('Could not load plant library. Please verify backend service.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [category]);

  const filteredPlants = useMemo(() => {
    return plants.filter((p) => {
      const matchCat = category === 'All' || p.category === category;
      const q = search.toLowerCase();
      const matchSearch = 
        !q ||
        p.common_name.toLowerCase().includes(q) ||
        p.scientific_name.toLowerCase().includes(q) ||
        (p.ayurvedic_name && p.ayurvedic_name.toLowerCase().includes(q)) ||
        (p.regional_names && p.regional_names.some((rn) => rn.toLowerCase().includes(q)));
      return matchCat && matchSearch;
    });
  }, [plants, category, search]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="max-w-2xl mb-8 herbora-rise">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#8DA56B] mb-2">
          <Sprout className="w-4 h-4" />
          <span>Herbora Botanical Herbarium</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#174B2B] leading-tight">
          Plantopedia
        </h1>
        <p className="text-sm sm:text-base text-[#556B5D] mt-2 leading-relaxed">
          Explore authentic Ayurvedic medicinal plants, their traditional Sanskrit designations, botanical traits, and historical uses. This database is educational, not medical advice.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FAF8F2] border border-[#E2DDD0] rounded-2xl p-4 sm:p-5 mb-8 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-8 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8DA56B]" />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by common, scientific, or Ayurvedic name..."
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-white border border-[#E2DDD0] text-sm text-[#174B2B] outline-none focus:border-[#285D36]"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-4 relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-white border border-[#E2DDD0] text-sm text-[#174B2B] font-medium outline-none focus:border-[#285D36] cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>Category: {c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-[#EAE6DC]">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                category === c
                  ? 'bg-[#174B2B] text-[#FAF8F2] shadow-xs'
                  : 'bg-white border border-[#E2DDD0] text-[#2D3E33] hover:bg-[#EDE6D5]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-20 text-center text-[#556B5D] flex flex-col items-center gap-3">
          <Sprout className="w-10 h-10 animate-bounce text-[#8DA56B]" />
          <p className="font-serif text-xl">Opening the Herbarium...</p>
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
        <div className="py-16 text-center bg-[#FAF8F2] border border-[#E2DDD0] rounded-2xl p-8">
          <div className="w-14 h-14 rounded-full bg-[#DDE5C9] flex items-center justify-center mx-auto mb-3 text-[#174B2B]">
            <Sprout className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#174B2B]">No plants matched</h3>
          <p className="text-sm text-[#637869] mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords or switching category filters.
          </p>
          <button
            onClick={() => { setSearch(''); setCategory('All'); }}
            className="mt-4 px-4 py-2 rounded-full bg-[#174B2B] text-[#FAF8F2] text-xs font-semibold hover:bg-[#285D36]"
          >
            Reset Filters
          </button>
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
                className="herbora-card flex flex-col justify-between overflow-hidden p-5 bg-[#FAF8F2] border border-[#E2DDD0] rounded-2xl hover:shadow-md transition-all group"
              >
                <div>
                  {/* Top: Category Tag & Save Bookmark */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#DDE5C9] text-[#174B2B]">
                      {plant.category}
                    </span>
                    <button
                      onClick={() => onSavePlant(plant)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isSaved
                          ? 'bg-[#DDE5C9] border-[#8DA56B] text-[#174B2B]'
                          : 'bg-white border-[#E2DDD0] text-[#8DA56B] hover:text-[#174B2B] hover:bg-[#EDE6D5]'
                      }`}
                      title={isSaved ? 'Saved in My Plant DB' : 'Save to My Plant DB'}
                    >
                      {isSaved ? <BookmarkCheck className="w-4 h-4 text-[#285D36]" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Plant Image */}
                  <div className="w-full h-44 rounded-xl overflow-hidden mb-4 border border-[#E2DDD0] bg-white">
                    <img 
                      src={plant.image_url || '/assets/herbal-wellness.jpg'} 
                      alt={plant.common_name} 
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>

                  {/* Names */}
                  <h2 className="font-serif text-2xl font-bold text-[#174B2B] leading-tight">
                    {plant.common_name}
                  </h2>
                  <p className="italic text-xs font-serif text-[#556B5D] mt-0.5">
                    {plant.scientific_name}
                  </p>
                  {plant.ayurvedic_name && (
                    <p className="text-xs font-medium text-[#285D36] mt-1">
                      Ayurvedic: <span className="font-semibold">{plant.ayurvedic_name}</span>
                    </p>
                  )}

                  {/* Short Description */}
                  <p className="text-xs text-[#3B4E41] line-clamp-3 leading-relaxed mt-2.5">
                    {plant.description}
                  </p>
                </div>

                {/* Bottom CTA */}
                <div className="pt-5 mt-4 border-t border-[#EAE6DC] flex items-center justify-between">
                  <button
                    onClick={() => onSelectPlant(plant)}
                    className="herbora-btn-primary text-xs py-2 px-3.5"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] text-[#637869] italic">
                    {plant.plant_parts_used ? `Part: ${plant.plant_parts_used.split(',')[0]}` : 'Ayurvedic'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
