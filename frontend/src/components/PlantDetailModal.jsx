import React, { useState } from 'react';
import { X, Bookmark, BookmarkCheck, ShieldAlert, ExternalLink, Sprout, MapPin, Sun } from 'lucide-react';

export default function PlantDetailModal({ 
  plant, 
  onClose, 
  onSave, 
  isSaved,
  currentUser 
}) {
  const [saving, setSaving] = useState(false);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-[#174B2B]/40 backdrop-blur-xs transition-opacity" 
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-[#FAF8F2] border border-[#E2DDD0] rounded-2xl shadow-2xl overflow-hidden my-auto herbora-rise max-h-[90vh] flex flex-col">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-[#EAE6DC] flex items-center justify-between bg-[#F4EFE0]">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-[#DDE5C9] text-[#174B2B] text-xs font-semibold tracking-wide uppercase">
              {plant.category || 'Ayurvedic Herb'}
            </span>
            {plant.ayurvedic_name && (
              <span className="font-serif italic text-sm text-[#285D36]">
                Sanskrit: {plant.ayurvedic_name}
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
                  <span className="font-semibold text-[#174B2B]">Other names: </span>
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
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all shadow-xs ${
                    isSaved
                      ? 'bg-[#DDE5C9] text-[#174B2B] border border-[#8DA56B]'
                      : 'bg-[#174B2B] text-[#FAF8F2] hover:bg-[#285D36]'
                  }`}
                >
                  {isSaved ? <BookmarkCheck className="w-4 h-4 text-[#285D36]" /> : <Bookmark className="w-4 h-4" />}
                  <span>{isSaved ? 'Saved in My Plant DB' : 'Save to My Collection'}</span>
                </button>
              </div>
            </div>

            {/* Thumbnail Image */}
            <div className="md:col-span-4 flex justify-center">
              <div className="w-40 h-40 rounded-2xl overflow-hidden border border-[#E2DDD0] shadow-inner bg-white">
                <img 
                  src={plant.image_url || '/assets/herbal-wellness.jpg'} 
                  alt={plant.common_name} 
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
          </div>

          <hr className="border-[#EAE6DC]" />

          {/* Section: Traditional Significance & Uses */}
          {plant.traditional_uses && (
            <div className="space-y-1.5">
              <h3 className="font-serif text-xl font-bold text-[#174B2B] flex items-center gap-2">
                <Sprout className="w-5 h-5 text-[#8DA56B]" />
                Traditional Ayurvedic Significance & Uses
              </h3>
              <p className="text-sm text-[#3B4E41] leading-relaxed pl-7">
                {plant.traditional_uses}
              </p>
            </div>
          )}

          {/* Section: Plant Parts & Cultivation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F4EFE0]/60 p-4 rounded-xl border border-[#EAE6DC]">
            {plant.plant_parts_used && (
              <div>
                <span className="text-xs font-semibold text-[#8DA56B] uppercase tracking-wider block mb-1">
                  Parts Used
                </span>
                <p className="text-sm text-[#174B2B] font-medium">{plant.plant_parts_used}</p>
              </div>
            )}
            {plant.habitat && (
              <div>
                <span className="text-xs font-semibold text-[#8DA56B] uppercase tracking-wider block mb-1">
                  Natural Habitat
                </span>
                <p className="text-sm text-[#174B2B] flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#8DA56B]" />
                  {plant.habitat}
                </p>
              </div>
            )}
            {plant.cultivation_information && (
              <div className="sm:col-span-2 pt-2 border-t border-[#EAE6DC]">
                <span className="text-xs font-semibold text-[#8DA56B] uppercase tracking-wider block mb-1">
                  Cultivation & Care
                </span>
                <p className="text-sm text-[#2D3E33] leading-relaxed">
                  {plant.cultivation_information}
                </p>
              </div>
            )}
          </div>

          {/* Safety & Educational Warning Alert */}
          <div className="p-4 rounded-xl bg-[#FFF6F0] border border-[#F2C9B3] text-[#7A3B22] flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-[#D96B43] shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <span className="font-bold block text-sm mb-1 text-[#8F3A2B]">Important Safety Information</span>
              {plant.safety_information}
              <p className="mt-1 text-[11px] opacity-85 italic">
                Disclaimer: Herbora is strictly an educational resource. Traditional Ayurvedic uses must not be taken as guaranteed medical treatments or prescriptions.
              </p>
            </div>
          </div>

          {/* Scientific Source References */}
          {plant.source_references && plant.source_references.length > 0 && (
            <div className="pt-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8DA56B] block mb-2">
                Scientific & Botanical References
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
