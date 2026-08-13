import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './Filter.css';

function FilterSidebar({ filterOptions, activeFilters, onFilterChange }) {
  const [collapsedSections, setCollapsedSections] = useState({});

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleToggle = (category, value) => {
    const categoryFilters = activeFilters[category] || [];
    let newFilters;
    if (categoryFilters.includes(value)) {
      newFilters = categoryFilters.filter(v => v !== value);
    } else {
      newFilters = [...categoryFilters, value];
    }
    onFilterChange({ ...activeFilters, [category]: newFilters });
  };

  const renderSection = (id, title, isCheckbox = false) => {
    const options = filterOptions[id] || [];
    if (options.length === 0) return null;

    const isCollapsed = collapsedSections[id];
    
    return (
      <div className="filter-sidebar-section" key={id}>
        <div className="filter-sidebar-title" onClick={() => toggleSection(id)}>
          {title}
          {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </div>
        {!isCollapsed && (
          <div className="filter-sidebar-content">
            {isCheckbox ? (
               options.map(option => (
                 <label className="filter-checkbox-item" key={option}>
                   <input 
                     type="checkbox" 
                     checked={(activeFilters[id] || []).includes(option)}
                     onChange={() => handleToggle(id, option)}
                   />
                   <span>{option}</span>
                 </label>
               ))
            ) : (
              <div className="filter-desktop-pills">
                {options.map(option => (
                  <button
                    key={option}
                    className={`filter-desktop-pill ${(activeFilters[id] || []).includes(option) ? 'active' : ''}`}
                    onClick={() => handleToggle(id, option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="filter-sidebar">
      {renderSection('Type', 'Product Type', false)}
      {renderSection('Color', 'Color', false)}
      {renderSection('Size', 'Size', false)}
      {renderSection('Length', 'Length', true)}
      {renderSection('Style', 'Style', true)}
      {renderSection('PatternType', 'Pattern Type', true)}
      {renderSection('Occasion', 'Occasion', true)}
      {renderSection('WaistLine', 'Waist Line', true)}
      
      {/* Price section could be added here if needed, but often kept simple on desktop sidebar */}
    </aside>
  );
}

export default FilterSidebar;
