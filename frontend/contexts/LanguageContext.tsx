import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'ID' | 'EN';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'ID',
  setLanguage: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('portfolio-language');
    return (stored === 'EN' || stored === 'ID') ? stored : 'ID';
  });

  const setLanguage = (lang: Language) => {
    localStorage.setItem('portfolio-language', lang);
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
