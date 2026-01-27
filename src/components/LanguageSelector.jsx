import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe, ChevronDown } from 'lucide-react'
import './LanguageSelector.css'

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
    <div className="language-selector" ref={dropdownRef}>
      <button
        className="language-trigger"
        onClick={toggleDropdown}
        aria-label={t('accessibility.toggleLanguage')}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe size={16} />
        <span className="language-current">{currentLanguage.code.toUpperCase()}</span>
        <ChevronDown 
          size={14} 
          className={`language-chevron ${isOpen ? 'open' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="language-dropdown" role="listbox">
          {languages.map((language) => (
            <button
              key={language.code}
              className={`language-option ${language.code === i18n.language ? 'active' : ''}`}
              onClick={() => handleLanguageChange(language.code)}
              role="option"
              aria-selected={language.code === i18n.language}
            >
              <div className="language-info">
                <span className="language-name">{language.name}</span>
                <span className="language-native">{language.nativeName}</span>
              </div>
              {language.code === i18n.language && (
                <div className="language-check">✓</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguageSelector