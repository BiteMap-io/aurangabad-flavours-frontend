import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Info, Phone, Utensils, RotateCcw } from 'lucide-react'
import { getPageContent, savePageContent, getDefaults } from '../../hooks/usePageContent'
import { showToast } from '../../components/admin/Toast'

const TABS = [
  { id: 'about',       label: 'About',        icon: Info },
  { id: 'contact',     label: 'Contact',      icon: Phone },
  { id: 'foodculture', label: 'Food Culture', icon: Utensils },
]

const inputCls = 'w-full bg-black/30 border border-white/10 rounded-xl py-2.5 px-4 text-white text-[0.9rem] focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 data-[theme=light]:bg-white data-[theme=light]:text-gray-900 data-[theme=light]:border-black/20 resize-y'
const labelCls = 'block text-[0.82rem] text-gray-400 font-medium mb-1'

const Field = ({ label, value, onChange, multiline = false, rows = 3 }) => (
  <div className="flex flex-col mb-4">
    <label className={labelCls}>{label}</label>
    {multiline
      ? <textarea className={inputCls} rows={rows} value={value} onChange={e => onChange(e.target.value)} />
      : <input className={inputCls} value={value} onChange={e => onChange(e.target.value)} />
    }
  </div>
)

// ── About form ────────────────────────────────────────────────────────────────
const AboutForm = ({ data, onChange }) => (
  <>
    <Field label="Page Title" value={data.title} onChange={v => onChange('title', v)} />
    <Field label="Subtitle" value={data.subtitle} onChange={v => onChange('subtitle', v)} multiline rows={2} />
    <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
      <div>
        <Field label="Section 1 Title" value={data.section1Title} onChange={v => onChange('section1Title', v)} />
        <Field label="Section 1 Content" value={data.section1Content} onChange={v => onChange('section1Content', v)} multiline rows={4} />
      </div>
      <div>
        <Field label="Section 2 Title" value={data.section2Title} onChange={v => onChange('section2Title', v)} />
        <Field label="Section 2 Content" value={data.section2Content} onChange={v => onChange('section2Content', v)} multiline rows={4} />
      </div>
    </div>
  </>
)

// ── Contact form ──────────────────────────────────────────────────────────────
const ContactForm = ({ data, onChange }) => (
  <>
    <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
      <Field label="Page Title" value={data.title} onChange={v => onChange('title', v)} />
      <Field label="Subtitle" value={data.subtitle} onChange={v => onChange('subtitle', v)} />
    </div>
    <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
      <Field label="Email" value={data.email} onChange={v => onChange('email', v)} />
      <Field label="Phone" value={data.phone} onChange={v => onChange('phone', v)} />
    </div>
    <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
      <Field label="Location" value={data.location} onChange={v => onChange('location', v)} />
      <Field label="Support Hours" value={data.hours} onChange={v => onChange('hours', v)} />
    </div>
    <p className="text-[0.78rem] text-gray-500 mb-3 mt-1">FAQ Section</p>
    <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
      <div>
        <Field label="FAQ 1 Question" value={data.faq1Q} onChange={v => onChange('faq1Q', v)} />
        <Field label="FAQ 1 Answer" value={data.faq1A} onChange={v => onChange('faq1A', v)} multiline rows={2} />
      </div>
      <div>
        <Field label="FAQ 2 Question" value={data.faq2Q} onChange={v => onChange('faq2Q', v)} />
        <Field label="FAQ 2 Answer" value={data.faq2A} onChange={v => onChange('faq2A', v)} multiline rows={2} />
      </div>
      <div>
        <Field label="FAQ 3 Question" value={data.faq3Q} onChange={v => onChange('faq3Q', v)} />
        <Field label="FAQ 3 Answer" value={data.faq3A} onChange={v => onChange('faq3A', v)} multiline rows={2} />
      </div>
    </div>
  </>
)

