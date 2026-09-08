import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useCurrency } from '../context/CurrencyContext';
import ProductRating from '../components/ProductRating';
import { attachReviewStats } from '../utils/reviews';
import { isProductSoldOut } from '../utils/stock';
import { isComingSoon } from '../utils/storefront';

function Favorites() {
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavoriteProducts = async () => {
      if (favorites.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', favorites)
        .eq('visibility', true)
        .eq('status', 'active');
        
      if (!error && data) {
        setProducts(await attachReviewStats(supabase, data));
      }
      setLoading(false);
    };

    fetchFavoriteProducts();
  }, [favorites]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2>Loading your favorites...</h2>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 20px', minHeight: '60vh' }}>
      <div className="luxury-header">
        <h2 className="luxury-title">Your Wishlist</h2>
        <div className="luxury-subtitle">Curated Elegance By KlarElle</div>
      </div>

      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fafafa', borderRadius: '8px' }}>
          <Heart size={48} strokeWidth={1} style={{ marginBottom: '20px', color: '#ccc' }} />
          <h3>Your wishlist is currently empty.</h3>
          <p style={{ color: '#666', marginBottom: '24px' }}>Save your favorite items here to view them later.</p>
          <Link to="/" style={{ padding: '12px 24px', background: '#000', color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>
            CONTINUE SHOPPING
          </Link>
        </div>
      ) : (
        <div className="luxury-grid">
          {products.map((product) => (
            <div className="luxury-card" key={`fav-${product.id}`}>
              <div className="luxury-image-wrap">
                <Link to={`/product/${product.id}`} className="luxury-image-link">
                  <img src={product.image_url || '/placeholder.png'} alt={product.name} className="luxury-image primary" style={{ opacity: isProductSoldOut(product) ? 0.6 : 1 }} />
                </Link>
                
                {isComingSoon(product) ? (
                  <div className="luxury-badge" style={{ background: '#111', color: '#fff', letterSpacing: '1px' }}>COMING SOON</div>
                ) : isProductSoldOut(product) ? (
                  <div className="luxury-badge" style={{ background: '#000', color: '#fff', letterSpacing: '1px' }}>SOLD OUT</div>
                ) : product.old_price && parseFloat(product.old_price) > parseFloat(product.price) && (
                  <div className="luxury-badge">-{Math.round(((product.old_price - product.price) / product.old_price) * 100)}%</div>
                )}
                
                <div className="luxury-actions">
                  <div 
                    className="luxury-action-icon" 
                    title="Remove from Wishlist" 
                    onClick={() => toggleFavorite(product.id)}
                    style={{ background: isFavorite(product.id) ? '#000' : '#fff', color: isFavorite(product.id) ? '#fff' : '#000' }}
                  >
                    <Heart size={16} fill={isFavorite(product.id) ? "currentColor" : "none"} />
                  </div>
                  <Link to={`/product/${product.id}`} className="luxury-action-icon" style={{ display: 'flex', color: 'inherit', textDecoration: 'none' }} title="Quick View"><Eye size={16} /></Link>
                  {!isComingSoon(product) && !isProductSoldOut(product) && (
                    <div className="luxury-action-icon" title="Add to Cart" onClick={() => addToCart(product)}><ShoppingBag size={16} /></div>
                  )}
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
                
                <ProductRating count={product.reviewCount} average={product.reviewAvg} className="luxury-rating" />
                {isComingSoon(product) ? (
                  <Link to={`/product/${product.id}`} className="luxury-add-btn" style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>Notify Me When Available</Link>
                ) : (
                  <button className="luxury-add-btn" onClick={() => addToCart(product)}>Add to Cart</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Favorites;
