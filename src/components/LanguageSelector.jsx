import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe, ChevronDown } from 'lucide-react'

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' }
]

const getFontFamily = (code) => {
  switch (code) {
    case 'ar': return "'Noto Sans Arabic', 'Arial Unicode MS', sans-serif"
    case 'zh': return "'Noto Sans SC', 'PingFang SC', 'Hiragino Sans GB', sans-serif"
    case 'ja': return "'Noto Sans JP', 'Hiragino Kaku Gothic Pro', 'Yu Gothic', sans-serif"
    case 'hi': return "'Noto Sans Devanagari', 'Mangal', sans-serif"
    case 'ru': return "'Noto Sans', 'Roboto', sans-serif"
    default: return "system-ui, -apple-system, sans-serif"
  }
}

const LanguageSelector = () => {
  const { i18n, t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0]

  const handleLanguageChange = (languageCode, e) => {
    e.stopPropagation()
    i18n.changeLanguage(languageCode)
    setIsOpen(false)
  }

  const toggleDropdown = (e) => {
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <div className="relative flex items-center" ref={dropdownRef}>
      <button
        className="flex items-center justify-between gap-xs p-xs md:px-sm py-xs bg-glass-surface border border-glass-border rounded-md text-primary text-[0.875rem] font-medium cursor-pointer transition-all duration-300 min-w-[70px] md:min-w-[80px] hover:bg-glass-hover hover:border-accent-purple hover:shadow-[0_0_10px_rgba(138,43,226,0.2)] focus:outline-[2px] focus:outline-accent-purple focus:outline-offset-2 data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10 data-[theme=light]:text-primary data-[theme=light]:hover:bg-white data-[theme=light]:hover:border-accent-purple data-[theme=light]:hover:shadow-[0_0_10px_rgba(138,43,226,0.15)] flex-row rtl:flex-row-reverse"
        onClick={toggleDropdown}
        aria-label={t('accessibility.toggleLanguage')}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe size={16} />
        <span className="font-semibold tracking-[0.5px] text-[0.8rem] md:text-[0.875rem] uppercase">{currentLanguage.code}</span>
        <ChevronDown 
          size={14} 
          className={`shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div 
          className="absolute top-[calc(100%+0.5rem)] right-0 min-w-[180px] max-w-[240px] md:min-w-[200px] md:max-w-[280px] bg-bg-secondary border border-glass-border rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.3)] backdrop-blur-[20px] z-[1000] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 data-[theme=light]:bg-white/95 data-[theme=light]:border-black/10 data-[theme=light]:shadow-[0_10px_40px_rgba(0,0,0,0.15)] max-md:fixed max-md:top-auto max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:min-w-full max-md:max-w-full max-md:rounded-t-lg max-md:rounded-b-none max-md:slide-in-from-bottom-full max-md:fade-in max-md:zoom-in-95 rtl:right-auto rtl:left-0" 
          role="listbox"
        >
          {languages.map((language) => {
            const isActive = language.code === i18n.language
            return (
              <button
                key={language.code}
                className={`flex items-center justify-between w-full p-md md:px-md md:py-sm bg-transparent border-none max-md:border-b max-md:border-glass-border max-md:last:border-none text-primary cursor-pointer transition-all duration-200 text-left hover:bg-glass-hover focus:outline-none focus:bg-glass-hover data-[theme=light]:hover:bg-black/5 data-[theme=light]:focus:bg-black/5 rtl:flex-row-reverse rtl:text-right ${isActive ? 'bg-[#8a2be2]/10 text-accent-purple data-[theme=light]:bg-[#8a2be2]/10 data-[theme=light]:text-accent-purple' : ''}`}
                onClick={(e) => handleLanguageChange(language.code, e)}
                role="option"
                aria-selected={isActive}
              >
                <div className="flex flex-col gap-[0.125rem] flex-1">
                  <span className="text-[0.8rem] md:text-[0.875rem] font-medium leading-[1.2]">{language.name}</span>
                  <span 
                    className="text-[0.7rem] md:text-[0.75rem] text-secondary leading-[1.2] data-[theme=light]:text-secondary" 
                    style={{ fontFamily: getFontFamily(language.code) }}
                    lang={language.code}
                    dir={language.code === 'ar' ? 'rtl' : 'ltr'}
                  >
                    {language.nativeName}
                  </span>
                </div>
                {isActive && (
                  <div className="text-accent-purple font-semibold text-[0.875rem] ml-sm rtl:ml-0 rtl:mr-sm">✓</div>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default LanguageSelector