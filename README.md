# Aurangabad Flavors Guide

A premium, production-grade tourism food guide website for Aurangabad, developed for **Institute of Hotel Management (IHM), MGM University, Aurangabad**.

## Features

- 🌙 **Dark Glassmorphism Design** - Modern, cinematic dark theme with glassmorphic UI elements
- 🧭 **Sticky Top Navigation** - Easy access to all sections
- 🏠 **Bento-Grid Home Dashboard** - Beautiful layout showcasing top restaurants and features
- 🔍 **Advanced Filtering** - Filter by cuisine, price, rating, area, facilities, and more
- 🗺️ **Map View** - Interactive map for restaurant discovery with area-based filtering
- ⭐ **Restaurant Details Modal** - Full-screen popup with complete restaurant information
- 🌍 **Multilingual Support** - English, Hindi, and Marathi
- 📱 **Responsive Design** - Works seamlessly on all devices
- ✨ **Smooth Animations** - ReactBits-inspired animations using Framer Motion

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **React Router** - Navigation
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **CSS3** - Styling with custom properties

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Navbar.jsx      # Top navigation bar
│   ├── Footer.jsx      # Footer component
│   ├── RestaurantCard.jsx
│   ├── RestaurantModal.jsx
│   └── FilterBar.jsx
├── pages/              # Page components
│   ├── Home.jsx
│   ├── Explore.jsx
│   ├── MapView.jsx
│   ├── Cuisines.jsx
│   ├── TopPicks.jsx
│   ├── Events.jsx
│   └── FoodCulture.jsx
├── context/            # React Context providers
│   └── LanguageContext.jsx
├── data/               # Sample data
│   └── restaurants.js
├── App.jsx             # Main app component
├── main.jsx            # Entry point
└── index.css           # Global styles
```

## Design System

### Colors
- Background Primary: `#050505`
- Background Secondary: `#0A0A0A`
- Glass Surface: `rgba(255, 255, 255, 0.04)`
- Glass Border: `rgba(255, 255, 255, 0.12)`
- Text Primary: `#F8FAFC`
- Text Secondary: `#9CA3AF`
- Accent Purple: `rgba(138, 43, 226, 0.45)`

### Typography
- Primary UI: Inter
- Headings: Playfair Display

## Features in Detail

### Navigation
- Sticky top navbar with glassmorphic design
- All core pages accessible
- Language switcher
- "Near Me" quick access

### Home Page
- Hero section
- Bento-grid layout with:
  - Top 5 highest rated restaurants
  - IHM Recommended restaurants
  - Map preview
  - Events & specials
- Featured restaurants section

### Explore Page
- Comprehensive filter system
- Dish-based search
- Animated restaurant cards
- Real-time filtering

### Restaurant Details
- Full-screen modal popup
- Image gallery
- Complete menu
- Reviews and ratings
- Facilities and tags
- Embedded map preview

### Additional Pages
- **Cuisines**: Browse by cuisine type
- **Top Picks**: Curated recommendations
- **Events**: Food festivals and specials
- **Food Culture**: Learn about Aurangabad's culinary heritage
- **Map**: Interactive map with area-based restaurant discovery

## Future Enhancements

- [ ] Google Maps API integration
- [ ] QR code scanning for location-based discovery
- [ ] User authentication
- [ ] Review submission system
- [ ] Backend API integration
- [ ] Real-time restaurant data
- [ ] Advanced search with AI recommendations

## Development

### Adding New Restaurants

Edit `src/data/restaurants.js` and add new restaurant objects following the existing structure.

### Customizing Styles

All CSS variables are defined in `src/index.css`. Modify these to customize the theme.

### Adding New Languages

Edit `src/context/LanguageContext.jsx` to add new language translations.

## License

Developed for Institute of Hotel Management, MGM University, Aurangabad.

## Credits

- **Design**: Dark Glassmorphism with ReactBits-inspired aesthetics
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Fonts**: Google Fonts (Inter, Playfair Display)

---

**Aurangabad Flavors Guide** - Your trusted guide to the best dining experiences in Aurangabad.


