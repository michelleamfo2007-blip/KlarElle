import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Heart, Truck, RotateCcw, Share2, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';

function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('Black');
  const [selectedSize, setSelectedSize] = useState('M');
  const [activeImage, setActiveImage] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);

  const colorMap = {
    'black': '#000000',
    'white': '#ffffff',
    'red': '#ff0000',
    'blue': '#0000ff',
    'green': '#008000',
    'yellow': '#ffff00',
    'pink': '#ffc0cb',
    'purple': '#800080',
    'orange': '#ffa500',
    'grey': '#808080',
    'gray': '#808080',
    'brown': '#a52a2a',
    'beige': '#f5f5dc',
    'navy': '#000080',
    'maroon': '#800000',
    'olive': '#808000',
    'cream': '#fffdd0',
    'khaki': '#c3b091',
    'nude': '#e3bc9a',
    'mustard': '#ffdb58',
    'burgundy': '#800020',
    'teal': '#008080'
  };
  const getColorHex = (c) => colorMap[c.toLowerCase().trim()] || c;

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (!error && data) {
        // Bulletproof parsing: handle arrays that might contain comma/semicolon separated strings
        const rawSizes = Array.isArray(data.sizes) ? data.sizes : (typeof data.sizes === 'string' ? [data.sizes] : []);
        const pSizes = rawSizes.flatMap(s => typeof s === 'string' ? s.split(/[;,]+/) : s).map(s => String(s).trim()).filter(Boolean);
        
        const rawColors = Array.isArray(data.colors) ? data.colors : (typeof data.colors === 'string' ? [data.colors] : []);
        const pColors = rawColors.flatMap(c => typeof c === 'string' ? c.split(/[;,]+/) : c).map(c => String(c).trim()).filter(Boolean);
        
        data.parsedSizes = pSizes;
        data.parsedColors = pColors;

        setProduct(data);
        if (pSizes.length > 0) setSelectedSize(pSizes[0]);
        if (pColors.length > 0) setSelectedColor(pColors[0]);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  if (loading) return <div style={{ padding: '100px 20px', textAlign: 'center', fontSize: '18px', color: '#666' }}>Loading product details...</div>;
  if (!product) return <div style={{ padding: '100px 20px', textAlign: 'center', fontSize: '18px', color: '#666' }}>Product not found.</div>;

  // Collect images safely
  const images = [];
  if (product.image_url) images.push(product.image_url);
  if (product.hover_image_url) images.push(product.hover_image_url);
  if (images.length === 0) images.push('/placeholder.png'); // fallback

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="product-details-page">
      <div className="container" style={{ padding: '40px 20px' }}>
        
        {/* Breadcrumb */}
        <div style={{ marginBottom: '24px', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>
          <Link to="/" style={{ color: '#666', textDecoration: 'none' }}>Home</Link> / 
          <Link to={`/category/${product.category}`} style={{ color: '#666', textDecoration: 'none', marginLeft: '8px' }}>{product.category.replace('-', ' ')}</Link> / 
          <span style={{ color: '#000', marginLeft: '8px', fontWeight: 'bold' }}>{product.name}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px', minHeight: '600px' }}>
          <style>{`
            @media (min-width: 900px) {
              .product-layout { grid-template-columns: 1.2fr 1fr; }
            }
            .product-layout { display: grid; gap: 40px; }
            
            .gallery-grid { display: grid; grid-template-columns: 80px 1fr; gap: 20px; }
            .thumbnails { display: flex; flexDirection: column; gap: 10px; }
            .thumbnail { width: 80px; height: 100px; object-fit: cover; cursor: pointer; border: 1px solid transparent; }
            .thumbnail.active { border-color: #000; }
            .main-image-wrap { background: #f4f4f4; position: relative; max-height: 600px; display: flex; align-items: center; justify-content: center; border-radius: 12px; overflow: hidden; }
            .main-image { width: 100%; height: 100%; max-height: 600px; object-fit: contain; padding: 24px; }
            
            .info-section { display: flex; flex-direction: column; gap: 20px; }
            .pd-title { font-size: 24px; font-weight: 400; margin: 0; line-height: 1.3; }
            .pd-price-wrap { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
            .pd-price { font-size: 22px; font-weight: bold; }
            .pd-old { text-decoration: line-through; color: #999; font-size: 16px; }
            .pd-sku { font-size: 12px; color: #666; }
            
            .pd-options-title { font-size: 14px; font-weight: bold; margin-bottom: 12px; text-transform: uppercase; }
            
            .size-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 24px; }
            .size-btn { padding: 12px; border: 1px solid #ddd; background: white; cursor: pointer; text-align: center; transition: all 0.2s; }
            .size-btn:hover { border-color: #999; }
            .size-btn.active { border-color: #000; background: #000; color: white; }
            
            .color-grid { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
            .color-swatch { width: 36px; height: 36px; border-radius: 50%; border: 1px solid #d1d5db; cursor: pointer; padding: 0; position: relative; transition: transform 0.2s; }
            .color-swatch:hover { transform: scale(1.1); }
            .color-swatch.active { border: 2px solid #000; box-shadow: 0 0 0 3px #fff inset; }
            
            .add-to-bag { padding: 16px; background: #000; color: white; width: 100%; border: none; font-size: 16px; font-weight: bold; cursor: pointer; transition: background 0.3s; margin-bottom: 12px; }
            .add-to-bag:hover { background: #333; }
            .add-to-bag:disabled { background: #ccc; cursor: not-allowed; }
            
            .service-features { display: flex; flex-direction: column; gap: 12px; padding: 20px 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee; margin-top: 20px; }
            .feature-row { display: flex; align-items: center; gap: 12px; font-size: 14px; color: #333; }
            
            @media (max-width: 900px) {
              .gallery-grid { grid-template-columns: 1fr; }
              .thumbnails { flex-direction: row; order: 2; overflow-x: auto; }
              .thumbnail { height: 80px; }
              .main-image-wrap { order: 1; max-height: 400px; }
              .main-image { max-height: 400px; padding: 12px; }
            }
          `}</style>
          
          <div className="product-layout">
            
            {/* LEFT: Image Gallery */}
            <div className="gallery-grid">
              <div className="thumbnails">
                {images.map((img, i) => (
                  <img 
                    key={i}
                    src={img} 
                    alt={`View ${i+1}`}
                    className={`thumbnail ${activeImage === i ? 'active' : ''}`}
                    onClick={() => setActiveImage(i)}
                  />
                ))}
              </div>
              <div className="main-image-wrap">
                <img src={previewImage || images[activeImage]} alt={product.name} className="main-image" />
                {product.old_price && parseFloat(product.old_price) > parseFloat(product.price) && (
                  <div style={{ position: 'absolute', top: 16, right: 16, background: '#000', color: 'white', padding: '4px 8px', fontSize: '14px', fontWeight: 'bold' }}>
                    -{Math.round(((product.old_price - product.price) / product.old_price) * 100)}%
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Product Info */}
            <div className="info-section">
              <div>
                <h1 className="pd-title">{product.name}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '12px 0' }}>
                  <div style={{ display: 'flex', color: '#000' }}>
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                  </div>
                  <span style={{ fontSize: '12px', color: '#666' }}>(42 Reviews)</span>
                </div>
              </div>

              <div>
                <div className="pd-price-wrap">
                  <span className="pd-price" style={{ color: isOutOfStock ? '#666' : '#d90429' }}>₵{parseFloat(product.price).toFixed(2)}</span>
                  {product.old_price && parseFloat(product.old_price) > parseFloat(product.price) && (
                    <span className="pd-old">₵{parseFloat(product.old_price).toFixed(2)}</span>
                  )}
                </div>
                {product.sku && <div className="pd-sku">SKU: {product.sku}</div>}
              </div>

              {product.parsedColors && product.parsedColors.length > 0 && (
                <div>
                  <div className="pd-options-title">Color: {selectedColor}</div>
                  <div className="color-grid">
                    {product.parsedColors.map((color, index) => (
                      <button 
                        key={color}
                        title={color}
                        className={`color-swatch ${selectedColor === color ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedColor(color);
                          
                          // Check if there is a specific image uploaded for this color!
                          if (product.variant_images && product.variant_images[color]) {
                            setPreviewImage(product.variant_images[color]);
                          } else {
                            setPreviewImage(null);
                            // Fallback to original magic index trick if no specific image was provided
                            if (index < images.length) {
                              setActiveImage(index);
                            }
                          }
                        }}
                        style={{ backgroundColor: getColorHex(color) }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {product.parsedSizes && product.parsedSizes.length > 0 && (
                <div>
                  <div className="pd-options-title">Size: {selectedSize}</div>
                  <div className="size-grid">
                    {product.parsedSizes.map(size => (
                      <button 
                        key={size}
                        className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <button 
                  className="add-to-bag"
                  onClick={() => addToCart(product, selectedSize, selectedColor)}
                  disabled={isOutOfStock}
                >
                  {isOutOfStock ? 'OUT OF STOCK' : 'ADD TO BAG'}
                </button>
                <button 
                  style={{ width: '100%', padding: '16px', background: isFavorite(product.id) ? '#f0f0f0' : 'transparent', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
                  onClick={() => toggleFavorite(product.id)}
                >
                  <Heart size={18} fill={isFavorite(product.id) ? "currentColor" : "none"} /> 
                  {isFavorite(product.id) ? "SAVED IN WISHLIST" : "SAVE FOR LATER"}
                </button>
              </div>

              {/* Product Description */}
              {product.description && (
                <div style={{ marginTop: '20px' }}>
                  <div className="pd-options-title">Description</div>
                  <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#444', whiteSpace: 'pre-wrap' }}>
                    {product.description}
                  </p>
                </div>
              )}

              <div className="service-features">
                <div className="feature-row">
                  <Truck size={20} />
                  <div>
                    <strong>Free standard shipping</strong>
                    <div style={{ fontSize: '12px', color: '#666' }}>On orders over ₵500</div>
                  </div>
                </div>
                <div className="feature-row">
                  <RotateCcw size={20} />
                  <div>
                    <strong>Free returns</strong>
                    <div style={{ fontSize: '12px', color: '#666' }}>Within 30 days of purchase</div>
                  </div>
                </div>
              </div>

              <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#666' }}>
                <Share2 size={16} /> Share this product
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
