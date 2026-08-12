import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Heart, Star, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Category.css';

function Category() {
  const { id } = useParams(); // gets 'dresses', 'tops', etc. from URL
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
        setProducts(data);
      }
      setLoading(false);
    };

    fetchCategoryProducts();
  }, [id]);

  const categoryName = id.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="category-page-container">
      {/* Sidebar */}
      <aside className="category-sidebar">
        <div className="sidebar-section">
          <div className="sidebar-title">
            Category
          </div>
          <ul className="sidebar-list">
            <li className="sidebar-item">
              <input type="checkbox" />
              <span>Women Dresses</span>
            </li>
            <li className="sidebar-item">
              <input type="checkbox" />
              <span>Women Tops, Blouses & Tee</span>
            </li>
            <li className="sidebar-item">
              <input type="checkbox" />
              <span>Women Bottoms</span>
            </li>
            <li className="sidebar-item">
              <input type="checkbox" />
              <span>Women Sweatshirts & Hoodies</span>
            </li>
            <li className="sidebar-item">
              <input type="checkbox" />
              <span>Women Denim</span>
            </li>
            <li className="sidebar-item">
              <input type="checkbox" />
              <span>Women Suits</span>
            </li>
          </ul>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-title">
            Trends Store
          </div>
          <ul className="sidebar-list">
            <li className="sidebar-item">
              <input type="checkbox" />
              <span>ROMWE</span>
            </li>
            <li className="sidebar-item">
              <input type="checkbox" />
              <span>Swim VCAY</span>
            </li>
            <li className="sidebar-item">
              <input type="checkbox" />
              <span>Emery Rose</span>
            </li>
            <li className="sidebar-item">
              <input type="checkbox" />
              <span>Modelyn</span>
            </li>
          </ul>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-title">
            Style
          </div>
          <ul className="sidebar-list">
            <li className="sidebar-item">
              <input type="checkbox" />
              <span>Casual</span>
            </li>
            <li className="sidebar-item">
              <input type="checkbox" />
              <span>Elegant</span>
            </li>
            <li className="sidebar-item">
              <input type="checkbox" />
              <span>Boho</span>
            </li>
            <li className="sidebar-item">
              <input type="checkbox" />
              <span>Sexy</span>
            </li>
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <div className="category-content">
        <div className="category-header">
          <h1 style={{ fontSize: '28px', marginBottom: '8px', textTransform: 'capitalize' }}>{categoryName}</h1>
          <p style={{ color: '#666' }}>Explore our collection of {categoryName.toLowerCase()}.</p>
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
                {product.old_price && parseFloat(product.old_price) > parseFloat(product.price) && (
                    <div className="product-badge">-{Math.round(((product.old_price - product.price) / product.old_price) * 100)}%</div>
                )}
                <div className="product-image-wrap">
                  <Link to={`/product/${product.id}`}>
                    <img src={product.image_url || '/placeholder.png'} alt={product.name} className="product-image primary" />
                    {product.hover_image_url && <img src={product.hover_image_url} alt={product.name} className="product-image secondary" />}
                  </Link>
                  <div className="product-actions">
                    <button className="action-btn add-cart" onClick={() => addToCart(product)}>ADD TO CART</button>
                    <button className="action-btn"><Heart size={18} /></button>
                  </div>
                </div>
                <div className="product-info">
                  <Link to={`/product/${product.id}`}><h3 className="product-title">{product.name}</h3></Link>
                  <div className="product-price-wrap">
                    <span className="product-price sale">₵{parseFloat(product.price).toFixed(2)}</span>
                    {product.old_price && parseFloat(product.old_price) > parseFloat(product.price) && <span className="product-old-price">₵{parseFloat(product.old_price).toFixed(2)}</span>}
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
    </div>
  );
}

export default Category;
