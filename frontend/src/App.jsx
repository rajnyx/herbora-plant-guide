import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import NavigationDrawer from './components/NavigationDrawer';
import HeroSection from './components/HeroSection';
import FeatureCards from './components/FeatureCards';
import PlantDetailModal from './components/PlantDetailModal';
import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';
import ChatAssistant from './components/ChatAssistant';

import PlantopediaPage from './pages/PlantopediaPage';
import MyPlantDBPage from './pages/MyPlantDBPage';
import IdentifyPlantPage from './pages/IdentifyPlantPage';
import DailyWellnessPage from './pages/DailyWellnessPage';
import WellnessTipsPage from './pages/WellnessTipsPage';
import GardenPlannerPage from './pages/GardenPlannerPage';
import QuizPage from './pages/QuizPage';
import CommunityPage from './pages/CommunityPage';
import AboutPage from './pages/AboutPage';

import { 
  getCurrentUser, 
  subscribeToAuthChanges, 
  signOutUser, 
  fetchMySavedPlants, 
  savePlantToDb, 
  removePlantFromDb 
} from './services/api';

import { ArrowRight, Sparkles, Sprout, ShieldAlert, Heart, Calendar, HelpCircle, MessageSquare } from 'lucide-react';
import { useLanguage } from './context/LanguageContext';
import HerboraEmblem from './components/HerboraEmblem';

