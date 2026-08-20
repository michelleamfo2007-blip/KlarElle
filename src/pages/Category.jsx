import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Heart, Star, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import FilterSidebar from '../components/FilterSidebar';
import FilterModal from '../components/FilterModal';
import { Filter } from 'lucide-react';
import './Category.css';

function Category() {
  const { id } = useParams(); // gets 'dresses', 'tops', etc. from URL
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState({});
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState({});

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('visibility', true)
        .eq('status', 'active')
        .eq('category', id)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setAllProducts(data);
        
        // Compute available filter options based on the fetched products
        const options = {
          Type: ['Bodycon', 'A Line', 'Cami', 'Fitted', 'Tank', 'Shirt', 'Tunic', 'Tee', 'Fit and Flare'],
          Color: ['Multi', 'Black', 'White', 'Pink', 'Blue', 'Grey', 'Red', 'Green'],
          Size: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
          Length: ['Maxi', 'Long', 'Midi', 'Mini', 'Knee Length', 'Short'],
          Style: ['Elegant', 'Sexy', 'Party', 'Casual', 'Boho', 'Modest', 'Vintage', 'Cute'],
          PatternType: ['Plain', 'Plants', 'All Over Print', 'Random Print', 'Colorblock', 'Floral'],
          Occasion: ['Formal & Evening', 'Wedding', 'Vacation', 'Beach', 'Night Out', 'Stage & Concert', 'Dating', 'Homecoming', 'Daily', 'Holiday', 'Birthday Party', 'Bachelorette Party', 'Home', 'Travel', 'Office', 'Garden', 'Country Concert', 'Tea Party', 'Photoshoot', 'Baby Shower Party', 'Street', 'Airport', 'Babymoon', 'School', 'Brunch', 'Sports & Work out'],
          WaistLine: ['High Waist', 'Natural(Mid Waist)', 'Low Waist']
        };
        setFilterOptions(options);
      }
      setLoading(false);
    };

    fetchCategoryProducts();
  }, [id]);

  useEffect(() => {
    // Apply filters client-side
    let result = [...allProducts];

    // Simple matching for categories that exist directly on the product (or tags)
    // Assuming product schema has some of these or they are in tags
    const activeKeys = Object.keys(activeFilters).filter(k => activeFilters[k] && activeFilters[k].length > 0 && k !== 'price' && k !== 'pricePreset');
    
    activeKeys.forEach(key => {
      const selectedOptions = activeFilters[key];
      result = result.filter(product => {
        // Mock filtering logic - if product has tags, check if tags include the selected option
        const productTags = product.tags || [];
        const productColors = product.colors || [];
        const productSizes = product.sizes || [];
        
        if (key === 'Color') {
          return selectedOptions.some(color => productColors.includes(color));
        }
        if (key === 'Size') {
          return selectedOptions.some(size => productSizes.includes(size));
        }
        if (key === 'Style') {
          return selectedOptions.includes(product.style);
        }
        if (key === 'PatternType') {
          return selectedOptions.includes(product.pattern_type);
        }
        
        // Fallback for missing direct fields: check tags
        return selectedOptions.some(option => productTags.includes(option));
      });
    });

    // Apply price filter
    if (activeFilters.pricePreset) {
      if (activeFilters.pricePreset === 'Under GH₵177') {
        result = result.filter(p => parseFloat(p.price) < 177);
      } else if (activeFilters.pricePreset === 'GH₵177 - GH₵235') {
        result = result.filter(p => parseFloat(p.price) >= 177 && parseFloat(p.price) <= 235);
      } else if (activeFilters.pricePreset === 'GH₵235 - GH₵294') {
        result = result.filter(p => parseFloat(p.price) >= 235 && parseFloat(p.price) <= 294);
      } else if (activeFilters.pricePreset === 'Over GH₵294') {
        result = result.filter(p => parseFloat(p.price) > 294);
      }
    } else if (activeFilters.price) {
      if (activeFilters.price.min) {
        result = result.filter(p => parseFloat(p.price) >= parseFloat(activeFilters.price.min));
      }
      if (activeFilters.price.max) {
        result = result.filter(p => parseFloat(p.price) <= parseFloat(activeFilters.price.max));
      }
    }

    setProducts(result);
  }, [activeFilters, allProducts]);

  const categoryName = id.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="category-page-container">
      {/* Sidebar */}
      <div className="desktop-filter-sidebar">
        <FilterSidebar 
          filterOptions={filterOptions} 
          activeFilters={activeFilters} 
          onFilterChange={setActiveFilters} 
        />
      </div>

      {/* Main Content */}
      <div className="category-content">
        <div className="category-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '28px', marginBottom: '8px', textTransform: 'capitalize' }}>{categoryName}</h1>
            <p style={{ color: '#666' }}>Explore our collection of {categoryName.toLowerCase()}.</p>
          </div>
          <button 
            className="mobile-filter-btn" 
            onClick={() => setIsMobileFilterOpen(true)}
            style={{ display: 'none', alignItems: 'center', gap: '4px', padding: '8px 16px', background: '#fff', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
          >
            Filter <Filter size={16} />
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>Loading {categoryName}...</div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: '#f9f9f9', borderRadius: '8px' }}>
            <p style={{ fontSize: '18px', color: '#333' }}>No products found in this category.</p>
            <p style={{ color: '#666', marginTop: '8px' }}>Check back later or explore our <Link to="/" style={{ color: 'black', textDecoration: 'underline' }}>new arrivals</Link>.</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <div className="product-card" key={product.id}>
                {product.stock <= 0 ? (
                    <div className="product-badge" style={{ background: '#000', color: '#fff' }}>SOLD OUT</div>
                ) : product.old_price && parseFloat(product.old_price) > parseFloat(product.price) && (
                    <div className="product-badge">-{Math.round(((product.old_price - product.price) / product.old_price) * 100)}%</div>
                )}
                <div className="product-image-wrap">
                  <Link to={`/product/${product.id}`}>
                    <img src={product.image_url || '/placeholder.png'} alt={product.name} className="product-image primary" style={{ opacity: product.stock <= 0 ? 0.6 : 1 }} />
                    {product.hover_image_url && <img src={product.hover_image_url} alt={product.name} className="product-image secondary" />}
                  </Link>
                  <div className="product-actions">
                    {product.stock > 0 ? (
                      <button className="action-btn add-cart" onClick={() => addToCart(product)}>ADD TO CART</button>
                    ) : (
                      <button className="action-btn add-cart" disabled style={{ background: '#ddd', color: '#666', cursor: 'not-allowed' }}>SOLD OUT</button>
                    )}
                    <button className="action-btn"><Heart size={18} /></button>
                  </div>
                </div>
                <div className="product-info">
                  <Link to={`/product/${product.id}`}><h3 className="product-title">{product.name}</h3></Link>
                  <div className="product-price-wrap">
                    <span className="product-price sale">{formatPrice(product.price)}</span>
                    {product.old_price && parseFloat(product.old_price) > parseFloat(product.price) && <span className="product-old-price">{formatPrice(product.old_price)}</span>}
                  </div>
                  <div className="product-rating">
                    <Star className="star-icon" fill="currentColor" />
                    <Star className="star-icon" fill="currentColor" />
                    <Star className="star-icon" fill="currentColor" />
                    <Star className="star-icon" fill="currentColor" />
                    <Star className="star-icon" fill="currentColor" />
                    <span>({product.rating || 5.0})</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <FilterModal 
        isOpen={isMobileFilterOpen} 
        onClose={() => setIsMobileFilterOpen(false)} 
        filterOptions={filterOptions}
        activeFilters={activeFilters}
        onApplyFilters={setActiveFilters}
      />
    </div>
  );
}

export default Category;
