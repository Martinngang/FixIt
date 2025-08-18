import React, { createContext, useState } from 'react';
import en from '../assets/locales/en.json';
import fr from '../assets/locales/fr.json';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  translations: typeof en; // Use en.json type for translations
}

const translations: Record<string, typeof en> = { en, fr }; // Explicitly type translations

export const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  translations: en,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('en');

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translations: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};