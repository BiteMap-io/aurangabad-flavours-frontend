import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, X } from 'lucide-react'
import {
  priceRanges,
  ratingCategories,
  facilities as allFacilities,
} from '../constants/filters'

const FilterBar = ({ filters, onFilterChange, restaurants = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeFilter, setActiveFilter] = useState(null)

  // Derive dynamic filter options from restaurant data
  const { cuisines, areas, establishmentTypes } = useMemo(() => {
    const cuisineSet = new Set()
    const areaSet = new Set()
    const typeSet = new Set()

    restaurants.forEach(r => {
      if (r.cuisine) r.cuisine.split(',').forEach(c => cuisineSet.add(c.trim()))
      if (r.area) areaSet.add(r.area)
      if (r.establishmentType) typeSet.add(r.establishmentType)
    })

    return {
      cuisines: Array.from(cuisineSet).sort(),
      areas: Array.from(areaSet).sort(),
      establishmentTypes: Array.from(typeSet).sort()
    }
  }, [restaurants])

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
    filters.facilities?.length || 0,
  ].filter(Boolean).length

  return (
    <div className="mb-lg">
      <div className="flex flex-col md:flex-row md:items-center gap-md mb-md">
        <button
          className="flex items-center justify-center md:justify-start gap-xs py-sm px-md bg-glass-surface border border-glass-border rounded-pill text-primary text-[0.95rem] font-medium cursor-pointer transition-all duration-300 hover:bg-glass-hover hover:border-accent-purple/20"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Filter size={20} />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="bg-accent-purple text-white rounded-full w-5 h-5 flex items-center justify-center text-[0.75rem] font-semibold shadow-glow/40">{activeFiltersCount}</span>
          )}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="overflow-hidden bg-glass-surface border border-glass-border rounded-lg p-lg mt-md shadow-glass"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-lg mb-lg">
              <div className="flex flex-col">
                <h3 className="text-[1rem] font-semibold text-primary mb-sm">Establishment Type</h3>
                <div className="flex flex-wrap gap-xs">
                  {establishmentTypes.length > 0 ? establishmentTypes.map((type) => (
                    <button
                      key={type}
                      className={`py-xs px-sm border rounded-md text-[0.875rem] cursor-pointer transition-all duration-300 ${
                        filters.establishmentType === type ? 'bg-accent-purple border-accent-purple text-white shadow-glow/30' : 'bg-glass-surface border-glass-border text-secondary hover:bg-glass-hover hover:border-accent-purple/40 hover:text-primary'
                      }`}
                      onClick={() => handleFilterChange('establishmentType', type)}
                    >
                      {type}
                    </button>
                  )) : <p className="text-tertiary text-sm">No types found</p>}
                </div>
              </div>

              <div className="flex flex-col">
                <h3 className="text-[1rem] font-semibold text-primary mb-sm">Cuisine</h3>
                <div className="flex flex-wrap gap-xs">
                  {cuisines.length > 0 ? (
                    <>
                      {cuisines.slice(0, 10).map((cuisine) => (
                        <button
                          key={cuisine}
                          className={`py-xs px-sm border rounded-md text-[0.875rem] cursor-pointer transition-all duration-300 ${
                            filters.cuisine === cuisine ? 'bg-accent-purple border-accent-purple text-white shadow-glow/30' : 'bg-glass-surface border-glass-border text-secondary hover:bg-glass-hover hover:border-accent-purple/40 hover:text-primary'
                          }`}
                          onClick={() => handleFilterChange('cuisine', cuisine)}
                        >
                          {cuisine}
                        </button>
                      ))}
                      {activeFilter === 'cuisine' && (
                        <div className="flex flex-wrap gap-xs w-full mt-1">
                          {cuisines.slice(10).map((cuisine) => (
                            <button
                              key={cuisine}
                              className={`py-xs px-sm border rounded-md text-[0.875rem] cursor-pointer transition-all duration-300 ${
                                filters.cuisine === cuisine ? 'bg-accent-purple border-accent-purple text-white shadow-glow/30' : 'bg-glass-surface border-glass-border text-secondary hover:bg-glass-hover hover:border-accent-purple/40 hover:text-primary'
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
                          className="py-xs px-sm bg-transparent border border-dashed border-glass-border rounded-md text-tertiary text-[0.875rem] cursor-pointer transition-all duration-300 hover:border-accent-purple hover:text-primary"
                          onClick={() =>
                            setActiveFilter(activeFilter === 'cuisine' ? null : 'cuisine')
                          }
                        >
                          {activeFilter === 'cuisine' ? 'Show Less' : `+${cuisines.length - 10} More`}
                        </button>
                      )}
                    </>
                  ) : <p className="text-tertiary text-sm">No cuisines found</p>}
                </div>
              </div>

              <div className="flex flex-col">
                <h3 className="text-[1rem] font-semibold text-primary mb-sm">Price Range</h3>
                <div className="flex flex-wrap gap-xs">
                  {priceRanges.map((range) => (
                    <button
                      key={range}
                      className={`py-xs px-sm border rounded-md text-[0.875rem] cursor-pointer transition-all duration-300 ${
                        filters.priceRange === range ? 'bg-accent-purple border-accent-purple text-white shadow-glow/30' : 'bg-glass-surface border-glass-border text-secondary hover:bg-glass-hover hover:border-accent-purple/40 hover:text-primary'
                      }`}
                      onClick={() => handleFilterChange('priceRange', range)}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col">
                <h3 className="text-[1rem] font-semibold text-primary mb-sm">Rating</h3>
                <div className="flex flex-wrap gap-xs">
                  {ratingCategories.map((rating) => (
                    <button
                      key={rating}
                      className={`py-xs px-sm border rounded-md text-[0.875rem] cursor-pointer transition-all duration-300 ${
                        filters.rating === rating ? 'bg-accent-purple border-accent-purple text-white shadow-glow/30' : 'bg-glass-surface border-glass-border text-secondary hover:bg-glass-hover hover:border-accent-purple/40 hover:text-primary'
                      }`}
                      onClick={() => handleFilterChange('rating', rating)}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col">
                <h3 className="text-[1rem] font-semibold text-primary mb-sm">Area</h3>
                <div className="flex flex-wrap gap-xs">
                  {areas.length > 0 ? areas.map((area) => (
                    <button
                      key={area}
                      className={`py-xs px-sm border rounded-md text-[0.875rem] cursor-pointer transition-all duration-300 ${
                        filters.area === area ? 'bg-accent-purple border-accent-purple text-white shadow-glow/30' : 'bg-glass-surface border-glass-border text-secondary hover:bg-glass-hover hover:border-accent-purple/40 hover:text-primary'
                      }`}
                      onClick={() => handleFilterChange('area', area)}
                    >
                      {area}
                    </button>
                  )) : <p className="text-tertiary text-sm">No areas found</p>}
                </div>
              </div>

              <div className="flex flex-col">
                <h3 className="text-[1rem] font-semibold text-primary mb-sm">Facilities</h3>
                <div className="flex flex-wrap gap-xs">
                  {allFacilities.map((facility) => (
                    <button
                      key={facility}
                      className={`py-xs px-sm border rounded-md text-[0.875rem] cursor-pointer transition-all duration-300 ${
                        filters.facilities?.includes(facility) ? 'bg-accent-purple border-accent-purple text-white shadow-glow/30' : 'bg-glass-surface border-glass-border text-secondary hover:bg-glass-hover hover:border-accent-purple/40 hover:text-primary'
                      }`}
                      onClick={() => handleFilterChange('facilities', facility)}
                    >
                      {facility}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-md border-t border-glass-border">
              <button
                className="flex items-center gap-xs py-sm px-md bg-transparent border border-glass-border rounded-md text-tertiary text-[0.9rem] cursor-pointer transition-all duration-300 hover:bg-glass-hover hover:border-accent-purple hover:text-primary"
                onClick={() => {
                  onFilterChange({
                    establishmentType: '',
                    cuisine: '',
                    priceRange: '',
                    rating: '',
                    facilities: [],
                    area: '',
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
