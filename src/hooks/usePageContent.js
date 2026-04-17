/**
 * usePageContent — reads/writes page content from localStorage.
 * Keys: 'page_about', 'page_contact', 'page_foodculture'
 */

const DEFAULTS = {
  about: {
    title: 'About CSN',
    subtitle: 'Discover the rich heritage and culinary traditions of Chhatrapati Sambhajinagar',
    section1Title: 'Heritage & Culture',
    section1Content: 'Aurangabad, known as the "City of Gates," is a magnificent blend of Mughal architecture and Marathi culture. Home to the world-famous Ajanta and Ellora Caves, this historic city offers an incredible journey through time.',
    section2Title: 'Culinary Legacy',
    section2Content: "The city's food culture reflects its diverse heritage, from traditional Maharashtrian cuisine to Mughlai delicacies. Experience authentic flavors that have been passed down through generations.",
  },
  contact: {
    title: 'Contact & Help',
    subtitle: "Get in touch with us for any queries about CSN's culinary scene",
    email: 'info@csnflavors.com',
    phone: '+91 240 123 4567',
    location: 'Chhatrapati Sambhajinagar, Maharashtra, India',
    hours: 'Mon - Sat: 9:00 AM - 6:00 PM',
    faq1Q: 'How do I find restaurants near me?',
    faq1A: 'Use the "Near Me" button in the top navigation to discover restaurants based on your location.',
    faq2Q: 'Can I suggest a restaurant?',
    faq2A: "Yes! Send us an email with restaurant details and we'll review it for inclusion in our guide.",
    faq3Q: 'Are the restaurant timings accurate?',
    faq3A: 'We strive to keep all information updated, but we recommend calling ahead to confirm timings.',
  },
  foodculture: {
    heroTitle: 'CSN Food Culture',
    heroSubtitle: 'Explore the rich culinary heritage and traditions of Chhatrapati Sambhajinagar',
    section1Title: "CSN's Culinary Heritage",
    section1Content: "Chhatrapati Sambhajinagar, with its rich history and diverse population, boasts a unique culinary landscape that blends traditional Marathi flavors with influences from across India and the world.",
    section2Title: 'Traditional Dishes',
    section2Content: 'From the spicy Misal Pav to the sweet Puran Poli, CSN offers a wide array of traditional Maharashtrian dishes. The city is also known for its unique take on Mughlai cuisine.',
    section3Title: 'Modern Food Scene',
    section3Content: "Today, CSN's food scene is a vibrant mix of traditional eateries and modern restaurants. The city welcomes food lovers with everything from street food stalls to fine dining establishments.",
    highlight1Title: 'Festival Foods',
    highlight1Content: "Special dishes prepared during festivals like Ganesh Chaturthi, Diwali, and Eid showcase the city's diverse cultural celebrations.",
    highlight2Title: 'Street Food Culture',
    highlight2Content: "CSN's streets come alive with vendors offering everything from Vada Pav to Bhel Puri, creating a vibrant food culture.",
    highlight3Title: 'Restaurant Evolution',
    highlight3Content: 'The city has seen a transformation in its dining scene, with new restaurants bringing global cuisines while preserving local traditions.',
  },
}

export function getPageContent(page) {
  try {
    const stored = localStorage.getItem(`page_${page}`)
    if (stored) return { ...DEFAULTS[page], ...JSON.parse(stored) }
  } catch {}
  return DEFAULTS[page]
}

export function savePageContent(page, data) {
  localStorage.setItem(`page_${page}`, JSON.stringify(data))
}

export function getDefaults(page) {
  return DEFAULTS[page]
}
