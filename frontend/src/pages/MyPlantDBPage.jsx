import React from 'react';
import { Bookmark, Trash2, ArrowRight, BookOpen, LogIn, Sprout } from 'lucide-react';

export default function MyPlantDBPage({
  currentUser,
  savedPlants = [],
  onRemovePlant,
  onSelectPlant,
  onOpenAuth,
  onNavigateToPlantopedia
}) {
  // If user is not authenticated, show clear login prompt
  if (!currentUser) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-16 text-center herbora-rise">
        <div className="bg-[#FAF8F2] border border-[#E2DDD0] rounded-3xl p-8 sm:p-12 shadow-sm max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#DDE5C9] border border-[#8DA56B] flex items-center justify-center mx-auto mb-4 text-[#174B2B]">
            <Bookmark className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#174B2B]">
            My Plant DB
          </h1>
          <p className="text-sm text-[#556B5D] mt-2 mb-6 leading-relaxed">
            Please log in or create an account to save your favorite Ayurvedic plants, bookmark personal remedies, and build your personalized herbarium.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto py-2.5 px-6 rounded-full bg-[#174B2B] hover:bg-[#285D36] text-[#FAF8F2] text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In / Sign Up</span>
            </button>
            <button
              onClick={onNavigateToPlantopedia}
              className="w-full sm:w-auto py-2.5 px-6 rounded-full bg-white border border-[#E2DDD0] text-[#174B2B] hover:bg-[#EDE6D5] text-sm font-semibold transition-all cursor-pointer"
            >
              <span>Explore Plantopedia</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="max-w-2xl mb-8 herbora-rise">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#8DA56B] mb-2">
          <Bookmark className="w-4 h-4" />
          <span>Personal Herbarium</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#174B2B] leading-tight">
          My Plant DB
        </h1>
        <p className="text-sm sm:text-base text-[#556B5D] mt-2 leading-relaxed">
          Plants you have bookmarked from Plantopedia. Review their Ayurvedic properties, cultivation notes, and traditional remedies anytime.
        </p>
      </div>

      {/* Empty State for authenticated users with 0 saved plants */}
      {savedPlants.length === 0 ? (
        <div className="py-16 text-center bg-[#FAF8F2] border border-[#E2DDD0] rounded-3xl p-8 sm:p-12 max-w-xl mx-auto herbora-rise">
          <div className="w-16 h-16 rounded-2xl bg-[#DDE5C9] flex items-center justify-center mx-auto mb-4 text-[#174B2B]">
            <Sprout className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#174B2B]">
            Your personal collection is empty
          </h2>
          <p className="text-sm text-[#637869] mt-2 mb-6 max-w-md mx-auto leading-relaxed">
            Browse through Herbora's Plantopedia database and click the bookmark icon on any plant to add it to your personal database.
          </p>
          <button
            onClick={onNavigateToPlantopedia}
            className="herbora-btn-primary py-2.5 px-6 text-sm"
          >
            <BookOpen className="w-4 h-4" />
            <span>Discover Plants in Plantopedia</span>
          </button>
        </div>
      ) : (
        /* Grid of Saved Plants */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedPlants.map((item) => {
            const plant = item.plant || item;
            return (
              <div
                key={item.id || plant.id || plant.slug}
                className="herbora-card flex flex-col justify-between overflow-hidden p-5 bg-[#FAF8F2] border border-[#E2DDD0] rounded-2xl hover:shadow-md transition-all"
              >
                <div>
                  {/* Top Bar: Category & Remove Button */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#DDE5C9] text-[#174B2B]">
                      {plant.category || 'Herb'}
                    </span>
                    <button
                      onClick={() => onRemovePlant(plant.id || plant.slug)}
                      className="p-1.5 rounded-lg border border-[#F5C2BC] bg-[#FDF2F0] text-[#9E2B25] hover:bg-[#FBE7E5] transition-colors"
                      title="Remove from My Plant DB"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Thumbnail Image */}
                  <div className="w-full h-44 rounded-xl overflow-hidden mb-4 border border-[#E2DDD0] bg-white">
                    <img 
                      src={plant.image_url || '/assets/herbal-wellness.jpg'} 
                      alt={plant.common_name} 
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  {/* Titles */}
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

                  <p className="text-xs text-[#3B4E41] line-clamp-3 leading-relaxed mt-2.5">
                    {plant.description}
                  </p>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 mt-4 border-t border-[#EAE6DC] flex items-center justify-between">
                  <button
                    onClick={() => onSelectPlant(plant)}
                    className="herbora-btn-primary text-xs py-2 px-4"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] text-[#637869]">
                    Saved Collection
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