// ── Food Culture form ─────────────────────────────────────────────────────────
const FoodCultureForm = ({ data, onChange }) => (
  <>
    <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
      <Field label="Hero Title" value={data.heroTitle} onChange={v => onChange('heroTitle', v)} />
      <Field label="Hero Subtitle" value={data.heroSubtitle} onChange={v => onChange('heroSubtitle', v)} />
    </div>
    <p className="text-[0.78rem] text-gray-500 mb-3 mt-1">Main Sections</p>
    <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
      {[1,2,3].map(n => (
        <div key={n}>
          <Field label={`Section ${n} Title`} value={data[`section${n}Title`]} onChange={v => onChange(`section${n}Title`, v)} />
          <Field label={`Section ${n} Content`} value={data[`section${n}Content`]} onChange={v => onChange(`section${n}Content`, v)} multiline rows={4} />
        </div>
      ))}
    </div>
    <p className="text-[0.78rem] text-gray-500 mb-3 mt-1">Cultural Highlights</p>
    <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
      {[1,2,3].map(n => (
        <div key={n}>
          <Field label={`Highlight ${n} Title`} value={data[`highlight${n}Title`]} onChange={v => onChange(`highlight${n}Title`, v)} />
          <Field label={`Highlight ${n} Content`} value={data[`highlight${n}Content`]} onChange={v => onChange(`highlight${n}Content`, v)} multiline rows={3} />
        </div>
      ))}
    </div>
  </>
)

// ── Main component ────────────────────────────────────────────────────────────
const PagesManagement = () => {
  const [activeTab, setActiveTab] = useState('about')
  const [data, setData] = useState({
    about:       getPageContent('about'),
    contact:     getPageContent('contact'),
    foodculture: getPageContent('foodculture'),
  })

  const handleChange = (page, field, value) => {
    setData(prev => ({ ...prev, [page]: { ...prev[page], [field]: value } }))
  }

  const handleSave = () => {
    savePageContent(activeTab, data[activeTab])
    showToast.success('Saved', `${TABS.find(t => t.id === activeTab)?.label} page updated successfully`)
  }

  const handleReset = () => {
    const defaults = getDefaults(activeTab)
    setData(prev => ({ ...prev, [activeTab]: defaults }))
    savePageContent(activeTab, defaults)
    showToast.success('Reset', 'Page content reset to defaults')
  }

  return (
    <div className="max-w-[1200px] mx-auto font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-[1.75rem] font-bold text-gray-100 m-0 mb-1 data-[theme=light]:text-gray-900">Pages Management</h1>
          <p className="text-gray-500 m-0">Edit content for About, Contact and Food Culture pages</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleReset}
            className="flex items-center gap-2 py-2 px-4 bg-transparent border border-white/10 rounded-lg text-gray-400 text-sm font-medium cursor-pointer hover:bg-white/5 hover:text-white transition-all">
            <RotateCcw size={16} /> Reset
          </button>
          <button onClick={handleSave}
            className="flex items-center gap-2 py-2 px-5 bg-gradient-to-br from-purple-500 to-purple-700 border-none rounded-lg text-white font-semibold cursor-pointer hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(168,85,247,0.3)] transition-all">
            <Save size={16} /> Save Changes
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-white/10">
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2.5 px-4 text-[0.88rem] font-medium border-b-2 transition-all cursor-pointer bg-transparent
                ${activeTab === tab.id
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
              <Icon size={15} /> {tab.label}
            </button>
          )
        })}
      </div>

      {/* Form */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white/5 border border-white/10 rounded-2xl p-6 data-[theme=light]:bg-white/90 data-[theme=light]:border-black/10"
      >
        {activeTab === 'about' && (
          <AboutForm data={data.about} onChange={(f, v) => handleChange('about', f, v)} />
        )}
        {activeTab === 'contact' && (
          <ContactForm data={data.contact} onChange={(f, v) => handleChange('contact', f, v)} />
        )}
        {activeTab === 'foodculture' && (
          <FoodCultureForm data={data.foodculture} onChange={(f, v) => handleChange('foodculture', f, v)} />
        )}
      </motion.div>
    </div>
  )
}

export default PagesManagement
