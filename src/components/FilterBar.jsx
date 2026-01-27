import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, X } from 'lucide-react'
import {
  cuisines,
  areas,
  establishmentTypes,
  priceRanges,
  ratingCategories,
  facilities,
} from '../data/restaurants'
import './FilterBar.css'

const FilterBar = ({ filters, onFilterChange }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeFilter, setActiveFilter] = useState(null)

  const handleFilterChange = (key, value) => {
    if (key === 'facilities') {
      const currentFacilities = filters.facilities || []
      const newFacilities = currentFacilities.includes(value)
        ? currentFacilities.filter((f) => f !== value)
        : [...currentFacilities, value]
      onFilterChange({ [key]: newFacilities })
    } else {
      onFilterChange({ [key]: value === filters[key] ? '' : value })
    }
    setActiveFilter(null)
  }

  const activeFiltersCount = [
    filters.establishmentType,
    filters.cuisine,
    filters.priceRange,
    filters.rating,
    filters.area,
    filters.dish,
    filters.facilities?.length || 0,
  ].filter(Boolean).length

  return (
    <div className="filter-bar">
      <div className="filter-bar-header">
        <button
          className="filter-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Filter size={20} />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="filter-count">{activeFiltersCount}</span>
          )}
        </button>

        <div className="filter-quick">
          <input
            type="text"
            placeholder="Search by dish..."
            value={filters.dish || ''}
            onChange={(e) => onFilterChange({ dish: e.target.value })}
            className="dish-search"
          />
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="filter-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="filter-sections">
              <div className="filter-section">
                <h3>Establishment Type</h3>
                <div className="filter-options">
                  {establishmentTypes.map((type) => (
                    <button
                      key={type}
                      className={`filter-option ${
                        filters.establishmentType === type ? 'active' : ''
                      }`}
                      onClick={() => handleFilterChange('establishmentType', type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-section">
                <h3>Cuisine</h3>
                <div className="filter-options">
                  {cuisines.slice(0, 10).map((cuisine) => (
                    <button
                      key={cuisine}
                      className={`filter-option ${
                        filters.cuisine === cuisine ? 'active' : ''
                      }`}
                      onClick={() => handleFilterChange('cuisine', cuisine)}
                    >
                      {cuisine}
                    </button>
                  ))}
                  {activeFilter === 'cuisine' && (
                    <div className="filter-dropdown">
                      {cuisines.slice(10).map((cuisine) => (
                        <button
                          key={cuisine}
                          className={`filter-option ${
                            filters.cuisine === cuisine ? 'active' : ''
                          }`}
                          onClick={() => handleFilterChange('cuisine', cuisine)}
                        >
                          {cuisine}
                        </button>
                      ))}
                    </div>
                  )}
                  {cuisines.length > 10 && (
                    <button
                      className="filter-more"
                      onClick={() =>
                        setActiveFilter(activeFilter === 'cuisine' ? null : 'cuisine')
                      }
                    >
                      {activeFilter === 'cuisine' ? 'Show Less' : `+${cuisines.length - 10} More`}
                    </button>
                  )}
                </div>
              </div>

              <div className="filter-section">
                <h3>Price Range</h3>
                <div className="filter-options">
                  {priceRanges.map((range) => (
                    <button
                      key={range}
                      className={`filter-option ${
                        filters.priceRange === range ? 'active' : ''
                      }`}
                      onClick={() => handleFilterChange('priceRange', range)}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-section">
                <h3>Rating</h3>
                <div className="filter-options">
                  {ratingCategories.map((rating) => (
                    <button
                      key={rating}
                      className={`filter-option ${
                        filters.rating === rating ? 'active' : ''
                      }`}
                      onClick={() => handleFilterChange('rating', rating)}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-section">
                <h3>Area</h3>
                <div className="filter-options">
                  {areas.map((area) => (
                    <button
                      key={area}
                      className={`filter-option ${
                        filters.area === area ? 'active' : ''
                      }`}
                      onClick={() => handleFilterChange('area', area)}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-section">
                <h3>Facilities</h3>
                <div className="filter-options">
                  {facilities.map((facility) => (
                    <button
                      key={facility}
                      className={`filter-option ${
                        filters.facilities?.includes(facility) ? 'active' : ''
                      }`}
                      onClick={() => handleFilterChange('facilities', facility)}
                    >
                      {facility}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="filter-actions">
              <button
                className="clear-all-btn"
                onClick={() => {
                  onFilterChange({
                    establishmentType: '',
                    cuisine: '',
                    priceRange: '',
                    rating: '',
                    facilities: [],
                    area: '',
                    dish: '',
                  })
                }}
              >
                <X size={18} />
                Clear All
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FilterBar


