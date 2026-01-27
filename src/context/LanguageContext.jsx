import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

const translations = {
  en: {
    home: 'Home',
    explore: 'Explore',
    articles: 'Articles',
    map: 'Map',
    cuisines: 'Cuisines',
    topPicks: 'Top Picks',
    events: 'Events',
    foodCulture: 'Food Culture',
    nearMe: 'Near Me',
    language: 'Language',
    aboutAurangabad: 'About Aurangabad',
    contact: 'Contact',
    // Add more translations as needed
  },
  hi: {
    home: 'होम',
    explore: 'खोजें',
    articles: 'लेख',
    map: 'नक्शा',
    cuisines: 'व्यंजन',
    topPicks: 'शीर्ष पसंद',
    events: 'कार्यक्रम',
    foodCulture: 'खाने की संस्कृति',
    nearMe: 'मेरे पास',
    language: 'भाषा',
    aboutAurangabad: 'औरंगाबाद के बारे में',
    contact: 'संपर्क',
  },
  mr: {
    home: 'होम',
    explore: 'शोधा',
    articles: 'लेख',
    map: 'नकाशा',
    cuisines: 'पाककृती',
    topPicks: 'शीर्ष निवड',
    events: 'कार्यक्रम',
    foodCulture: 'अन्न संस्कृती',
    nearMe: 'जवळ',
    language: 'भाषा',
    aboutAurangabad: 'औरंगाबादबद्दल',
    contact: 'संपर्क',
  },
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language')
    return saved || 'en'
  })

  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}


