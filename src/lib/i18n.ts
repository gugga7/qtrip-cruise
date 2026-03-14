import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { activeNiche } from '../config/niche';
import en from '../locales/en/common.json';
import fr from '../locales/fr/common.json';
import es from '../locales/es/common.json';

const savedLanguage = localStorage.getItem('qtrip-language');

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    es: { translation: es },
  },
  lng: savedLanguage ?? activeNiche.defaultLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React already escapes
  },
});

// Persist language choice
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('qtrip-language', lng);
});

export default i18n;
