import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translation files
import en from './locales/en.json'
import hi from './locales/hi.json'
import es from './locales/es.json'
import fr from './locales/fr.json'
import ar from './locales/ar.json'
import zh from './locales/zh.json'
import pt from './locales/pt.json'
import ru from './locales/ru.json'
import ja from './locales/ja.json'
import de from './locales/de.json'

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  es: { translation: es },
  fr: { translation: fr },
  ar: { translation: ar },
  zh: { translation: zh },
  pt: { translation: pt },
  ru: { translation: ru },
  ja: { translation: ja },
  de: { translation: de }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng'
    },

    interpolation: {
      escapeValue: false
    },

    react: {
      useSuspense: false
    }
  })

// Update document direction and lang attribute when language changes
i18n.on('languageChanged', (lng) => {
  const isRTL = lng === 'ar'
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
  document.documentElement.lang = lng
  
  // Update CSS custom property for RTL support
  document.documentElement.style.setProperty('--text-direction', isRTL ? 'rtl' : 'ltr')
})

export default i18n