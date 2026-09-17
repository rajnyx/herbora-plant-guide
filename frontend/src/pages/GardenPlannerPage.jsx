import React, { useState, useEffect } from 'react';
import { Sprout, Sun, Droplets, CheckCircle2, Plus, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { fetchGardenPlants } from '../services/api';

export default function GardenPlannerPage() {
  const [gardenPlants, setGardenPlants] = useState([]);
  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem('herbora_reminders');
    return saved ? JSON.parse(saved) : [
      { id: 'rem-1', name: 'Water Balcony Tulsi', time: 'Morning (8:00 AM)', done: true },
      { id: 'rem-2', name: 'Mist Spearmint Pot', time: 'Evening (5:30 PM)', done: false },
      { id: 'rem-3', name: 'Check Aloe Vera Soil Dryness', time: 'Every Sunday', done: false }
    ];
  });
  const [newPlantName, setNewPlantName] = useState('');
  const [newPlantTime, setNewPlantTime] = useState('');

  useEffect(() => {
    fetchGardenPlants().then(setGardenPlants).catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem('herbora_reminders', JSON.stringify(reminders));
  }, [reminders]);

  const toggleDone = (id) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, done: !r.done } : r))
    );
  };

  const addReminder = (e) => {
    e.preventDefault();
    if (!newPlantName.trim()) return;

    const newRem = {
      id: `rem-${Date.now()}`,
      name: newPlantName.trim(),
      time: newPlantTime.trim() || 'Daily',
      done: false
    };

    setReminders((prev) => [newRem, ...prev]);
    setNewPlantName('');
    setNewPlantTime('');
  };

  const removeReminder = (id) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="max-w-2xl mb-10 herbora-rise">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#8DA56B] mb-2">
          <Sprout className="w-4 h-4" />
          <span>Home Apothecary Cultivation</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#174B2B] leading-tight">
          Home Garden Planner
        </h1>
        <p className="text-sm sm:text-base text-[#556B5D] mt-2 leading-relaxed">
          Nurture your personal Ayurvedic sanctuary. Keep track of watering rhythms, sunlight parameters, and harvesting guidance for household medicinal plants.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Plant Care Catalog */}
        <div className="lg:col-span-7 space-y-5">
          <h2 className="font-serif text-2xl font-bold text-[#174B2B]">
            Household Herbal Care Guides
          </h2>

          <div className="space-y-4">
            {gardenPlants.map((plant) => (
              <div
                key={plant.id}
                className="herbora-card p-5 bg-[#FAF8F2] border border-[#E2DDD0] rounded-2xl space-y-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{plant.emoji}</span>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#174B2B]">
                      {plant.name}
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#2D3E33] pt-1">
                  <div className="flex items-start gap-2 bg-white/70 p-2.5 rounded-xl border border-[#EAE6DC]">
                    <Sun className="w-4 h-4 text-[#8DA56B] shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-[#174B2B]">Sunlight:</strong>
                      <span>{plant.sunlight}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-white/70 p-2.5 rounded-xl border border-[#EAE6DC]">
                    <Droplets className="w-4 h-4 text-[#285D36] shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-[#174B2B]">Watering:</strong>
                      <span>{plant.watering}</span>
                    </div>
                  </div>
                </div>

                {plant.tips && (
                  <p className="text-xs text-[#556B5D] italic bg-[#DDE5C9]/40 p-2.5 rounded-xl">
                    Gardener Tip: {plant.tips}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Interactive Watering Reminders */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FAF8F2] border border-[#E2DDD0] rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-bold text-[#174B2B] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#8DA56B]" />
                <span>Watering Checklist</span>
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#DDE5C9] text-[#174B2B] font-semibold">
                {reminders.filter((r) => r.done).length}/{reminders.length} Done
              </span>
            </div>

            {/* Checklist items */}
            <div className="space-y-2.5">
              {reminders.map((rem) => (
                <div
                  key={rem.id}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    rem.done
                      ? 'bg-[#F0F7F2] border-[#8DA56B]/40 text-[#556B5D]'
                      : 'bg-white border-[#E2DDD0] text-[#174B2B]'
                  }`}
                >
                  <button
                    onClick={() => toggleDone(rem.id)}
                    className="flex items-center gap-3 text-left flex-1 cursor-pointer"
                  >
                    <CheckCircle2
                      className={`w-5 h-5 transition-colors ${
                        rem.done ? 'text-[#285D36]' : 'text-[#E2DDD0]'
                      }`}
                    />
                    <div>
                      <span className={`text-xs sm:text-sm font-medium ${rem.done ? 'line-through text-[#637869]' : ''}`}>
                        {rem.name}
                      </span>
                      <span className="block text-[11px] text-[#8DA56B]">{rem.time}</span>
                    </div>
                  </button>

                  <button
                    onClick={() => removeReminder(rem.id)}
                    className="p-1 text-[#8A9E8F] hover:text-[#9E2B25] transition-colors"
                    title="Delete Reminder"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Custom Reminder Form */}
            <form onSubmit={addReminder} className="pt-3 border-t border-[#EAE6DC] space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8DA56B] block">
                Add Plant Watering Task
              </span>
              <input
                type="text"
                value={newPlantName}
                onChange={(e) => setNewPlantName(e.target.value)}
                placeholder="e.g. Water Balcony Neem tree"
                className="w-full text-xs h-10 px-3 rounded-xl bg-white border border-[#E2DDD0] text-[#174B2B] outline-none focus:border-[#285D36]"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPlantTime}
                  onChange={(e) => setNewPlantTime(e.target.value)}
                  placeholder="Frequency (e.g. Every 2 days)"
                  className="flex-1 text-xs h-10 px-3 rounded-xl bg-white border border-[#E2DDD0] text-[#174B2B] outline-none focus:border-[#285D36]"
                />
                <button
                  type="submit"
                  disabled={!newPlantName.trim()}
                  className="herbora-btn-primary text-xs px-4 py-2 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
