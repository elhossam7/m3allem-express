import { useTranslation } from 'react-i18next';

export const useLocalization = () => {
  const { t, i18n } = useTranslation();
  
  const currentLanguage = i18n.language;
  
  const switchLanguage = (lang: 'en' | 'fr' | 'ar') => {
    i18n.changeLanguage(lang);
    // Update document direction for Arabic
    document.dir = lang === 'ar' ? 'rtl' : 'ltr';
    // Save preference to localStorage
    localStorage.setItem('preferred-language', lang);
  };

  const isRTL = currentLanguage === 'ar';

  return {
    t,
    currentLanguage,
    switchLanguage,
    isRTL,
    languages: [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'fr', name: 'French', nativeName: 'Français' },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    ] as const,
  };
};
