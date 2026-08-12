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

      {/* Hero Section */}
      <section className="hero container" style={{marginTop: '24px'}}>
        <div className="hero-grid">
          <div className="hero-side-banners">
            <div className="side-banner">
              <img src="/side_banner_1.png" alt="Hot Sellers" />
              <div className="side-banner-text">Hot Sellers</div>
            </div>
            <div className="side-banner">
              <img src="/side_banner_2.png" alt="New Arrivals" />
              <div className="side-banner-text">New Arrivals</div>
            </div>
            <div className="side-banner" style={{ backgroundColor: '#222' }}>
              <div className="side-banner-text">School Essentials</div>
            </div>
          </div>
          <div className="hero-center">
            <img src="/hero.png" alt="Summer Collection" className="hero-banner-main" />
          </div>
          <div className="hero-side-banners">
            <div className="side-banner">
              <img src="/side_banner_2.png" alt="ROMWE" />
              <div className="side-banner-text">KlarElle Premium</div>
            </div>
            <div className="side-banner">
              <img src="/side_banner_1.png" alt="EMERY ROSE" />
              <div className="side-banner-text">Summer Collection</div>
            </div>
            <div className="side-banner" style={{ backgroundColor: '#222' }}>
              <div className="side-banner-text">Clearance</div>
            </div>
          </div>
        </div>
      </section>

      {/* Circular Categories Section */}
      <section className="container">
        <div className="circular-categories">
          {['Maxi Dresses', 'Midi Dresses', 'Mini Dresses', 'Bodycon', 'Floral', 'Party Wear', 'Casual', 'Workwear'].map((cat, i) => (
            <Link to={`/category/${cat.toLowerCase().replace(' ', '-')}`} className="circle-category" key={cat}>
              <div className="circle-img-wrap">
                <img src="/circle_dress.png" alt={cat} />
              </div>
              <span className="circle-title">{cat}</span>
            </Link>
          ))}
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