export default function App() {
  const { t, isHindi } = useLanguage();
  const [currentPage, setCurrentPage] = useState('home');
  const [pageParams, setPageParams] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [authModalInitialSignUp, setAuthModalInitialSignUp] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [savedPlants, setSavedPlants] = useState([]);
  const [savedPlantIds, setSavedPlantIds] = useState(new Set());
  const [notification, setNotification] = useState('');

  // Track Supabase Auth session
  useEffect(() => {
    getCurrentUser().then((user) => {
      setCurrentUser(user || null);
    });

    const unsubscribe = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  // Fetch user's saved plants whenever currentUser changes
  useEffect(() => {
    if (currentUser?.id) {
      fetchMySavedPlants(currentUser.id)
        .then((items) => {
          setSavedPlants(items);
          const ids = new Set();
          items.forEach((item) => {
            if (item.plant_id) ids.add(item.plant_id);
            if (item.plant?.id) ids.add(item.plant.id);
            if (item.plant?.slug) ids.add(item.plant.slug);
          });
          setSavedPlantIds(ids);
        })
        .catch(console.error);
    } else {
      setSavedPlants([]);
      setSavedPlantIds(new Set());
    }
  }, [currentUser]);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  const navigateTo = (pageId, params = {}) => {
    setCurrentPage(pageId);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSavePlant = async (plant) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      showToast('Please sign in to save plants to My Plant DB');
      return;
    }

    try {
      const plantId = plant.id || plant.slug;
      if (savedPlantIds.has(plantId) || savedPlantIds.has(plant.slug)) {
        showToast(`${plant.common_name} is already in your collection`);
        return;
      }

      await savePlantToDb(plantId, currentUser.id);
      setSavedPlantIds(new Set([...savedPlantIds, plantId, plant.slug]));
      const refreshed = await fetchMySavedPlants(currentUser.id);
      setSavedPlants(refreshed);
      showToast(`Added ${plant.common_name} to My Plant DB!`);
    } catch (err) {
      showToast(err.message || 'Could not save plant');
    }
  };

  const handleRemovePlant = async (plantId) => {
    if (!currentUser) return;
    try {
      await removePlantFromDb(plantId, currentUser.id);
      const updated = savedPlants.filter(
        (p) => (p.plant?.id !== plantId && p.plant?.slug !== plantId && p.plant_id !== plantId)
      );
      setSavedPlants(updated);
      const newIds = new Set();
      updated.forEach((item) => {
        if (item.plant_id) newIds.add(item.plant_id);
        if (item.plant?.id) newIds.add(item.plant.id);
        if (item.plant?.slug) newIds.add(item.plant.slug);
      });
      setSavedPlantIds(newIds);
      showToast('Removed from My Plant DB');
    } catch (err) {
      showToast('Could not remove plant');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setCurrentUser(null);
      setIsProfileOpen(false);
      showToast('Signed out successfully');
    } catch (err) {
      console.error(err);
    }
  };

  const openAuthModal = (signUp = false) => {
    setAuthModalInitialSignUp(signUp);
    setIsAuthOpen(true);
  };

  const handleSwitchAccount = async () => {
    setIsProfileOpen(false);
    try {
      await signOutUser();
      setCurrentUser(null);
      showToast('Signed out. Please sign in to your other account.');
    } catch (err) {
      console.error(err);
    }
    setTimeout(() => {
      openAuthModal(false);
    }, 150);
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-[#174B2B] relative">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-5 z-50 p-3 px-4 rounded-xl bg-[#174B2B] text-[#FAF8F2] shadow-xl text-xs sm:text-sm font-medium herbora-rise flex items-center gap-2">
          <Sprout className="w-4 h-4 text-[#8DA56B]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        currentUser={currentUser}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenAuth={() => openAuthModal(false)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenIdentify={() => navigateTo('identify')}
        onSelectPlant={(plant) => setSelectedPlant(plant)}
        setCurrentPage={navigateTo}
      />

      {/* Navigation Drawer */}
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentPage={currentPage}
        setCurrentPage={navigateTo}
        currentUser={currentUser}
        onOpenAuth={() => openAuthModal(false)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Dynamic Page Content */}
      <main className="flex-1 w-full">
        {currentPage === 'home' && (
          <div>
            {/* 5.3 Hero Section */}
            <HeroSection />

            {/* 6. Three Feature Cards */}
            <FeatureCards onNavigate={navigateTo} />
          </div>
        )}

        {currentPage === 'plantopedia' && (
          <PlantopediaPage
            initialSearch={pageParams.search || ''}
            onSelectPlant={(plant) => setSelectedPlant(plant)}
            savedPlantIds={savedPlantIds}
            onSavePlant={handleSavePlant}
          />
        )}

        {currentPage === 'my-plants' && (
          <MyPlantDBPage
            currentUser={currentUser}
            savedPlants={savedPlants}
            onRemovePlant={handleRemovePlant}
            onSelectPlant={(plant) => setSelectedPlant(plant)}
            onOpenAuth={() => setIsAuthOpen(true)}
            onNavigateToPlantopedia={() => navigateTo('plantopedia')}
          />
        )}

        {currentPage === 'identify' && (
          <IdentifyPlantPage
            currentUser={currentUser}
            onSelectPlant={(plant) => setSelectedPlant(plant)}
          />
        )}

        {currentPage === 'daily-wellness' && (
          <DailyWellnessPage />
        )}

        {currentPage === 'wellness-tips' && (
          <WellnessTipsPage />
        )}

        {currentPage === 'garden-planner' && (
          <GardenPlannerPage />
        )}

        {currentPage === 'quiz' && (
          <QuizPage />
        )}

        {currentPage === 'community' && (
          <CommunityPage 
            currentUser={currentUser} 
            onOpenAuth={() => openAuthModal(false)} 
          />
        )}

        {currentPage === 'about' && (
          <AboutPage />
        )}
      </main>

      {/* Plant Details Modal */}
      {selectedPlant && (
        <PlantDetailModal
          plant={selectedPlant}
          onClose={() => setSelectedPlant(null)}
          onSave={handleSavePlant}
          isSaved={savedPlantIds.has(selectedPlant.id) || savedPlantIds.has(selectedPlant.slug)}
          currentUser={currentUser}
        />
      )}

      {/* Supabase / Local Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        initialSignUp={authModalInitialSignUp}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Welcome back, ${user.full_name || user.email}!`);
        }}
      />

      {/* Dedicated User Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        savedPlantsCount={savedPlants.length}
        onNavigate={navigateTo}
        onSignOut={handleSignOut}
        onSwitchAccount={handleSwitchAccount}
      />

      {/* 8. Floating Herbora Assistant Button with Bot Avatar */}
      <ChatAssistant onExplorePlants={() => navigateTo('plantopedia')} />

      {/* Footer */}
      <footer className="w-full bg-[#FAF7EE] border-t border-[#D2CFBF] py-12 px-4 sm:px-8 lg:px-12 mt-16">
        <div className="max-w-[1450px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3.5">
            <HerboraEmblem 
              className="w-14 h-14" 
              alt="Official Herbora Logo" 
              showBorder={true}
            />
            <div>
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#174B2B]">{t('brand.name', 'Herbora')}</span>
              <p className="text-[11px] font-semibold text-[#8DA56B] tracking-widest uppercase">
                {t('brand.tagline', 'ANCIENT WISDOM • MODERN DISCOVERY')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-[#556B5D] font-medium">
            <button onClick={() => navigateTo('home')} className="hover:text-[#174B2B] transition-colors">{t('nav.home', 'Home')}</button>
            <button onClick={() => navigateTo('plantopedia')} className="hover:text-[#174B2B] transition-colors">{t('nav.plantopedia', 'Plantopedia')}</button>
            <button onClick={() => navigateTo('my-plants')} className="hover:text-[#174B2B] transition-colors">{t('nav.myPlants', 'My Plant DB')}</button>
            <button onClick={() => navigateTo('identify')} className="hover:text-[#174B2B] transition-colors">{t('nav.identify', 'Identify Plant')}</button>
            <button onClick={() => navigateTo('daily-wellness')} className="hover:text-[#174B2B] transition-colors">{t('nav.dailyWellness', 'Daily Wellness')}</button>
            <button onClick={() => navigateTo('quiz')} className="hover:text-[#174B2B] transition-colors">{t('nav.quiz', 'Quiz')}</button>
            <button onClick={() => navigateTo('about')} className="hover:text-[#174B2B] transition-colors">{t('nav.about', 'About & Disclaimer')}</button>
          </div>

          <p className="text-xs text-[#8A9E8F] text-center md:text-right">
            © {new Date().getFullYear()} Herbora • {isHindi ? 'प्राचीन ज्ञान • आधुनिक खोज' : 'Ancient Wisdom & Modern Discovery'}<br />
            {t('footer.disclaimer', 'Educational botanical reference.')}
          </p>
        </div>
      </footer>
    </div>
  );
}
