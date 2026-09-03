import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Heart, ArrowRight, Star, Eye, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useCurrency } from '../context/CurrencyContext';

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistStatus, setWaitlistStatus] = useState(''); // 'idle', 'loading', 'success', 'error'
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('visibility', true)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(3);
      
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

  const handleJoinWaitlist = async (e) => {
    e.preventDefault();
    if (!waitlistEmail) return;
    
    setWaitlistStatus('loading');
    
    const { error } = await supabase.from('waitlist').insert([
      { email: waitlistEmail }
    ]);
    
    if (error) {
      if (error.code === '23505') { // Unique violation
        setWaitlistStatus('success'); // Already on the list
      } else {
        setWaitlistStatus('error');
        console.error(error);
      }
    } else {
      setWaitlistStatus('success');
      // Send the automated welcome email via backend
      try {
        await fetch('/api/join-waitlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: waitlistEmail })
        });
      } catch (err) {
        console.error("Failed to send welcome email:", err);
      }
    }
    
    setWaitlistEmail('');
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
        .hero-editorial {
          background-color: #FAF5F0;
          min-height: 90vh;
          display: flex;
          flex-direction: column;
          position: relative;
          padding-top: 80px;
          overflow: hidden;
        }
        
        .hero-text-container {
          width: 100vw;
          margin-left: calc(-50vw + 50%);
          background-color: #111;
          padding: 40px 20px;
          text-align: center;
          z-index: 10;
          position: relative;
          margin-bottom: 60px;
          margin-top: -80px;
        }
        
        .hero-presents {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          color: #ddd;
          font-size: 24px;
          margin-bottom: 12px;
        }
        
        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: 64px;
          color: #fff;
          line-height: 1.1;
          margin: 0 0 32px 0;
          font-weight: 400;
        }

        .waitlist-form {
          max-width: 500px;
          margin: 0 auto;
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }

        .waitlist-input {
          flex: 1;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.3);
          color: #fff;
          padding: 16px 24px;
          font-size: 16px;
          border-radius: 100px;
          outline: none;
          transition: all 0.3s;
        }

        .waitlist-input:focus {
          border-color: #FAF9F6;
        }

        .waitlist-btn {
          background: #FAF9F6;
          color: #111827;
          border: none;
          padding: 16px 32px;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
          border-radius: 100px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .waitlist-btn:hover {
          background: #D2C4B3;
          color: #fff;
        }
        
        .hero-date {
          font-family: 'Inter', sans-serif;
          color: #666;
          font-size: 14px;
          letter-spacing: 2px;
          margin-top: 16px;
        }
        
        .hero-images-container {
          position: relative;
          width: 100%;
          flex-grow: 1;
          display: flex;
          align-items: flex-end;
          padding-bottom: 0;
        }
        
        .hero-img-main-left {
          width: 50%;
          height: 600px;
          object-fit: cover;
          object-position: top;
          z-index: 2;
        }

        .hero-img-small-overlap {
          position: absolute;
          left: 10%;
          bottom: 280px;
          width: 20%;
          aspect-ratio: 1;
          object-fit: cover;
          border-radius: 50%;
          border: 6px solid #FAF5F0;
          z-index: 5;
        }
        
        .hero-img-center-wrapper {
          width: 45%;
          margin-left: -5%;
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          z-index: 1;
        }
        
        .hero-img-center {
          width: 100%;
          aspect-ratio: 4/5;
          object-fit: cover;
        }
        
        .hero-see-more {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          margin-top: 12px;
          color: #333;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .hero-img-right-container {
          position: absolute;
          right: 2%;
          bottom: 40px;
          width: 25%;
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 3;
        }
        
        .hero-offers {
          font-family: 'Playfair Display', serif;
          font-size: 13px;
          color: #444;
          text-align: center;
          margin-bottom: 12px;
          line-height: 1.3;
          max-width: 120px;
        }
        
        .hero-img-right {
          width: 100%;
          aspect-ratio: 3/4;
          border-radius: 50%;
          object-fit: cover;
        }

        @media (max-width: 900px) {
          .hero-title { font-size: 36px; margin-bottom: 24px; }
          .hero-text-container { margin-top: 0; padding: 20px 15px; margin-bottom: 30px; }
          .waitlist-form { flex-direction: column; gap: 10px; }
          .waitlist-input { width: 100%; box-sizing: border-box; text-align: center; }
          .waitlist-btn { width: 100%; box-sizing: border-box; }
          
          .hero-images-container { flex-direction: column; align-items: center; }
          .hero-img-main-left, .hero-img-small-overlap, .hero-img-right-container { display: none; }
          .hero-img-center-wrapper { width: 90%; margin-left: 0; margin-bottom: 20px; }
          .hero-img-center { aspect-ratio: 4/5; }
        }
      `}</style>

      {/* Hero Section */}
      <section className="hero-editorial">
        <div className="hero-text-container">
          <div className="hero-presents">KlarElle</div>
          <h1 className="hero-title">Coming Soon</h1>
          
          {waitlistStatus === 'success' ? (
            <div style={{ color: '#D2C4B3', fontSize: '18px', fontStyle: 'italic', fontFamily: 'Playfair Display', padding: '16px' }}>
              Thank you. You are on the exclusive list.
            </div>
          ) : (
            <form className="waitlist-form" onSubmit={handleJoinWaitlist}>
              <div style={{ width: '100%' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#BCA38F', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase', textAlign: 'left', marginLeft: '16px' }}>
                  Be the first to know when Klarelle launches.
                </label>
                <input 
                  type="email" 
                  className="waitlist-input" 
                  placeholder="Enter your email address" 
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="waitlist-btn" disabled={waitlistStatus === 'loading'}>
                {waitlistStatus === 'loading' ? 'JOINING...' : 'JOIN'}
              </button>
            </form>
          )}
        </div>
        
        <div className="hero-images-container">
          <img src="/klarelle-magazine-hero.png" alt="KlarElle Autumn" className="hero-img-main-left" />
          <img src="/klarelle-magazine-hero.png" alt="KlarElle Detail" className="hero-img-small-overlap" />
          
          <div className="hero-img-center-wrapper">
            <img src="/klarelle-magazine-hero.png" alt="KlarElle Lookbook" className="hero-img-center" />
          </div>
          
          <div className="hero-img-right-container">
            <img src="/klarelle-magazine-hero.png" alt="Klarelle Collection" className="hero-img-right" />
          </div>
        </div>
      </section>

      {/* Introducing Section */}
      <section style={{ padding: '80px 20px', backgroundColor: '#fff', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '32px', color: '#111827', marginBottom: '16px', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Introducing Klarelle
          </h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '18px', color: '#4b5563', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto' }}>
            Sophisticated, timeless pieces designed to make women feel confident and elegant.
          </p>
        </div>
      </section>

      {/* Luxury Product Section */}
      <section className="luxury-section" style={{ backgroundColor: '#FAF9F6' }}>
        <div className="container">
          <div className="luxury-header">
            <h2 className="luxury-title">COMING SOON / A GLIMPSE OF KLARELLE</h2>
          </div>
          
          <div className="luxury-grid">
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', gridColumn: '1 / -1', color: '#666' }}>Loading collection...</div>
            ) : products.length === 0 ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="luxury-card" style={{ background: 'none', border: 'none', boxShadow: 'none' }}>
                    <div className="luxury-image-wrap" style={{ borderRadius: '8px', overflow: 'hidden', backgroundColor: '#000' }}>
                      <img 
                        src={`/silhouette${i}.png`} 
                        alt="Coming Soon Silhouette" 
                        style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', opacity: 0.8 }} 
                      />
                    </div>
                    <div className="luxury-info" style={{ textAlign: 'center', marginTop: '16px' }}>
                      <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', color: '#111827', margin: '0 0 8px 0' }}>The First Collection</h3>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#BCA38F', margin: 0, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Coming Soon</p>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              products.map((product) => (
                <div className="luxury-card" key={`luxury-${product.id}`}>
                  <div className="luxury-image-wrap">
                    <Link to={`/product/${product.id}`} className="luxury-image-link">
                      <img src={product.image_url || '/placeholder.png'} alt={product.name} className="luxury-image primary" style={{ opacity: product.stock <= 0 ? 0.6 : 1 }} />
                    </Link>
                    
                    {product.stock <= 0 ? (
                      <div className="luxury-badge" style={{ background: '#000', color: '#fff', letterSpacing: '1px' }}>SOLD OUT</div>
                    ) : product.old_price && parseFloat(product.old_price) > parseFloat(product.price) && (
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
                    </div>
                  </div>
                  
                  <div className="luxury-info">
                    <div className="luxury-category">{product.category || 'Clothing'}</div>
                    <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
                      <h3 className="luxury-title">{product.name}</h3>
                    </Link>
                    
                    <div className="luxury-price-row">
                      <span className="luxury-price">{formatPrice(product.price)}</span>
                      {product.old_price && parseFloat(product.old_price) > parseFloat(product.price) && (
                        <>
                          <span className="luxury-old-price">{formatPrice(product.old_price)}</span>
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
                    
                    <button 
                      className="luxury-add-btn" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const defaultColor = Array.isArray(product.colors) ? product.colors[0] : (product.colors || 'Standard');
                        addToCart(product, 'M', defaultColor);
                      }}
                    >
                      ADD TO BAG
                    </button>
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
