import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import './Filter.css'; // We'll create a shared CSS file for both modal and sidebar

function FilterModal({ isOpen, onClose, filterOptions, activeFilters, onApplyFilters }) {
  const [localFilters, setLocalFilters] = useState({});
  const [activeTab, setActiveTab] = useState('Type');

  useEffect(() => {
    if (isOpen) {
      setLocalFilters({ ...activeFilters });
    }
  }, [isOpen, activeFilters]);

  if (!isOpen) return null;

  const handleToggle = (category, value) => {
    setLocalFilters(prev => {
      const categoryFilters = prev[category] || [];
      if (categoryFilters.includes(value)) {
        return { ...prev, [category]: categoryFilters.filter(v => v !== value) };
      } else {
        return { ...prev, [category]: [...categoryFilters, value] };
      }
    });
  };

  const handlePriceChange = (field, value) => {
    setLocalFilters(prev => ({
      ...prev,
      price: {
        ...prev.price,
        [field]: value
      }
    }));
  };

  const handleClear = () => {
    setLocalFilters({});
  };

  const handleDone = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const tabs = [
    { id: 'Type', label: 'Product Type' },
    { id: 'Color', label: 'Color' },
    { id: 'Details', label: 'Details' },
    { id: 'FabricElasticity', label: 'Fabric Elasticity' },
    { id: 'FitType', label: 'Fit Type' },
    { id: 'Length', label: 'Length' },
    { id: 'Composition', label: 'Composition' },
    { id: 'Neckline', label: 'Neckline' },
    { id: 'PatternType', label: 'Pattern Type' },
    { id: 'Size', label: 'Size' },
    { id: 'SleeveLength', label: 'Sleeve Length' },
    { id: 'SleeveType', label: 'Sleeve Type' },
    { id: 'Style', label: 'Style' },
    { id: 'WaistLine', label: 'Waist Line' },
    { id: 'Occasion', label: 'Occasion' },
    { id: 'PriceRange', label: 'Price Range' }
  ];

  return (
    <div className="filter-modal-overlay">
      <div className="filter-modal-content">
        <div className="filter-modal-header">
          <div style={{ width: 24 }}></div>
          <span style={{ fontWeight: 'bold' }}>Filter</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <div className="filter-modal-body">
          {/* Left Sidebar Tabs */}
          <div className="filter-tabs">
            {tabs.map(tab => (
              <div 
                key={tab.id} 
                className={`filter-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </div>
            ))}
          </div>

          {/* Right Content Area */}
          <div className="filter-options-pane">
            {activeTab !== 'PriceRange' ? (
              <div className="filter-options-grid">
                <h3 className="filter-pane-title">{tabs.find(t => t.id === activeTab)?.label}</h3>
                <div className="pills-container">
                  {(filterOptions[activeTab] || []).map(option => (
                    <button
                      key={option}
                      className={`filter-pill ${(localFilters[activeTab] || []).includes(option) ? 'active' : ''}`}
                      onClick={() => handleToggle(activeTab, option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="filter-options-grid">
                <h3 className="filter-pane-title">Price Range(GHS)</h3>
                <div className="pills-container">
                  {['Under GH₵177', 'GH₵177 - GH₵235', 'GH₵235 - GH₵294', 'Over GH₵294'].map(preset => (
                     <button
                       key={preset}
                       className={`filter-pill ${localFilters.pricePreset === preset ? 'active' : ''}`}
                       onClick={() => setLocalFilters(prev => ({ ...prev, pricePreset: preset }))}
                     >
                       {preset}
                     </button>
                  ))}
                </div>
                <div className="price-inputs">
                  <input 
                    type="number" 
                    placeholder="Min: 52" 
                    value={localFilters.price?.min || ''}
                    onChange={(e) => handlePriceChange('min', e.target.value)}
                    className="price-input"
                  />
                  <span> - </span>
                  <input 
                    type="number" 
                    placeholder="Max: 1236" 
                    value={localFilters.price?.max || ''}
                    onChange={(e) => handlePriceChange('max', e.target.value)}
                    className="price-input"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="filter-modal-footer">
          <button className="filter-btn-clear" onClick={handleClear}>Clear</button>
          <button className="filter-btn-done" onClick={handleDone}>Done</button>
        </div>
      </div>
    </div>
  );
}

export default FilterModal;
