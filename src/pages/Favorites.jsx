import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';

function Favorites() {
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { addToCart } = useCart();
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
        .eq('status', 'active');
        
      if (!error && data) {
        setProducts(data);
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
        <div className="luxury-subtitle">Curated Elegance By Merova</div>
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
                  <img src={product.image_url || '/placeholder.png'} alt={product.name} className="luxury-image primary" />
                </Link>
                
                {product.old_price && parseFloat(product.old_price) > parseFloat(product.price) && (
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
                  <div className="luxury-action-icon" title="Add to Bag" onClick={() => addToCart(product)}><ShoppingBag size={16} /></div>
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
          ))}
        </div>
      )}
    </div>
  );
}

export default Favorites;
