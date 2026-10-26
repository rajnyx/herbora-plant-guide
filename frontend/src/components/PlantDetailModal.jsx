import React, { useState, useEffect } from 'react';
import { X, Bookmark, BookmarkCheck, ShieldAlert, ExternalLink, Sprout, MapPin, Sun } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getPlantImageUrl } from '../services/api';

export default function PlantDetailModal({ 
  plant: rawPlant, 
  onClose, 
  onSave, 
  isSaved,
  currentUser 
}) {
  const { t, localizePlant, localizeCategory, isHindi } = useLanguage();
  const plant = localizePlant(rawPlant);
  const [saving, setSaving] = useState(false);

  // Lock background scroll when plant modal is open
  useEffect(() => {
    if (!plant) return;

    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [plant]);

  if (!plant) return null;

  const handleSaveClick = async () => {
    setSaving(true);
    try {
      await onSave(plant);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto overscroll-contain">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-[#113E21]/40 backdrop-blur-xs transition-opacity" 
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-[#FAF8F2] border border-[#DDD6C3] rounded-3xl shadow-2xl overflow-hidden my-auto herbora-rise max-h-[90vh] flex flex-col">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-[#DDD6C3] flex items-center justify-between bg-[#F4EFE0]">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-[#E2ECD5] text-[#113E21] text-xs font-semibold tracking-wide uppercase">
              {localizeCategory(plant.category) || 'Ayurvedic Herb'}
            </span>
            {plant.ayurvedic_name && (
              <span className="font-serif italic text-sm text-[#4E8738]">
                {t('plantDetail.sanskrit')} {plant.ayurvedic_name}
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#556B5D] hover:bg-[#EDE6D5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Overview: Titles & Image */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-8 space-y-2">
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#174B2B]">
                {plant.common_name}
              </h1>
              <p className="italic text-base text-[#556B5D] font-serif">
                {plant.scientific_name}
              </p>

              {plant.regional_names && plant.regional_names.length > 0 && (
                <div className="text-xs text-[#637869] pt-1">
                  <span className="font-semibold text-[#174B2B]">{isHindi ? 'अन्य नाम: ' : 'Other names: '}</span>
                  {plant.regional_names.join(', ')}
                </div>
              )}

              <p className="text-sm text-[#2D3E33] leading-relaxed pt-2">
                {plant.description}
              </p>

              {/* Action: Save to My Plant DB */}
              <div className="pt-3">
                <button
                  onClick={handleSaveClick}
                  disabled={saving}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all shadow-xs cursor-pointer ${
                    isSaved
                      ? 'bg-[#E2ECD5] text-[#113E21] border border-[#4E8738]'
                      : 'herbora-btn-primary'
                  }`}
                >
                  {isSaved ? <BookmarkCheck className="w-4 h-4 text-[#113E21]" /> : <Bookmark className="w-4 h-4" />}
                  <span>{isSaved ? t('plantDetail.savedButton') : t('plantDetail.saveButton')}</span>
                </button>
              </div>
            </div>

            {/* Thumbnail Image */}
            <div className="md:col-span-4 flex justify-center">
              <div className="w-40 h-40 rounded-2xl overflow-hidden border border-[#DDD6C3] shadow-inner bg-[#F7F4EA]">
                <img 
                  src={getPlantImageUrl(plant)} 
                  alt={plant.common_name} 
                  className="w-full h-full object-cover object-center"
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
            </div>
          </div>

          <hr className="border-[#DDD6C3]" />

          {/* Section: Traditional Significance & Uses */}
          {plant.traditional_uses && (
            <div className="space-y-1.5">
              <h3 className="font-serif text-xl font-bold text-[#113E21] flex items-center gap-2">
                <Sprout className="w-5 h-5 text-[#4E8738]" />
                {t('plantDetail.traditionalUses')}
              </h3>
              <p className="text-sm text-[#1C3625] leading-relaxed pl-7">
                {plant.traditional_uses}
              </p>
            </div>
          )}

          {/* Section: Classical Ayurvedic Pharmacology (Dravyaguna) */}
          {((plant.rasa && plant.rasa.length > 0) || plant.virya || plant.vipaka || (plant.pacify && plant.pacify.length > 0) || plant.tridosha || (plant.main_indications && plant.main_indications.length > 0)) && (
            <div className="space-y-3 bg-[#F4EFE0]/60 p-4 rounded-2xl border border-[#DDD6C3]">
              <h3 className="font-serif text-lg font-bold text-[#113E21] flex items-center gap-2">
                <Sprout className="w-4 h-4 text-[#4E8738]" />
                <span>{isHindi ? 'आयुर्वेदिक द्रव्यगुण एवं दोष प्रभाव' : 'Classical Ayurvedic Pharmacology (Dravyaguna)'}</span>
              </h3>

              {/* Dosha Karma Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                {plant.tridosha ? (
                  <span className="px-3 py-1 rounded-full bg-[#E2ECD5] text-[#113E21] border border-[#6C9352] text-xs font-semibold">
                    ✨ {isHindi ? 'त्रिदोष शामक (Tridoshic)' : 'Tridosha Balancer (Vata, Pitta, Kapha)'}
                  </span>
                ) : null}
                {plant.pacify && plant.pacify.length > 0 && !plant.tridosha && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-semibold text-[#174B2B]">{isHindi ? 'शामक:' : 'Pacifies:'}</span>
                    <div className="flex flex-wrap gap-1">
                      {plant.pacify.map((d, i) => (
                        <span key={i} className="px-2.5 py-0.5 rounded-full bg-[#E2ECD5] text-[#113E21] font-medium text-xs">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {plant.aggravate && plant.aggravate.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-semibold text-[#8F3A2B]">{isHindi ? 'वर्धक:' : 'Aggravates:'}</span>
                    <div className="flex flex-wrap gap-1">
                      {plant.aggravate.map((d, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-[#FFF0EB] text-[#8F3A2B] font-medium text-xs border border-[#F2C9B3]">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Dravyaguna Grid: Rasa, Guna, Virya, Vipaka */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
                {plant.rasa && plant.rasa.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-[#FAF8F2] border border-[#DDD6C3]">
                    <span className="font-semibold text-[#4E8738] uppercase tracking-wider block mb-0.5">{isHindi ? 'रस (Taste)' : 'Rasa (Taste)'}</span>
                    <span className="text-[#113E21] font-medium">{plant.rasa.join(', ')}</span>
                  </div>
                )}
                {plant.guna && plant.guna.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-[#FAF8F2] border border-[#DDD6C3]">
                    <span className="font-semibold text-[#4E8738] uppercase tracking-wider block mb-0.5">{isHindi ? 'गुण (Quality)' : 'Guna (Quality)'}</span>
                    <span className="text-[#113E21] font-medium">{plant.guna.join(', ')}</span>
                  </div>
                )}
                {plant.virya && (
                  <div className="p-2.5 rounded-xl bg-[#FAF8F2] border border-[#DDD6C3]">
                    <span className="font-semibold text-[#4E8738] uppercase tracking-wider block mb-0.5">{isHindi ? 'वीर्य (Potency)' : 'Virya (Potency)'}</span>
                    <span className="text-[#113E21] font-medium">{plant.virya}</span>
                  </div>
                )}
                {plant.vipaka && (
                  <div className="p-2.5 rounded-xl bg-[#FAF8F2] border border-[#DDD6C3]">
                    <span className="font-semibold text-[#4E8738] uppercase tracking-wider block mb-0.5">{isHindi ? 'विपाक' : 'Vipaka'}</span>
                    <span className="text-[#113E21] font-medium">{plant.vipaka}</span>
                  </div>
                )}
              </div>

              {/* Prabhava & Main Indications */}
              {((plant.prabhav && plant.prabhav.length > 0) || (plant.main_indications && plant.main_indications.length > 0)) && (
                <div className="pt-2 border-t border-[#DDD6C3]/70 space-y-1.5 text-xs">
                  {plant.prabhav && plant.prabhav.length > 0 && (
                    <div>
                      <span className="font-semibold text-[#174B2B]">{isHindi ? 'प्रभाव (Specific Actions): ' : 'Prabhava (Special Action): '}</span>
                      <span className="text-[#2D3E33]">{plant.prabhav.join(', ')}</span>
                    </div>
                  )}
                  {plant.main_indications && plant.main_indications.length > 0 && (
                    <div>
                      <span className="font-semibold text-[#174B2B]">{isHindi ? 'प्रमुख संकेत (Indications): ' : 'Indications (Roga / Vyadhi): '}</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {plant.main_indications.map((ind, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-[#FAF8F2] border border-[#DDD6C3] text-[#113E21] font-medium text-[11px]">
                            {ind}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Section: Plant Parts & Cultivation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAF6EE] p-4 rounded-2xl border border-[#DDD6C3]">
            {plant.plant_parts_used && (
              <div>
                <span className="text-xs font-semibold text-[#4E8738] uppercase tracking-wider block mb-1">
                  {t('plantDetail.plantPartsUsed')}
                </span>
                <p className="text-sm text-[#113E21] font-medium">{plant.plant_parts_used}</p>
              </div>
            )}
            {plant.habitat && (
              <div>
                <span className="text-xs font-semibold text-[#4E8738] uppercase tracking-wider block mb-1">
                  {t('plantDetail.habitat')}
                </span>
                <p className="text-sm text-[#113E21] flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#4E8738]" />
                  {plant.habitat}
                </p>
              </div>
            )}
            {plant.cultivation_information && (
              <div className="sm:col-span-2 pt-2 border-t border-[#DDD6C3]">
                <span className="text-xs font-semibold text-[#4E8738] uppercase tracking-wider block mb-1">
                  {t('plantDetail.cultivation')}
                </span>
                <p className="text-sm text-[#1C3625] leading-relaxed">
                  {plant.cultivation_information}
                </p>
              </div>
            )}
          </div>

          {/* Safety & Educational Warning Alert */}
          <div className="p-4 rounded-2xl bg-[#FFF6F0] border border-[#F2C9B3] text-[#7A3B22] flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-[#D96B43] shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <span className="font-bold block text-sm mb-1 text-[#8F3A2B]">{t('plantDetail.safety')}</span>
              {plant.safety_information}
              <p className="mt-1 text-[11px] opacity-85 italic">
                {isHindi 
                  ? "अस्वीकरण: हर्बोरा एक शैक्षणिक मंच है। पारंपरिक आयुर्वेदिक उपयोगों को निश्चित चिकित्सा उपचार न मानें।"
                  : "Disclaimer: Herbora is strictly an educational resource. Traditional Ayurvedic uses must not be taken as guaranteed medical treatments or prescriptions."}
              </p>
            </div>
          </div>

          {/* Scientific Source References & CC BY 4.0 Attribution */}
          {plant.source_references && plant.source_references.length > 0 && (
            <div className="pt-2 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#4E8738] block">
                {t('plantDetail.sourceReferences')}
              </span>
              <div className="flex flex-wrap gap-2">
                {plant.source_references.map((ref, i) => (
                  <a 
                    key={i}
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-[#FAF8F2] border border-[#E2DDD0] text-[#285D36] hover:bg-[#EDE6D5] transition-colors"
                  >
                    <span>{ref.title}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
              <div className="text-[11px] text-[#556B5D] pt-1">
                <span>Botanical & Ayurvedic pharmacological metadata sourced from </span>
                <a
                  href="https://www.amidhaayurveda.com/p/herb-database.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-[#174B2B] font-medium"
                >
                  Amidha Ayurveda Herb Database v2.0
                </a>
                <span> by Sparsh Varshney (</span>
                <a
                  href="https://creativecommons.org/licenses/by/4.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-[#174B2B]"
                >
                  CC BY 4.0
                </a>
                <span>, DOI: </span>
                <a
                  href="https://doi.org/10.5281/zenodo.17475351"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-[#174B2B]"
                >
                  10.5281/zenodo.17475351
                </a>
                <span>).</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
