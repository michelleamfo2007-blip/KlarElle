import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Heart, ArrowRight, Star, Eye, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('visibility', true)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  return (
    <>
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          background: '#111',
          color: '#fff',
          padding: '16px 24px',
          borderRadius: '8px',
          zIndex: 9999,
          fontWeight: '500',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          border: '1px solid #333'
        }}>
          {toastMessage}
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
        .curly-text {
          font-family: 'Great Vibes', cursive;
          color: #fff;
          text-transform: none !important;
        }
      `}</style>

      {/* Hero Section */}
      <section className="hero container" style={{marginTop: '24px'}}>
        <div className="hero-grid">
          <div className="hero-side-banners" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="side-banner" style={{ backgroundColor: '#111', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              <div className="curly-text" style={{ fontSize: '50px', letterSpacing: '2px', textAlign: 'center', lineHeight: '1.2' }}>Coming<br/>Soon</div>
            </div>
          </div>
          <div className="hero-center" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ backgroundColor: '#111', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', minHeight: '400px' }}>
              <div className="curly-text" style={{ fontSize: '100px', letterSpacing: '4px', textAlign: 'center', lineHeight: '1' }}>Coming Soon</div>
            </div>
          </div>
          <div className="hero-side-banners" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="side-banner" style={{ backgroundColor: '#111', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              <div className="curly-text" style={{ fontSize: '50px', letterSpacing: '2px', textAlign: 'center', lineHeight: '1.2' }}>Coming<br/>Soon</div>
            </div>
          </div>
        </div>
      </section>

      {/* Luxury Product Section */}
      <section className="luxury-section">
        <div className="container">
          <div className="luxury-header">
            <h2 className="luxury-title">New Arrivals</h2>
            <div className="luxury-subtitle">Curated Elegance By Merova</div>
          </div>
          
          <div className="luxury-grid">
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', gridColumn: '1 / -1', color: '#666' }}>Loading luxury collection...</div>
            ) : products.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', gridColumn: '1 / -1', color: '#666' }}>
                No products found. Add some in the Admin Dashboard!
              </div>
            ) : (
              products.map((product) => (
                <div className="luxury-card" key={`luxury-${product.id}`}>
                  <div className="luxury-image-wrap">
                    <Link to={`/product/${product.id}`} className="luxury-image-link">
                      <img src={product.image_url || '/placeholder.png'} alt={product.name} className="luxury-image primary" />
                    </Link>
                    
                    {product.old_price && parseFloat(product.old_price) > parseFloat(product.price) && (
                      <div className="luxury-badge">-{Math.round(((product.old_price - product.price) / product.old_price) * 100)}%</div>
                    )}
                    
                    <div className="luxury-actions">
                      <div 
                        className="luxury-action-icon" 
                        title="Wishlist" 
                        onClick={() => { toggleFavorite(product.id); showToast(isFavorite(product.id) ? "Removed from Wishlist" : "Added to your Wishlist!"); }}
                        style={{ background: isFavorite(product.id) ? '#000' : '#fff', color: isFavorite(product.id) ? '#fff' : '#000' }}
                      >
                        <Heart size={16} fill={isFavorite(product.id) ? "currentColor" : "none"} />
                      </div>
                      <Link to={`/product/${product.id}`} className="luxury-action-icon" style={{ display: 'flex', color: 'inherit', textDecoration: 'none' }} title="Quick View"><Eye size={16} /></Link>
                      <div className="luxury-action-icon" title="Add to Bag" onClick={() => { addToCart(product); showToast("Added to your shopping bag!"); }}><ShoppingBag size={16} /></div>
                    </div>
                  </div>
                  
                  <div className="luxury-info">
                    <div className="luxury-category">{product.category || 'Clothing'}</div>
                    <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
                      <h3 className="luxury-title">{product.name}</h3>
                    </Link>
                    
                    <div className="luxury-price-row">
                      <span className="luxury-price">₵{parseFloat(product.price).toFixed(2)}</span>
                      {product.old_price && parseFloat(product.old_price) > parseFloat(product.price) && (
                        <>
                          <span className="luxury-old-price">₵{parseFloat(product.old_price).toFixed(2)}</span>
                          <span className="luxury-saved">Save {Math.round(((product.old_price - product.price) / product.old_price) * 100)}%</span>
                        </>
                      )}
                    </div>
                    
                    <div className="luxury-rating">
                      <Star className="luxury-star" fill="currentColor" />
                      <Star className="luxury-star" fill="currentColor" />
                      <Star className="luxury-star" fill="currentColor" />
                      <Star className="luxury-star" fill="currentColor" />
                      <Star className="luxury-star" fill="currentColor" />
                      <span>({product.rating || 5.0}) 128 Reviews</span>
                    </div>
                    
                    <button className="luxury-add-btn" onClick={() => addToCart(product)}>Add To Bag</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
