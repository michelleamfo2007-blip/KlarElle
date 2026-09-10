import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './Filter.css';

const TAB_DEFS = [
  { id: 'Type', label: 'Product Type' },
  { id: 'Color', label: 'Color' },
  { id: 'Size', label: 'Size' },
  { id: 'Length', label: 'Length' },
  { id: 'PatternType', label: 'Pattern Type' },
  { id: 'Style', label: 'Style' },
  { id: 'WaistLine', label: 'Waist Line' },
  { id: 'Occasion', label: 'Occasion' }
];

function FilterModal({ isOpen, onClose, filterOptions, activeFilters, onApplyFilters }) {
  const [localFilters, setLocalFilters] = useState({});
  const [activeTab, setActiveTab] = useState('Color');
  const tabs = TAB_DEFS.filter((tab) => (filterOptions[tab.id] || []).length > 0);

  useEffect(() => {
    if (!isOpen) return;
    setLocalFilters({ ...activeFilters });
  }, [isOpen, activeFilters]);

  useEffect(() => {
    if (!isOpen) return;
    const visible = TAB_DEFS.filter((tab) => (filterOptions[tab.id] || []).length > 0);
    if (!visible[0]) return;
    setActiveTab((current) => (visible.some((tab) => tab.id === current) ? current : visible[0].id));
  }, [isOpen, filterOptions]);

  if (!isOpen) return null;

  const handleToggle = (category, value) => {
    setLocalFilters((prev) => {
      const categoryFilters = prev[category] || [];
      if (categoryFilters.includes(value)) {
        return { ...prev, [category]: categoryFilters.filter((item) => item !== value) };
      }
      return { ...prev, [category]: [...categoryFilters, value] };
    });
  };

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
          <div className="filter-tabs">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`filter-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </div>
            ))}
          </div>

          <div className="filter-options-pane">
            <div className="filter-options-grid">
              <h3 className="filter-pane-title">{tabs.find((tab) => tab.id === activeTab)?.label}</h3>
              <div className="pills-container">
                {(filterOptions[activeTab] || []).map((option) => (
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
          </div>
        </div>

        <div className="filter-modal-footer">
          <button className="filter-btn-clear" onClick={() => setLocalFilters({})}>Clear</button>
          <button
            className="filter-btn-done"
            onClick={() => {
              onApplyFilters(localFilters);
              onClose();
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default FilterModal;
