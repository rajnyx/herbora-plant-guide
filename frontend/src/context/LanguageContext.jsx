import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, botanicalTranslations } from './translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem('herbora_language') || 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = (lang) => {
    const selected = lang === 'hi' ? 'hi' : 'en';
    setLanguageState(selected);
    try {
      localStorage.setItem('herbora_language', selected);
      document.documentElement.lang = selected;
    } catch (e) {
      console.warn('Could not persist language to localStorage:', e);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Deep dot-notation translation accessor: t('nav.plantopedia')
  const t = (path, fallback = '') => {
    if (!path) return fallback;
    const parts = path.split('.');
    let current = translations[language];
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        // Fallback to English if missing in Hindi
        let enCurrent = translations['en'];
        for (const enPart of parts) {
          if (enCurrent && typeof enCurrent === 'object' && enPart in enCurrent) {
            enCurrent = enCurrent[enPart];
          } else {
            return fallback || path;
          }
        }
        return enCurrent || fallback || path;
      }
    }
    return current !== undefined ? current : (fallback || path);
  };

  // Helper to dynamically localize plant cards & details from database
  const localizePlant = (plant) => {
    if (!plant) return plant;
    if (language !== 'hi') return plant;

    const slug = (plant.slug || '').toLowerCase();
    const translation = botanicalTranslations.plants[slug];
    if (!translation) return plant;

    return {
      ...plant,
      common_name: translation.common_name || plant.common_name,
      category: translation.category || plant.category,
      description: translation.description || plant.description,
      traditional_uses: translation.traditional_uses || plant.traditional_uses,
      plant_parts_used: translation.plant_parts_used || plant.plant_parts_used,
      safety_information: translation.safety_information || plant.safety_information
    };
  };

  // Helper to dynamically localize category names
  const localizeCategory = (category) => {
    if (!category || category === 'All') {
      return language === 'hi' ? 'सभी' : 'All';
    }
    if (language === 'hi' && botanicalTranslations.categories[category]) {
      return botanicalTranslations.categories[category].hi;
    }
    return category;
  };

  // Helper to localize myths
  const localizeMyth = (mythItem) => {
    if (!mythItem) return mythItem;
    if (language !== 'hi') return mythItem;
    const match = botanicalTranslations.myths.find((m) => m.id === mythItem.id);
    if (!match) return mythItem;
    return {
      ...mythItem,
      myth: match.myth,
      fact: match.fact
    };
  };

  // Helper to localize Dincharya routine
  const localizeDincharya = (dincharyaItem, index) => {
    if (!dincharyaItem) return dincharyaItem;
    if (language !== 'hi') return dincharyaItem;
    const match = botanicalTranslations.dincharya[index];
    if (!match) return dincharyaItem;
    return {
      ...dincharyaItem,
      time: match.time,
      title: match.title,
      text: match.text
    };
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        localizePlant,
        localizeCategory,
        localizeMyth,
        localizeDincharya,
        isHindi: language === 'hi'
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
