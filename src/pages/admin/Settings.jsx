import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Save, 
  Settings as SettingsIcon, 
  Globe, 
  Mail, 
  Phone, 
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Loader
} from 'lucide-react'
import { settingsApi } from '../../services/adminApi'
import { showToast } from '../../components/admin/Toast'

const Settings = () => {
  const [settings, setSettings] = useState({
    siteName: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: ''
    },
    features: {
      showWelcomeIntro: true,
      showFeaturedSection: true,
      showTopPicks: true,
      enableTouristMode: true
    }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const response = await settingsApi.get()
      const data = response.data || response
      if (data && typeof data === 'object') {
        setSettings(data)
      } else {
        showToast.error('Error', 'Failed to load settings')
      }
    } catch (error) {
      showToast.error('Error', 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await settingsApi.update(settings)
      if (response.success || response) {
        showToast.success('Success', 'Settings saved successfully')
      } else {
        showToast.error('Error', 'Failed to save settings')
      }
    } catch (error) {
      showToast.error('Error', 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSocialMediaChange = (platform, value) => {
    setSettings(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }))
  }

  const handleFeatureChange = (feature, value) => {
    setSettings(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: value
      }
    }))
  }

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif]">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center text-gray-500 data-[theme=light]:text-gray-500">
          <Loader size={48} className="animate-spin mb-4 text-purple-500" />
          <p className="m-0 text-[1rem]">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif]">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4 max-md:flex-col max-md:items-stretch">
        <div className="max-md:text-center">
          <h1 className="text-[1.75rem] font-bold text-gray-100 m-0 mb-1 max-[480px]:text-[1.5rem] data-[theme=light]:text-gray-900">Settings</h1>
          <p className="text-gray-500 m-0 data-[theme=light]:text-gray-600">Configure your website settings and preferences</p>
        </div>
        <button 
          className="inline-flex items-center justify-center gap-1.5 py-2 px-6 bg-gradient-to-br from-purple-500 to-[#9b59b6] border-none rounded-lg text-white font-semibold cursor-pointer transition-all duration-300 hover:not(:disabled):-translate-y-[2px] shadow-[0_4px_10px_rgba(138,43,226,0.2)] hover:not(:disabled):shadow-[0_8px_25px_rgba(138,43,226,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <Loader size={20} className="animate-spin" /> : <Save size={20} />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-8 max-md:grid-cols-1 max-md:gap-6">
        
        {/* General Settings */}
        <motion.div
          className="bg-white/5 border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)] data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10 data-[theme=light]:hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)] max-[480px]:p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/10 data-[theme=light]:border-black/10 max-[480px]:flex-col max-[480px]:text-center max-[480px]:gap-2 max-[480px]:pb-2 max-[480px]:mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-[#9b59b6] flex items-center justify-center text-white shrink-0">
              <SettingsIcon size={24} />
            </div>
            <div>
              <h2 className="text-[1.25rem] font-semibold text-gray-100 m-0 mb-1 data-[theme=light]:text-gray-900">General Settings</h2>
              <p className="text-[0.9rem] text-gray-500 m-0">Basic website configuration</p>
            </div>
          </div>

          <div className="mb-6 last:mb-0 max-[480px]:mb-4">
            <label htmlFor="siteName" className="block text-[0.9rem] font-semibold text-gray-100 mb-2 data-[theme=light]:text-gray-900">Site Name</label>
            <input
              id="siteName"
              type="text"
              value={settings.siteName}
              onChange={(e) => handleInputChange('siteName', e.target.value)}
              placeholder="Enter site name"
              className="w-full p-3.5 bg-white/5 border border-white/10 rounded-lg text-gray-100 text-[0.95rem] outline-none transition-all duration-300 focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(138,43,226,0.1)] placeholder-gray-500 data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10 data-[theme=light]:text-gray-900"
            />
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          className="bg-white/5 border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)] data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10 data-[theme=light]:hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)] max-[480px]:p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/10 data-[theme=light]:border-black/10 max-[480px]:flex-col max-[480px]:text-center max-[480px]:gap-2 max-[480px]:pb-2 max-[480px]:mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-[#9b59b6] flex items-center justify-center text-white shrink-0">
              <Mail size={24} />
            </div>
            <div>
              <h2 className="text-[1.25rem] font-semibold text-gray-100 m-0 mb-1 data-[theme=light]:text-gray-900">Contact Information</h2>
              <p className="text-[0.9rem] text-gray-500 m-0">Your business contact details</p>
            </div>
          </div>

          <div className="mb-6 last:mb-0 max-[480px]:mb-4">
            <label htmlFor="contactEmail" className="block text-[0.9rem] font-semibold text-gray-100 mb-2 data-[theme=light]:text-gray-900">Email Address</label>
            <div className="relative">
              <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input
                id="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                placeholder="contact@example.com"
                className="w-full p-3.5 pl-11 bg-white/5 border border-white/10 rounded-lg text-gray-100 text-[0.95rem] outline-none transition-all duration-300 focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(138,43,226,0.1)] placeholder-gray-500 data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10 data-[theme=light]:text-gray-900"
              />
            </div>
          </div>

          <div className="mb-6 last:mb-0 max-[480px]:mb-4">
            <label htmlFor="contactPhone" className="block text-[0.9rem] font-semibold text-gray-100 mb-2 data-[theme=light]:text-gray-900">Phone Number</label>
            <div className="relative">
              <Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input
                id="contactPhone"
                type="tel"
                value={settings.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full p-3.5 pl-11 bg-white/5 border border-white/10 rounded-lg text-gray-100 text-[0.95rem] outline-none transition-all duration-300 focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(138,43,226,0.1)] placeholder-gray-500 data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10 data-[theme=light]:text-gray-900"
              />
            </div>
          </div>

          <div className="mb-6 last:mb-0 max-[480px]:mb-4">
            <label htmlFor="address" className="block text-[0.9rem] font-semibold text-gray-100 mb-2 data-[theme=light]:text-gray-900">Address</label>
            <div className="relative">
              <MapPin size={20} className="absolute left-4 top-6 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <textarea
                id="address"
                value={settings.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter your business address"
                rows="3"
                className="w-full p-3.5 pl-11 bg-white/5 border border-white/10 rounded-lg text-gray-100 text-[0.95rem] outline-none transition-all duration-300 resize-y focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(138,43,226,0.1)] placeholder-gray-500 data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10 data-[theme=light]:text-gray-900"
              />
            </div>
          </div>
        </motion.div>

        {/* Social Media */}
        <motion.div
          className="bg-white/5 border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)] data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10 data-[theme=light]:hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)] max-[480px]:p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/10 data-[theme=light]:border-black/10 max-[480px]:flex-col max-[480px]:text-center max-[480px]:gap-2 max-[480px]:pb-2 max-[480px]:mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-[#9b59b6] flex items-center justify-center text-white shrink-0">
              <Globe size={24} />
            </div>
            <div>
              <h2 className="text-[1.25rem] font-semibold text-gray-100 m-0 mb-1 data-[theme=light]:text-gray-900">Social Media</h2>
              <p className="text-[0.9rem] text-gray-500 m-0">Your social media profiles</p>
            </div>
          </div>

          <div className="mb-6 last:mb-0 max-[480px]:mb-4">
            <label htmlFor="facebook" className="block text-[0.9rem] font-semibold text-gray-100 mb-2 data-[theme=light]:text-gray-900">Facebook URL</label>
            <div className="relative">
              <Facebook size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input
                id="facebook"
                type="url"
                value={settings.socialMedia.facebook}
                onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                placeholder="https://facebook.com/yourpage"
                className="w-full p-3.5 pl-11 bg-white/5 border border-white/10 rounded-lg text-gray-100 text-[0.95rem] outline-none transition-all duration-300 focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(138,43,226,0.1)] placeholder-gray-500 data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10 data-[theme=light]:text-gray-900"
              />
            </div>
          </div>

          <div className="mb-6 last:mb-0 max-[480px]:mb-4">
            <label htmlFor="instagram" className="block text-[0.9rem] font-semibold text-gray-100 mb-2 data-[theme=light]:text-gray-900">Instagram URL</label>
            <div className="relative">
              <Instagram size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input
                id="instagram"
                type="url"
                value={settings.socialMedia.instagram}
                onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                placeholder="https://instagram.com/yourprofile"
                className="w-full p-3.5 pl-11 bg-white/5 border border-white/10 rounded-lg text-gray-100 text-[0.95rem] outline-none transition-all duration-300 focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(138,43,226,0.1)] placeholder-gray-500 data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10 data-[theme=light]:text-gray-900"
              />
            </div>
          </div>

          <div className="mb-6 last:mb-0 max-[480px]:mb-4">
            <label htmlFor="twitter" className="block text-[0.9rem] font-semibold text-gray-100 mb-2 data-[theme=light]:text-gray-900">Twitter URL</label>
            <div className="relative">
              <Twitter size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input
                id="twitter"
                type="url"
                value={settings.socialMedia.twitter}
                onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                placeholder="https://twitter.com/yourhandle"
                className="w-full p-3.5 pl-11 bg-white/5 border border-white/10 rounded-lg text-gray-100 text-[0.95rem] outline-none transition-all duration-300 focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(138,43,226,0.1)] placeholder-gray-500 data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10 data-[theme=light]:text-gray-900"
              />
            </div>
          </div>
        </motion.div>

        {/* Feature Toggles */}
        <motion.div
          className="bg-white/5 border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)] data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10 data-[theme=light]:hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)] max-[480px]:p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/10 data-[theme=light]:border-black/10 max-[480px]:flex-col max-[480px]:text-center max-[480px]:gap-2 max-[480px]:pb-2 max-[480px]:mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-[#9b59b6] flex items-center justify-center text-white shrink-0">
              <SettingsIcon size={24} />
            </div>
            <div>
              <h2 className="text-[1.25rem] font-semibold text-gray-100 m-0 mb-1 data-[theme=light]:text-gray-900">Feature Settings</h2>
              <p className="text-[0.9rem] text-gray-500 m-0">Control website features and sections</p>
            </div>
          </div>

          <div className="flex flex-col gap-6 max-[480px]:gap-4">
            <div className="flex items-center justify-between gap-4 p-4 bg-black/20 border border-white/10 rounded-lg transition-all duration-300 hover:bg-white/10 data-[theme=light]:bg-white/80 data-[theme=light]:border-black/10 data-[theme=light]:hover:bg-white max-md:flex-col max-md:items-start max-md:gap-2 max-[480px]:p-3">
              <div>
                <h4 className="text-[1rem] font-semibold text-gray-100 m-0 mb-1 data-[theme=light]:text-gray-900">Welcome Intro</h4>
                <p className="text-[0.85rem] text-gray-500 m-0">Show welcome animation on first visit</p>
              </div>
              <label className="relative inline-block w-[50px] h-[28px] shrink-0 max-md:self-end">
                <input
                  className="opacity-0 w-0 h-0 peer"
                  type="checkbox"
                  checked={settings.features.showWelcomeIntro}
                  onChange={(e) => handleFeatureChange('showWelcomeIntro', e.target.checked)}
                />
                <span className="absolute inset-0 cursor-pointer bg-white/10 border-none rounded-full transition-all duration-300 peer-checked:bg-purple-500 data-[theme=light]:bg-black/20 after:absolute after:content-[''] after:h-[20px] after:w-[20px] after:left-[4px] after:bottom-[4px] after:bg-white after:rounded-full after:transition-transform after:duration-300 after:shadow-[0_2px_4px_rgba(0,0,0,0.2)] peer-checked:after:translate-x-[22px]"></span>
              </label>
            </div>

            <div className="flex items-center justify-between gap-4 p-4 bg-black/20 border border-white/10 rounded-lg transition-all duration-300 hover:bg-white/10 data-[theme=light]:bg-white/80 data-[theme=light]:border-black/10 data-[theme=light]:hover:bg-white max-md:flex-col max-md:items-start max-md:gap-2 max-[480px]:p-3">
              <div>
                <h4 className="text-[1rem] font-semibold text-gray-100 m-0 mb-1 data-[theme=light]:text-gray-900">Featured Section</h4>
                <p className="text-[0.85rem] text-gray-500 m-0">Display featured restaurants on homepage</p>
              </div>
              <label className="relative inline-block w-[50px] h-[28px] shrink-0 max-md:self-end">
                <input
                  className="opacity-0 w-0 h-0 peer"
                  type="checkbox"
                  checked={settings.features.showFeaturedSection}
                  onChange={(e) => handleFeatureChange('showFeaturedSection', e.target.checked)}
                />
                <span className="absolute inset-0 cursor-pointer bg-white/10 border-none rounded-full transition-all duration-300 peer-checked:bg-purple-500 data-[theme=light]:bg-black/20 after:absolute after:content-[''] after:h-[20px] after:w-[20px] after:left-[4px] after:bottom-[4px] after:bg-white after:rounded-full after:transition-transform after:duration-300 after:shadow-[0_2px_4px_rgba(0,0,0,0.2)] peer-checked:after:translate-x-[22px]"></span>
              </label>
            </div>

            <div className="flex items-center justify-between gap-4 p-4 bg-black/20 border border-white/10 rounded-lg transition-all duration-300 hover:bg-white/10 data-[theme=light]:bg-white/80 data-[theme=light]:border-black/10 data-[theme=light]:hover:bg-white max-md:flex-col max-md:items-start max-md:gap-2 max-[480px]:p-3">
              <div>
                <h4 className="text-[1rem] font-semibold text-gray-100 m-0 mb-1 data-[theme=light]:text-gray-900">Top Picks</h4>
                <p className="text-[0.85rem] text-gray-500 m-0">Show top picks section</p>
              </div>
              <label className="relative inline-block w-[50px] h-[28px] shrink-0 max-md:self-end">
                <input
                  className="opacity-0 w-0 h-0 peer"
                  type="checkbox"
                  checked={settings.features.showTopPicks}
                  onChange={(e) => handleFeatureChange('showTopPicks', e.target.checked)}
                />
                <span className="absolute inset-0 cursor-pointer bg-white/10 border-none rounded-full transition-all duration-300 peer-checked:bg-purple-500 data-[theme=light]:bg-black/20 after:absolute after:content-[''] after:h-[20px] after:w-[20px] after:left-[4px] after:bottom-[4px] after:bg-white after:rounded-full after:transition-transform after:duration-300 after:shadow-[0_2px_4px_rgba(0,0,0,0.2)] peer-checked:after:translate-x-[22px]"></span>
              </label>
            </div>

            <div className="flex items-center justify-between gap-4 p-4 bg-black/20 border border-white/10 rounded-lg transition-all duration-300 hover:bg-white/10 data-[theme=light]:bg-white/80 data-[theme=light]:border-black/10 data-[theme=light]:hover:bg-white max-md:flex-col max-md:items-start max-md:gap-2 max-[480px]:p-3">
              <div>
                <h4 className="text-[1rem] font-semibold text-gray-100 m-0 mb-1 data-[theme=light]:text-gray-900">Tourist Mode</h4>
                <p className="text-[0.85rem] text-gray-500 m-0">Enable tourist mode toggle in navigation</p>
              </div>
              <label className="relative inline-block w-[50px] h-[28px] shrink-0 max-md:self-end">
                <input
                  className="opacity-0 w-0 h-0 peer"
                  type="checkbox"
                  checked={settings.features.enableTouristMode}
                  onChange={(e) => handleFeatureChange('enableTouristMode', e.target.checked)}
                />
                <span className="absolute inset-0 cursor-pointer bg-white/10 border-none rounded-full transition-all duration-300 peer-checked:bg-purple-500 data-[theme=light]:bg-black/20 after:absolute after:content-[''] after:h-[20px] after:w-[20px] after:left-[4px] after:bottom-[4px] after:bg-white after:rounded-full after:transition-transform after:duration-300 after:shadow-[0_2px_4px_rgba(0,0,0,0.2)] peer-checked:after:translate-x-[22px]"></span>
              </label>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Settings