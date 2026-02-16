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
import './Settings.css'

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
      <div className="settings">
        <div className="loading-state">
          <Loader size={48} className="spinner" />
          <p>Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="settings">
      <div className="page-header">
        <div className="header-content">
          <h1>Settings</h1>
          <p>Configure your website settings and preferences</p>
        </div>
        <button 
          className="btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <Loader size={20} className="spinner" /> : <Save size={20} />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="settings-grid">
        {/* General Settings */}
        <motion.div
          className="settings-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="card-header">
            <div className="card-icon">
              <SettingsIcon size={24} />
            </div>
            <div>
              <h2>General Settings</h2>
              <p>Basic website configuration</p>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="siteName">Site Name</label>
            <input
              id="siteName"
              type="text"
              value={settings.siteName}
              onChange={(e) => handleInputChange('siteName', e.target.value)}
              placeholder="Enter site name"
            />
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          className="settings-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="card-header">
            <div className="card-icon">
              <Mail size={24} />
            </div>
            <div>
              <h2>Contact Information</h2>
              <p>Your business contact details</p>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="contactEmail">Email Address</label>
            <div className="input-with-icon">
              <Mail size={20} />
              <input
                id="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                placeholder="contact@example.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="contactPhone">Phone Number</label>
            <div className="input-with-icon">
              <Phone size={20} />
              <input
                id="contactPhone"
                type="tel"
                value={settings.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <div className="input-with-icon">
              <MapPin size={20} />
              <textarea
                id="address"
                value={settings.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter your business address"
                rows="3"
              />
            </div>
          </div>
        </motion.div>

        {/* Social Media */}
        <motion.div
          className="settings-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="card-header">
            <div className="card-icon">
              <Globe size={24} />
            </div>
            <div>
              <h2>Social Media</h2>
              <p>Your social media profiles</p>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="facebook">Facebook URL</label>
            <div className="input-with-icon">
              <Facebook size={20} />
              <input
                id="facebook"
                type="url"
                value={settings.socialMedia.facebook}
                onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                placeholder="https://facebook.com/yourpage"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="instagram">Instagram URL</label>
            <div className="input-with-icon">
              <Instagram size={20} />
              <input
                id="instagram"
                type="url"
                value={settings.socialMedia.instagram}
                onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                placeholder="https://instagram.com/yourprofile"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="twitter">Twitter URL</label>
            <div className="input-with-icon">
              <Twitter size={20} />
              <input
                id="twitter"
                type="url"
                value={settings.socialMedia.twitter}
                onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                placeholder="https://twitter.com/yourhandle"
              />
            </div>
          </div>
        </motion.div>

        {/* Feature Toggles */}
        <motion.div
          className="settings-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="card-header">
            <div className="card-icon">
              <SettingsIcon size={24} />
            </div>
            <div>
              <h2>Feature Settings</h2>
              <p>Control website features and sections</p>
            </div>
          </div>

          <div className="toggle-group">
            <div className="toggle-item">
              <div className="toggle-info">
                <h4>Welcome Intro</h4>
                <p>Show welcome animation on first visit</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.features.showWelcomeIntro}
                  onChange={(e) => handleFeatureChange('showWelcomeIntro', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="toggle-item">
              <div className="toggle-info">
                <h4>Featured Section</h4>
                <p>Display featured restaurants on homepage</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.features.showFeaturedSection}
                  onChange={(e) => handleFeatureChange('showFeaturedSection', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="toggle-item">
              <div className="toggle-info">
                <h4>Top Picks</h4>
                <p>Show top picks section</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.features.showTopPicks}
                  onChange={(e) => handleFeatureChange('showTopPicks', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="toggle-item">
              <div className="toggle-info">
                <h4>Tourist Mode</h4>
                <p>Enable tourist mode toggle in navigation</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.features.enableTouristMode}
                  onChange={(e) => handleFeatureChange('enableTouristMode', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Settings