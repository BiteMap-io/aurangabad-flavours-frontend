import { useEffect } from 'react'

const SITE_NAME = 'Aurangabad Flavors Guide'
const DEFAULT_DESC = 'Discover the best restaurants, cuisines, and food culture in Aurangabad. Curated by Institute of Hotel Management, MGM University.'
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&auto=format&fit=crop'
const SITE_URL = 'https://aurangabadflavors.com'

/**
 * useSEO — sets document title + all meta tags for a page.
 * @param {object} options
 * @param {string} options.title        — Page-specific title (without site name suffix)
 * @param {string} [options.description]
 * @param {string} [options.image]      — OG image URL
 * @param {string} [options.url]        — Canonical URL path e.g. "/explore"
 * @param {string} [options.type]       — OG type, defaults to "website"
 */
const useSEO = ({ title, description = DEFAULT_DESC, image = DEFAULT_IMAGE, url = '', type = 'website' }) => {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | IHM MGM University`
    const canonical = `${SITE_URL}${url}`

    // --- Title ---
    document.title = fullTitle

    const setMeta = (selector, value) => {
      let el = document.querySelector(selector)
      if (!el) {
        el = document.createElement('meta')
        const attr = selector.match(/\[(\w+)="([^"]+)"\]/)
        if (attr) el.setAttribute(attr[1], attr[2])
        document.head.appendChild(el)
      }
      el.setAttribute('content', value)
    }

    const setLink = (rel, href) => {
      let el = document.querySelector(`link[rel="${rel}"]`)
      if (!el) {
        el = document.createElement('link')
        el.setAttribute('rel', rel)
        document.head.appendChild(el)
      }
      el.setAttribute('href', href)
    }

    // --- Standard meta ---
    setMeta('meta[name="description"]', description)
    setMeta('meta[name="robots"]', 'index, follow')

    // --- Canonical ---
    setLink('canonical', canonical)

    // --- Open Graph ---
    setMeta('meta[property="og:title"]', fullTitle)
    setMeta('meta[property="og:description"]', description)
    setMeta('meta[property="og:image"]', image)
    setMeta('meta[property="og:url"]', canonical)
    setMeta('meta[property="og:type"]', type)
    setMeta('meta[property="og:site_name"]', SITE_NAME)
    setMeta('meta[property="og:locale"]', 'en_IN')

    // --- Twitter Card ---
    setMeta('meta[name="twitter:card"]', 'summary_large_image')
    setMeta('meta[name="twitter:title"]', fullTitle)
    setMeta('meta[name="twitter:description"]', description)
    setMeta('meta[name="twitter:image"]', image)
  }, [title, description, image, url, type])
}

export default useSEO
