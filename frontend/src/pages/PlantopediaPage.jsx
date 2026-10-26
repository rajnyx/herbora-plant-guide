import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Filter, Bookmark, BookmarkCheck, ArrowRight, Sprout, 
  AlertCircle, ChevronDown, Layers, ChevronUp, ShieldCheck, Flame, 
  Brain, Sparkles, Wind, Activity, Heart, Droplets, Leaf, Flower2, X, Check
} from 'lucide-react';
import { fetchPlants, FALLBACK_PLANTS, getPlantImageUrl } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export const IMPORTANT_CATEGORIES = [
  {
    id: 'All',
    name: 'All Herbs',
    hiName: 'सभी जड़ी-बूटियाँ',
    icon: Layers,
    description: 'Browse the complete Ayurvedic botanical collection of authentic healing plants.',
    hiDescription: 'प्रामाणिक औषधीय पौधों का संपूर्ण आयुर्वेदिक वनस्पति संग्रह।',
    keywords: [],
    legacy: ['All']
  },
  {
    id: 'Immunity & Vitality',
    name: 'Immunity & Vitality',
    hiName: 'रोग प्रतिरोधक क्षमता व ओज',
    icon: ShieldCheck,
    description: 'Rasayana & Balya botanicals that bolster natural immunity, cellular defense, and longevity.',
    hiDescription: 'रसायन व बल्य औषधियां जो रोग प्रतिरोधक क्षमता, ओज और प्राकृतिक जीवन शक्ति को बढ़ाती हैं।',
    keywords: ['immunity', 'immune', 'vitality', 'rasayan', 'rasayana', 'balya', 'ojovardhak', 'rejuvenat', 'adaptogen', 'jwara', 'fever', 'infection', 'krimighna'],
    legacy: ['Immunity', 'Adaptogens']
  },
  {
    id: 'Digestion & Gut',
    name: 'Digestion & Gut Health',
    hiName: 'पाचन व जठराग्नि',
    icon: Flame,
    description: 'Deepana & Pachana herbs that kindle digestive fire, relieve bloating, gas, and promote nutrient absorption.',
    hiDescription: 'दीपन व पाचन जड़ी-बूटियाँ जो जठराग्नि को प्रदीप्त कर गैस, अपच और पेट के विकारों को शांत करती हैं।',
    keywords: ['digest', 'gut', 'agni', 'deepana', 'pachana', 'bloating', 'acidity', 'gas', 'constipation', 'grahi', 'anulomana', 'atisara', 'grahani', 'aruchi', 'stomach', 'bowel'],
    legacy: ['Digestion', 'Diet & Digestion', 'Digestion & Bloating']
  },
  {
    id: 'Stress, Sleep & Brain',
    name: 'Stress, Sleep & Brain',
    hiName: 'तनाव मुक्ति व मेधा',
    icon: Brain,
    description: 'Medhya Rasayanas for cognitive focus, memory, emotional tranquility, and deep restorative sleep.',
    hiDescription: 'मेध्य रसायन जो एकाग्रता, स्मरण शक्ति, मानसिक शांति और गहरी सुखद निद्रा प्रदान करते हैं।',
    keywords: ['stress', 'sleep', 'brain', 'memory', 'medhya', 'smriti', 'anxiety', 'insomnia', 'calm', 'nervine', 'neuro', 'unmada', 'mental', 'mind'],
    legacy: ['Stress Relief', 'Sleep & Stress']
  },
  {
    id: 'Skin & Hair Care',
    name: 'Skin & Hair Care',
    hiName: 'त्वचा व केश सौंदर्य',
    icon: Sparkles,
    description: 'Varnya & Keshya plants for radiant complexion, acne defense, scalp nourishment, and hair strength.',
    hiDescription: 'वर्ण्य व केश्य औषधियां जो त्वचा में प्राकृतिक कांति लाती हैं और बालों को पोषण देती हैं।',
    keywords: ['skin', 'hair', 'complexion', 'varnya', 'kushta', 'twak', 'tvachya', 'kandu', 'acne', 'glow', 'scalp', 'dandruff', 'keshya', 'eczema', 'dermat'],
    legacy: ['Skin Care', 'Hair & Scalp Health']
  },
  {
    id: 'Respiratory & Lungs',
    name: 'Respiratory & Lungs',
    hiName: 'श्वसन व फेफड़े',
    icon: Wind,
    description: 'Kasahara & Shwasahara herbs clearing bronchial passages, soothing sore throats, and supporting easy breathing.',
    hiDescription: 'कासहर व श्वासहर जड़ी-बूटियाँ जो श्वसन मार्ग को शुद्ध कर खांसी और कफ से राहत देती हैं।',
    keywords: ['respiratory', 'cough', 'cold', 'kasa', 'shwasa', 'asthma', 'bronch', 'lung', 'throat', 'pratishyaya', 'sinus', 'hikka', 'kasahara', 'shwasahara'],
    legacy: ['Respiratory', 'Immunity & Throat']
  },
  {
    id: 'Joints & Mobility',
    name: 'Joints & Mobility',
    hiName: 'जोड़ों का दर्द व संधिशूल',
    icon: Activity,
    description: 'Shothahara & Vata-pacifying herbs that ease joint stiffness, inflammation, and improve everyday flexibility.',
    hiDescription: 'शोथहर व वातशामक औषधियां जो जोड़ों के दर्द, सूजन और जकड़न को दूर कर गतिशीलता लाती हैं।',
    keywords: ['joint', 'mobility', 'arthritis', 'amavata', 'sandhivata', 'pain', 'inflammation', 'shotha', 'shothahara', 'shoolaghna', 'vedanasthapana', 'stiffness', 'cartilage', 'gout', 'rheumat'],
    legacy: ['Joint Care & Mobility']
  },
  {
    id: 'Heart & Circulation',
    name: 'Heart & Circulation',
    hiName: 'हृदय व रक्त संचार',
    icon: Heart,
    description: 'Hridya botanicals supporting healthy arterial tone, cardiovascular vigor, and blood purification.',
    hiDescription: 'हृद्य औषधियां जो हृदय की कार्यप्रणाली, स्वस्थ रक्तचाप और रक्त शुद्धिकरण में सहायक हैं।',
    keywords: ['heart', 'cardio', 'hridya', 'hridaya', 'circulation', 'cholesterol', 'blood pressure', 'hypertension', 'vascular', 'rakta pitta', 'raktapitta', 'artery'],
    legacy: ['Heart Health']
  },
  {
    id: 'Diabetes & Blood Sugar',
    name: 'Diabetes & Blood Sugar',
    hiName: 'मधुमेह व शर्करा नियंत्रण',
    icon: Droplets,
    description: 'Pramehahara regulators that support metabolic balance, healthy insulin function, and glucose stability.',
    hiDescription: 'प्रमेहहर जड़ी-बूटियाँ जो इंसुलिन संवेदनशीलता और रक्त में शर्करा के स्तर को संतुलित रखती हैं।',
    keywords: ['diabetes', 'blood sugar', 'glucose', 'insulin', 'prameha', 'madhumeha', 'glycemic', 'metabol'],
    legacy: ['Diabetes', 'Metabolism & Blood Sugar']
  },
  {
    id: 'Detox & Liver Care',
    name: 'Detox & Liver Care',
    hiName: 'लिवर शोधन व विषमुक्ति',
    icon: Leaf,
    description: 'Yakrit stimulants and cooling herbs that flush metabolic toxins (Ama) and balance excess Pitta heat.',
    hiDescription: 'यकृत उत्तेजक व शीतल औषधियां जो शरीर से विषाक्त पदार्थों (आम) को बाहर निकालती हैं।',
    keywords: ['liver', 'detox', 'yakrit', 'kamala', 'jaundice', 'hepat', 'bile', 'pitta', 'shodhana', 'rechana', 'vishaghna', 'toxin', 'cleanse', 'cleansing'],
    legacy: ['Eye & Gentle Detox', 'Cooling & Pitta']
  },
  {
    id: "Women's Wellness",
    name: "Women's Wellness",
    hiName: 'महिला स्वास्थ्य व संतुलन',
    icon: Flower2,
    description: 'Gentle restorative herbs supporting natural menstrual rhythms, hormone harmony, and maternal vitality.',
    hiDescription: 'सौम्य पोषक जड़ी-बूटियाँ जो प्राकृतिक हार्मोनल संतुलन, मासिक धर्म नियमितता और नारी स्वास्थ्य का पोषण करती हैं।',
    keywords: ['women', 'female', 'hormon', 'menstrua', 'artava', 'stanya', 'lactation', 'yoniroga', 'pradara', 'garbhashaya', 'menopause', 'fertility', 'pms'],
    legacy: ['Vitality & Hormonal Balance']
  }
];

