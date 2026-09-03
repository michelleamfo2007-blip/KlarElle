import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import { useCurrency } from '../context/CurrencyContext';

function Search() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q') || '';
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (query) {
      performSearch();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    // Search by name, description, or category
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
      .eq('visibility', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching search results:', error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  return (
    <>
    <SEO title={`Search Results for "${query}"`} />
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '300', textAlign: 'center', marginBottom: '8px' }}>
        Search Results
      </h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '40px' }}>
        {query ? `Showing results for "${query}"` : 'Please enter a search term'}
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading...</div>
      ) : products.length === 0 && query ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          No products found matching "{query}".
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <Link to={`/product/${product.id}`} className="product-image-container">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="product-image" />
                ) : (
                  <div style={{ width: '100%', aspectRatio: '2/3', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    No Image
                  </div>
                )}
                <div className="product-overlay">
                  <div className="quick-add">QUICK VIEW</div>
                </div>
              </Link>
              <div className="product-info">
                <Link to={`/product/${product.id}`} className="product-title">{product.name}</Link>
                <div className="product-price">{formatPrice(product.price)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
}

export default Search;