export function doesPlantMatchCategory(plant, selectedCategory) {
  if (!plant) return false;
  if (!selectedCategory || selectedCategory === 'All') return true;

  const target = selectedCategory.trim().toLowerCase();
  const plantCat = (plant.category || '').trim().toLowerCase();

  // Direct exact match
  if (plantCat === target) return true;

  // Find category definition
  const catDef = IMPORTANT_CATEGORIES.find(
    (c) =>
      c.id.toLowerCase() === target ||
      c.name.toLowerCase() === target ||
      c.hiName.toLowerCase() === target ||
      (c.legacy && c.legacy.some((l) => l.toLowerCase() === target))
  );

  if (!catDef) {
    return plantCat.includes(target);
  }

  // Check legacy category aliases
  if (catDef.legacy && catDef.legacy.some((l) => plantCat.includes(l.toLowerCase()))) {
    return true;
  }

  // Multi-attribute corpus search
  const indications = Array.isArray(plant.main_indications) ? plant.main_indications.join(' ') : '';
  const prabhav = Array.isArray(plant.prabhav) ? plant.prabhav.join(' ') : '';
  const uses = plant.traditional_uses || '';
  const desc = plant.description || '';
  const names = `${plant.common_name || ''} ${plant.ayurvedic_name || ''} ${plant.scientific_name || ''}`;
  const corpus = `${names} ${plantCat} ${indications} ${prabhav} ${uses} ${desc}`.toLowerCase();

  return catDef.keywords.some((kw) => corpus.includes(kw));
}

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
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    if (initialSearch !== undefined) {
      setSearch(initialSearch);
    }
  }, [initialSearch]);

  // Reset pagination when search keyword or category filter changes
  useEffect(() => {
    setVisibleCount(12);
  }, [search, category]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchPlants('All', '');
      if (Array.isArray(data) && data.length > 0) {
        setPlants(data);
      }
    } catch (err) {
      console.warn('Failed to load botanical dataset:', err);
      // Keep canonical FALLBACK_PLANTS
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isHindi]);

  // Dynamic live herb counts for every category
  const categoryCounts = useMemo(() => {
    if (!Array.isArray(plants) || plants.length === 0) return {};
    const counts = { All: plants.length };
    IMPORTANT_CATEGORIES.forEach((catDef) => {
      if (catDef.id !== 'All') {
        counts[catDef.id] = plants.filter((p) => doesPlantMatchCategory(p, catDef.id)).length;
      }
    });
    return counts;
  }, [plants]);

  const activeCategoryDef = useMemo(() => {
    return IMPORTANT_CATEGORIES.find((c) => c.id === category) || null;
  }, [category]);

  const filteredPlants = useMemo(() => {
    if (!Array.isArray(plants)) return [];
    const q = (search || '').trim().toLowerCase();

    return plants
      .map((p) => localizePlant(p))
      .filter((p) => {
        if (!p) return false;
        
        // Category multi-attribute match
        if (!doesPlantMatchCategory(p, category)) return false;

        // Search text matching
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
  }, [plants, category, search, isHindi, localizePlant]);

  const displayedPlants = useMemo(() => {
    return filteredPlants.slice(0, visibleCount);
  }, [filteredPlants, visibleCount]);

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
      <div className="bg-[#FFFDF8] border border-[#DDD6C3] rounded-2xl p-4 sm:p-5 mb-6 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
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
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#43634E] hover:text-[#113E21] cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-4 relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#DDD6C3] text-sm text-[#113E21] font-medium outline-none focus:border-[#113E21] cursor-pointer transition-all"
            >
              {IMPORTANT_CATEGORIES.map((c) => {
                const count = categoryCounts[c.id];
                const label = isHindi ? c.hiName : c.name;
                return (
                  <option key={c.id} value={c.id}>
                    {label} {count !== undefined ? `(${count})` : ''}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Interactive Category Chips Carousel / Grid */}
        <div className="pt-3 border-t border-[#DDD6C3]/60">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#113E21] uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5 text-[#4E8738]" />
              <span>{isHindi ? 'स्वास्थ्य एवं उपचार श्रेणियाँ' : 'Therapeutic & Health Categories'}</span>
            </div>
            {category !== 'All' && (
              <button
                onClick={() => setCategory('All')}
                className="text-[11px] font-semibold text-[#4E8738] hover:text-[#113E21] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <X className="w-3 h-3" />
                <span>{isHindi ? 'सभी पौधे देखें' : 'Reset Category'}</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-1 pb-1">
            {IMPORTANT_CATEGORIES.map((catDef) => {
              const isSelected = category === catDef.id;
              const IconComponent = catDef.icon;
              const count = categoryCounts[catDef.id];
              const title = isHindi ? catDef.hiName : catDef.name;

              return (
                <button
                  key={catDef.id}
                  onClick={() => setCategory(catDef.id)}
                  className={`group px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#113E21] text-[#FAF6EE] shadow-xs border border-[#113E21]'
                      : 'bg-white text-[#20442B] border border-[#DDD6C3] hover:border-[#6C9352] hover:bg-[#F7F4EA]'
                  }`}
                  title={isHindi ? catDef.hiDescription : catDef.description}
                >
                  <IconComponent className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#CDE1BC]' : 'text-[#4E8738]'}`} />
                  <span className="font-semibold">{title}</span>
                  {count !== undefined && (
                    <span 
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected 
                          ? 'bg-[#FAF6EE]/20 text-[#FAF6EE]' 
                          : 'bg-[#E2ECD5] text-[#113E21]'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Category Therapeutic Focus Banner */}
      {activeCategoryDef && activeCategoryDef.id !== 'All' && (
        <div className="mb-6 p-4 rounded-2xl bg-[#F4F8EE] border border-[#BFD7A9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm herbora-rise">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#113E21] text-[#FAF6EE] flex items-center justify-center shrink-0 shadow-xs">
              {React.createElement(activeCategoryDef.icon, { className: "w-5 h-5 text-[#CDE1BC]" })}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base text-[#113E21]">
                  {isHindi ? activeCategoryDef.hiName : activeCategoryDef.name}
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#E2ECD5] text-[#113E21] font-semibold">
                  {filteredPlants.length} {isHindi ? 'पौधे' : 'herbs'}
                </span>
              </div>
              <p className="text-xs text-[#3E5C47] mt-0.5">
                {isHindi ? activeCategoryDef.hiDescription : activeCategoryDef.description}
              </p>
            </div>
          </div>
          <button
            onClick={() => setCategory('All')}
            className="self-end sm:self-auto shrink-0 px-3 py-1 rounded-lg bg-white border border-[#DDD6C3] text-xs font-semibold text-[#113E21] hover:bg-[#E2ECD5] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <X className="w-3.5 h-3.5 text-[#4E8738]" />
            <span>{isHindi ? 'फ़िल्टर हटाएं' : 'Show All Herbs'}</span>
          </button>
        </div>
      )}

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

      {/* Results Counter & View All Quick Action */}
      {!loading && !error && filteredPlants.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 px-1 text-xs text-[#43634E]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#113E21]">
              {isHindi
                ? `प्रदर्शित: ${displayedPlants.length} / कुल ${filteredPlants.length} औषधीय पौधे`
                : `Showing ${displayedPlants.length} of ${filteredPlants.length} medicinal herbs`}
            </span>
            {plants.length > 12 && (
              <span className="px-2 py-0.5 rounded-full bg-[#E2ECD5] text-[#113E21] font-semibold text-[11px] border border-[#8DA56B]/50">
                {isHindi ? 'हर्बल संग्रह' : 'Medicinal Herbs'}
              </span>
            )}
          </div>

          {filteredPlants.length > visibleCount && (
            <button
              onClick={() => setVisibleCount(filteredPlants.length)}
              className="text-[#174B2B] hover:text-[#285D36] font-semibold underline underline-offset-4 cursor-pointer self-start sm:self-auto text-xs"
            >
              {isHindi ? 'सभी पौधे देखें' : 'View all herbs'}
            </button>
          )}
        </div>
      )}

      {/* Plants Grid */}
      {!loading && !error && filteredPlants.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedPlants.map((plant) => {
            const isSaved = savedPlantIds.has(plant.id) || savedPlantIds.has(plant.slug);
            return (
              <div
                key={plant.id || plant.slug}
                className="herbora-card flex flex-col justify-between overflow-hidden p-5 bg-[#FFFDF8] border border-[#DDD6C3] rounded-2xl hover:shadow-md hover:border-[#6C9352] transition-all group"
              >
                <div>
                  {/* Top: Category Tag & Save Bookmark */}
                  <div className="flex items-center justify-between mb-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCategory(plant.category);
                      }}
                      className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#E2ECD5] text-[#113E21] hover:bg-[#113E21] hover:text-[#FAF6EE] transition-all cursor-pointer flex items-center gap-1"
                      title={isHindi ? `श्रेणी: ${localizeCategory(plant.category)}` : `Filter by ${plant.category}`}
                    >
                      <span>{localizeCategory(plant.category)}</span>
                    </button>
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
                      src={getPlantImageUrl(plant)} 
                      alt={plant.common_name} 
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        const fallback = getPlantImageUrl(plant);
                        if (fallback && e.currentTarget.src !== fallback) {
                          e.currentTarget.src = fallback;
                        } else {
                          e.currentTarget.src = '/assets/botanical_canvas.jpg';
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

      {/* View More / Load More Section */}
      {!loading && !error && filteredPlants.length > 0 && (
        <div className="mt-10 flex flex-col items-center justify-center gap-4">
          {visibleCount < filteredPlants.length ? (
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              {/* Load Next Batch Button */}
              <button
                onClick={() => setVisibleCount((prev) => Math.min(prev + 12, filteredPlants.length))}
                className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#113E21] text-[#FAF6EE] text-sm font-semibold hover:bg-[#1C542E] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>
                  {isHindi ? 'और पौधे लोड करें' : 'Load More Herbs'}
                </span>
                <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              </button>

              {/* View All Button */}
              <button
                onClick={() => setVisibleCount(filteredPlants.length)}
                className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#FAF7EE] border border-[#8DA56B] text-[#113E21] text-sm font-semibold hover:bg-[#E2ECD5] transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Layers className="w-4 h-4 text-[#4E8738]" />
                <span>
                  {isHindi ? 'सभी पौधे देखें' : 'View All Herbs'}
                </span>
              </button>
            </div>
          ) : (
            filteredPlants.length > 12 && (
              <div className="flex flex-col items-center gap-2 text-center py-4 px-6 rounded-2xl bg-[#F7F4EA] border border-[#DDD6C3]">
                <p className="text-xs sm:text-sm font-medium text-[#113E21] flex items-center gap-1.5">
                  <span>🌿</span>
                  <span>
                    {isHindi
                      ? 'सभी औषधीय पौधे प्रदर्शित हैं।'
                      : 'All botanical profiles are currently displayed.'}
                  </span>
                </p>
                <button
                  onClick={() => {
                    setVisibleCount(12);
                    window.scrollTo({ top: 200, behavior: 'smooth' });
                  }}
                  className="text-xs text-[#4E8738] hover:text-[#113E21] font-semibold flex items-center gap-1 cursor-pointer underline underline-offset-4 mt-1"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'कम पौधे दिखाएं' : 'Show fewer herbs'}</span>
                </button>
              </div>
            )
          )}
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
