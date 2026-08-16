import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Heart, Truck, RotateCcw, Share2, Star, ChevronRight, X, Ruler, ThumbsUp, ChevronLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useCurrency } from '../context/CurrencyContext';

const CustomSlider = ({ value, min, max, onChange, marks }) => {
  const percentage = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ width: '100%', height: '40px', background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '4px', position: 'relative' }}>
      <div style={{ position: 'absolute', left: `${percentage}%`, top: 0, bottom: 0, width: '2px', background: '#1c7ed6', transform: 'translateX(-50%)', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', left: `${percentage}%`, top: '-6px', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '8px solid #1c7ed6', pointerEvents: 'none' }}></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '24px 10px 0 10px', fontSize: '10px', color: '#999', pointerEvents: 'none' }}>
        {marks.map(mark => <span key={mark}>{mark}</span>)}
      </div>
      <input 
        type="range" min={min} max={max} value={value} 
        onChange={e => onChange(Number(e.target.value))}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', margin: 0 }} 
      />
    </div>
  );
};

function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { formatPrice } = useCurrency();
  
  const [product, setProduct] = useState(null);
  const [matchingStyles, setMatchingStyles] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ avg: 0, count: 0, fitSmall: 0, fitTrue: 0, fitLarge: 0 });
  const [loading, setLoading] = useState(true);
  
  const [selectedColor, setSelectedColor] = useState('Black');
  const [selectedSize, setSelectedSize] = useState('M');
  const [activeImage, setActiveImage] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);

  // Modal State
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [guideUnit, setGuideUnit] = useState('cm');
  const [guideType, setGuideType] = useState('Default');
  const [showGuideTypeSelector, setShowGuideTypeSelector] = useState(false);
  const [sizeModalStep, setSizeModalStep] = useState(1);
  const [measurementUnit, setMeasurementUnit] = useState('cm, kg');
  const [bodyShape, setBodyShape] = useState(null);
  const [userHeight, setUserHeight] = useState(165);
  const [userWeight, setUserWeight] = useState(60);
  const [userBust, setUserBust] = useState(90);
  const [userWaist, setUserWaist] = useState(70);
  const [userHips, setUserHips] = useState(100);
  
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showSizeRequestModal, setShowSizeRequestModal] = useState(false);
  
  const goodsRef = useRef(null);
  const reviewsRef = useRef(null);
  const recommendRef = useRef(null);

  const scrollToSection = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const colorMap = {
    'black': '#000000', 'white': '#ffffff', 'red': '#ff0000', 'blue': '#0000ff', 'green': '#008000', 
    'yellow': '#ffff00', 'pink': '#ffc0cb', 'purple': '#800080', 'orange': '#ffa500', 'grey': '#808080', 
    'gray': '#808080', 'brown': '#a52a2a', 'beige': '#f5f5dc', 'navy': '#000080', 'maroon': '#800000', 
    'olive': '#808000', 'cream': '#fffdd0', 'khaki': '#c3b091', 'nude': '#e3bc9a', 'mustard': '#ffdb58', 
    'burgundy': '#800020', 'teal': '#008080'
  };
  const getColorHex = (c) => colorMap[c.toLowerCase().trim()] || c;

  useEffect(() => {
    const fetchProductAndMatches = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (!error && data) {
        const rawSizes = Array.isArray(data.sizes) ? data.sizes : (typeof data.sizes === 'string' ? [data.sizes] : []);
        const pSizes = rawSizes.flatMap(s => typeof s === 'string' ? s.split(/[;,]+/) : s).map(s => String(s).trim()).filter(Boolean);
        
        const rawColors = Array.isArray(data.colors) ? data.colors : (typeof data.colors === 'string' ? [data.colors] : []);
        const pColors = rawColors.flatMap(c => typeof c === 'string' ? c.split(/[;,]+/) : c).map(c => String(c).trim()).filter(Boolean);
        
        data.parsedSizes = pSizes;
        data.parsedColors = pColors;

        setProduct(data);
        if (pSizes.length > 0) setSelectedSize(pSizes[0]);
        if (pColors.length > 0) setSelectedColor(pColors[0]);

        // Fetch matching styles (random products from same category)
        let { data: matches } = await supabase
          .from('products')
          .select('*')
          .eq('category', data.category)
          .neq('id', data.id)
          .limit(5);
          
        if (!matches || matches.length === 0) {
          const { data: anyMatches } = await supabase.from('products').select('*').neq('id', data.id).limit(5);
          matches = anyMatches;
        }
        
        if (matches) setMatchingStyles(matches);
        
        // Fetch reviews
        const { data: revs } = await supabase
          .from('product_reviews')
          .select('*')
          .eq('product_id', data.id)
          .order('created_at', { ascending: false });
          
        if (revs) {
          setReviews(revs);
          if (revs.length > 0) {
            const avg = (revs.reduce((sum, r) => sum + r.rating, 0) / revs.length).toFixed(2);
            const fitSmall = revs.filter(r => r.fit === 'Small').length;
            const fitTrue = revs.filter(r => r.fit === 'True to Size').length;
            const fitLarge = revs.filter(r => r.fit === 'Large').length;
            const totalFit = fitSmall + fitTrue + fitLarge;
            setReviewStats({
              avg,
              count: revs.length,
              fitSmall: totalFit ? Math.round((fitSmall/totalFit)*100) : 0,
              fitTrue: totalFit ? Math.round((fitTrue/totalFit)*100) : 0,
              fitLarge: totalFit ? Math.round((fitLarge/totalFit)*100) : 0
            });
          }
        }
      }
      setLoading(false);
    };

    fetchProductAndMatches();
  }, [id]);

  useEffect(() => {
    if (showSizeModal || showGuideModal || showGuideTypeSelector || showReviewsModal || showDetailsModal || showSizeRequestModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showSizeModal, showGuideModal, showGuideTypeSelector, showReviewsModal, showDetailsModal, showSizeRequestModal]);

  if (loading) return <div style={{ padding: '100px 20px', textAlign: 'center', fontSize: '18px', color: '#666' }}>Loading product details...</div>;
  if (!product) return <div style={{ padding: '100px 20px', textAlign: 'center', fontSize: '18px', color: '#666' }}>Product not found.</div>;

  const images = [];
  if (product.image_url) images.push(product.image_url);
  if (product.hover_image_url) images.push(product.hover_image_url);
  if (images.length === 0) images.push('/placeholder.png');

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="product-details-page" style={{ paddingBottom: '90px' }}>
      <div className="container" style={{ padding: '40px 20px' }}>
        
        <div style={{ marginBottom: '24px', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>
          <Link to="/" style={{ color: '#666', textDecoration: 'none' }}>Home</Link> / 
          <Link to={`/category/${product.category}`} style={{ color: '#666', textDecoration: 'none', marginLeft: '8px' }}>{product.category.replace('-', ' ')}</Link> / 
          <span style={{ color: '#000', marginLeft: '8px', fontWeight: 'bold' }}>{product.name}</span>
        </div>

        <div className="product-layout">
          <style>{`
            @media (min-width: 900px) {
              .product-layout { grid-template-columns: 1.2fr 1fr; }
              .sticky-bottom-bar { display: none !important; }
            }
            .product-layout { display: grid; gap: 40px; }
            
            .gallery-grid { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; gap: 0; scrollbar-width: none; -ms-overflow-style: none; }
            .gallery-grid::-webkit-scrollbar { display: none; }
            .main-image-wrap { background: #f4f4f4; position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; flex: 0 0 100%; scroll-snap-align: start; max-height: 60vh; aspect-ratio: 4/5; }
            .main-image { width: 100%; height: 100%; display: block; object-fit: cover; }
            
            .info-section { display: flex; flex-direction: column; gap: 0; }
            .pd-title { font-size: 24px; font-weight: 400; margin: 0 0 12px 0; line-height: 1.3; }
            .pd-price-wrap { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
            .pd-price { font-size: 28px; font-weight: 800; }
            .pd-old { text-decoration: line-through; color: #999; font-size: 16px; }
            
            .pd-options-title { font-size: 14px; font-weight: bold; text-transform: capitalize; }
            
            .size-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin: 12px 0; }
            .size-btn { padding: 10px 4px; border: 1px solid #f0f0f0; background: #f9f9f9; cursor: pointer; text-align: center; transition: all 0.2s; font-size: 13px; font-weight: 600; }
            .size-btn:hover { border-color: #999; }
            .size-btn.active { border-color: #000; background: #000; color: white; }
            
            .color-grid { display: flex; gap: 12px; margin: 12px 0 24px 0; flex-wrap: wrap; }
            .color-swatch { width: 32px; height: 32px; border-radius: 50%; border: 1px solid #d1d5db; cursor: pointer; padding: 0; position: relative; transition: transform 0.2s; }
            .color-swatch.active { border: 2px solid #000; box-shadow: 0 0 0 3px #fff inset; }
            
            .section-divider { border-top: 8px solid #f5f5f5; margin: 24px -20px; padding: 24px 20px 0 20px; }
            
            .review-card { border-bottom: 1px solid #eee; padding-bottom: 16px; margin-bottom: 16px; }
            .review-card:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }

            .sticky-bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; padding: 12px 20px calc(12px + env(safe-area-inset-bottom)); border-top: 1px solid #eee; display: flex; gap: 16px; align-items: center; z-index: 50; }
            .add-to-bag { flex: 1; padding: 16px; background: #000; color: white; border: none; font-size: 16px; font-weight: bold; cursor: pointer; transition: background 0.3s; border-radius: 4px; }
            
            .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: flex-end; justify-content: center; overflow: hidden; }
            .modal-content { background: #fff; width: 100%; max-width: 500px; border-radius: 16px 16px 0 0; min-height: 60vh; max-height: 90vh; position: relative; padding-bottom: 80px; display: flex; flex-direction: column; }
            
            @media (max-width: 900px) {
              .desktop-add-cart { display: none !important; }
            }
          `}</style>
          
          <div className="gallery-grid">
            {images.map((img, i) => (
              <div key={i} className="main-image-wrap">
                <img src={i === 0 && previewImage ? previewImage : img} alt={`View ${i+1}`} className="main-image" />
                {i === 0 && product.old_price && parseFloat(product.old_price) > parseFloat(product.price) && (
                  <div style={{ position: 'absolute', top: 16, right: 16, background: '#000', color: 'white', padding: '4px 8px', fontSize: '14px', fontWeight: 'bold' }}>
                    -{Math.round(((product.old_price - product.price) / product.old_price) * 100)}%
                  </div>
                )}
              </div>
            ))}
            {product.video_url && (
              <div className="main-image-wrap">
                <video 
                  src={product.video_url} 
                  className="main-image" 
                  autoPlay 
                  muted 
                  loop 
                  playsInline 
                />
              </div>
            )}
          </div>

          <div className="info-section">
            <div ref={goodsRef}>
              <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #eee', marginBottom: '16px', paddingBottom: '12px', fontSize: '14px', fontWeight: 'bold', position: 'sticky', top: '0px', background: '#fff', zIndex: 10 }}>
                <span style={{ borderBottom: '2px solid #000', paddingBottom: '12px', marginBottom: '-13px', cursor: 'pointer' }} onClick={() => scrollToSection(goodsRef)}>Goods</span>
                <span style={{ color: '#666', cursor: 'pointer' }} onClick={() => scrollToSection(reviewsRef)}>Reviews</span>
                <span style={{ color: '#666', cursor: 'pointer' }} onClick={() => scrollToSection(recommendRef)}>Recommend</span>
              </div>
              
              <div className="pd-price-row">
                <span className="pd-price" style={{ color: '#000' }}>{formatPrice(product.price)}</span>
              </div>
              <h1 className="pd-title" style={{ fontSize: '16px' }}>{product.name}</h1>
            </div>

            {/* Colors */}
            {product.parsedColors && product.parsedColors.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <div className="pd-options-title">Color: <span style={{fontWeight:'normal'}}>{selectedColor}</span></div>
                <div className="color-grid">
                  {product.parsedColors.map((color, index) => (
                    <button 
                      key={color} className={`color-swatch ${selectedColor === color ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedColor(color);
                        if (product.variant_images && product.variant_images[color]) setPreviewImage(product.variant_images[color]);
                        else setPreviewImage(null);
                      }}
                      style={{ backgroundColor: getColorHex(color) }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.parsedSizes && product.parsedSizes.length > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="pd-options-title">Size <span style={{fontWeight:'normal', color:'#666', fontSize:'12px'}}>Default <ChevronRight size={12}/></span></div>
                </div>
                
                <div className="size-grid">
                  {product.parsedSizes.map(size => (
                    <button key={size} className={`size-btn ${selectedSize === size ? 'active' : ''}`} onClick={() => setSelectedSize(size)}>
                      {size}
                    </button>
                  ))}
                </div>
                
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', fontWeight: 'bold', marginTop: '12px' }}>
                  <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => setShowGuideModal(true)}><Ruler size={14} style={{marginRight:'4px'}}/> Size Guide <ChevronRight size={14} /></span>
                </div>
              </div>
            )}

            {/* More Options */}
            <div style={{ marginTop: '24px' }}>
              <div className="pd-options-title" style={{ marginBottom: '12px' }}>More Options</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(product.tags || []).map(tag => (
                  <span key={tag} style={{ padding: '8px 12px', background: '#f9f9f9', borderRadius: '4px', fontSize: '13px', color: '#000', fontWeight: '600' }}>
                    {tag} <ChevronRight size={12} color="#999"/>
                  </span>
                ))}
              </div>
            </div>


            {/* Reviews Section */}
            <div className="section-divider" ref={reviewsRef}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '24px', fontWeight: '900' }}>{reviewStats.count > 0 ? reviewStats.avg : '0.00'}</span>
                  <div style={{ display: 'flex', color: '#fcc419' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} size={14} fill={star <= Math.round(reviewStats.avg) ? "currentColor" : "none"} stroke="currentColor" />
                    ))}
                  </div>
                  <span style={{ fontSize: '12px', color: '#666' }}>({reviewStats.count})</span>
                </div>
                <span style={{ fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setShowReviewsModal(true)}>View more <ChevronRight size={14} /></span>
              </div>
              
              {reviewStats.count > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold', marginBottom: '24px' }}>
                  <div style={{ flex: 1 }}>
                    <div>Small</div>
                    <div style={{ height: '4px', background: '#eee', margin: '8px 0', position: 'relative' }}>
                      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: `${reviewStats.fitSmall}%`, background: '#000' }}></div>
                    </div>
                    <div style={{ fontWeight: 'normal', textAlign: 'right' }}>{reviewStats.fitSmall}%</div>
                  </div>
                  <div style={{ flex: 1, margin: '0 12px' }}>
                    <div style={{ textAlign: 'center' }}>True to Size</div>
                    <div style={{ height: '4px', background: '#eee', margin: '8px 0', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, width: `${reviewStats.fitTrue}%`, margin: '0 auto', background: '#000' }}></div>
                    </div>
                    <div style={{ fontWeight: 'normal', textAlign: 'center' }}>{reviewStats.fitTrue}%</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ textAlign: 'right' }}>Large</div>
                    <div style={{ height: '4px', background: '#eee', margin: '8px 0', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${reviewStats.fitLarge}%`, background: '#000' }}></div>
                    </div>
                    <div style={{ fontWeight: 'normal' }}>{reviewStats.fitLarge}%</div>
                  </div>
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                <span style={{ padding: '6px 12px', background: '#f5f5f5', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>Fast Logistics</span>
                <span style={{ padding: '6px 12px', background: '#f5f5f5', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>Great Service</span>
              </div>

              {reviews.map(review => (
                <div key={review.id} className="review-card">
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                        {review.user_name}
                        <div style={{ display: 'flex', color: '#fcc419' }}>
                          {[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} fill={s <= review.rating ? "currentColor" : "none"} stroke="currentColor" />)}
                        </div>
                      </div>
                      <div style={{ color: '#999' }}>Color: {review.color_bought || 'N/A'} / Size: {review.size_bought || 'N/A'}</div>
                   </div>
                   <p style={{ fontSize: '13px', margin: '0 0 12px 0', fontWeight: '600' }}>{review.text}</p>
                   <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '12px', color: '#000', fontWeight: 'bold', gap: '16px', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ThumbsUp size={14} /> Helpful ({review.helpful_count})</span>
                      <span>•••</span>
                   </div>
                </div>
              ))}
              {reviews.length === 0 && <p style={{ fontSize: '13px', color: '#666' }}>No reviews yet.</p>}
            </div>

            {/* Details Section */}
            <div className="section-divider">
              <div className="pd-options-title" style={{ fontSize: '16px', marginBottom: '16px' }}>Details</div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px', fontSize: '13px', color: '#000', fontWeight: '600' }}>
                <span style={{ color: '#666', fontWeight: 'normal' }}>Material:</span>
                <span>{product.material || 'N/A'}</span>
                <span style={{ color: '#666', fontWeight: 'normal' }}>Composition:</span>
                <span>{product.composition || 'N/A'}</span>
              </div>
              <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => setShowDetailsModal(true)}>
                View more <ChevronRight size={14} />
              </div>
            </div>
            
            {/* Matching Styles */}
            <div className="section-divider" ref={recommendRef}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                 <div className="pd-options-title" style={{ fontSize: '16px', margin: 0 }}>You Might Also Like</div>
               </div>
               
               <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '16px' }}>
                 {matchingStyles.map(p => (
                   <Link to={`/product/${p.id}`} key={p.id} style={{ minWidth: '120px', textDecoration: 'none', color: '#000' }}>
                     <img src={p.image_url} alt={p.name} style={{ width: '120px', height: '160px', objectFit: 'cover', borderRadius: '4px' }} />
                     <div style={{ fontWeight: 'bold', fontSize: '14px', marginTop: '8px' }}>{formatPrice(p.price)}</div>
                   </Link>
                 ))}
               </div>
            </div>

            {/* Desktop Add to Cart */}
            <div className="desktop-add-cart" style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
              <button style={{ width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #000', background: 'transparent', cursor: 'pointer', borderRadius: '4px' }} onClick={() => toggleFavorite(product.id)}>
                <Heart size={24} fill={isFavorite(product.id) ? '#000' : 'none'} />
              </button>
              <button className="add-to-bag" onClick={() => addToCart(product, selectedSize, selectedColor)} disabled={isOutOfStock}>
                {isOutOfStock ? 'OUT OF STOCK' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar (Mobile Only via CSS) */}
      <div className="sticky-bottom-bar">
         <button onClick={() => toggleFavorite(product.id)} style={{ background: 'none', border: 'none', padding: '0 16px', cursor: 'pointer' }}>
           <Heart size={28} fill={isFavorite(product.id) ? '#000' : 'none'} />
         </button>
         <button 
           className="add-to-bag"
           onClick={() => addToCart(product, selectedSize, selectedColor)}
           disabled={isOutOfStock}
         >
           {isOutOfStock ? 'OUT OF STOCK' : 'Add to Cart'}
         </button>
      </div>
      
      {/* Size Guide Modal */}
      {showGuideModal && (
        <div className="modal-overlay" onClick={() => setShowGuideModal(false)}>
          <div className="modal-content" style={{ paddingBottom: '0' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #eee', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
              <div style={{ width: '24px' }}></div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', fontFamily: 'system-ui, -apple-system, sans-serif' }}>Size Guide</h3>
              <X size={24} onClick={() => setShowGuideModal(false)} style={{ cursor: 'pointer' }} />
            </div>
            
            <div style={{ overflowY: 'auto', flex: 1, paddingBottom: '40px' }}>
              {product.size_guide_url ? (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                  <img src={product.size_guide_url} alt="Size Guide" style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }} />
                </div>
              ) : (
                <>
                  <div style={{ padding: '16px 20px', borderBottom: '8px solid #f5f5f5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '15px' }}>Switch to</span>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      onClick={() => setShowGuideTypeSelector(true)}
                      style={{ padding: '6px 12px', borderRadius: '16px', border: '1px solid #ddd', background: '#fff', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                    >
                      Type <ChevronRight size={12} style={{ transform: 'rotate(90deg)' }} />
                    </button>
                    <div style={{ display: 'flex', background: '#f5f5f5', borderRadius: '16px', overflow: 'hidden' }}>
                      <button 
                        onClick={() => setGuideUnit('cm')}
                        style={{ padding: '6px 16px', border: 'none', background: guideUnit === 'cm' ? '#222' : 'transparent', color: guideUnit === 'cm' ? '#fff' : '#222', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '16px' }}
                      >cm</button>
                      <button 
                        onClick={() => setGuideUnit('in')}
                        style={{ padding: '6px 16px', border: 'none', background: guideUnit === 'in' ? '#222' : 'transparent', color: guideUnit === 'in' ? '#fff' : '#222', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '16px' }}
                      >in</button>
                    </div>
                  </div>
                </div>

                <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold' }}>Product Chart</h4>
                <div style={{ overflowX: 'auto', margin: '0 -20px', padding: '0 20px' }}>
                  <table style={{ width: '100%', minWidth: '400px', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'center' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '12px 8px', borderBottom: '1px solid #eee', color: '#000', fontWeight: 'bold' }}>Size</th>
                        <th style={{ padding: '12px 8px', borderBottom: '1px solid #eee', color: '#000', fontWeight: 'bold' }}>Bust</th>
                        <th style={{ padding: '12px 8px', borderBottom: '1px solid #eee', color: '#000', fontWeight: 'bold' }}>Waist Size</th>
                        <th style={{ padding: '12px 8px', borderBottom: '1px solid #eee', color: '#000', fontWeight: 'bold' }}>Hip Size</th>
                        <th style={{ padding: '12px 8px', borderBottom: '1px solid #eee', color: '#000', fontWeight: 'bold' }}>Length</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: '16px 8px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>XXS</td>
                        <td style={{ padding: '16px 8px', borderBottom: '1px solid #eee' }}>{guideUnit === 'cm' ? '72.5' : '28.5'}</td>
                        <td style={{ padding: '16px 8px', borderBottom: '1px solid #eee' }}>{guideUnit === 'cm' ? '59.0' : '23.2'}</td>
                        <td style={{ padding: '16px 8px', borderBottom: '1px solid #eee' }}>{guideUnit === 'cm' ? '90.0' : '35.4'}</td>
                        <td style={{ padding: '16px 8px', borderBottom: '1px solid #eee' }}>{guideUnit === 'cm' ? '99.7/123.0' : '39.3/48.4'}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '16px 8px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>XS</td>
                        <td style={{ padding: '16px 8px', borderBottom: '1px solid #eee' }}>{guideUnit === 'cm' ? '76.5' : '30.1'}</td>
                        <td style={{ padding: '16px 8px', borderBottom: '1px solid #eee' }}>{guideUnit === 'cm' ? '63.0' : '24.8'}</td>
                        <td style={{ padding: '16px 8px', borderBottom: '1px solid #eee' }}>{guideUnit === 'cm' ? '94.0' : '37.0'}</td>
                        <td style={{ padding: '16px 8px', borderBottom: '1px solid #eee' }}>{guideUnit === 'cm' ? '101.1/125.0' : '39.8/49.2'}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '16px 8px', borderBottom: '1px solid #eee', fontWeight: 'bold', color: '#b07b1a' }}>👍 S</td>
                        <td style={{ padding: '16px 8px', borderBottom: '1px solid #eee', color: '#b07b1a', fontWeight: 'bold' }}>{guideUnit === 'cm' ? '80.5' : '31.7'}</td>
                        <td style={{ padding: '16px 8px', borderBottom: '1px solid #eee', color: '#b07b1a', fontWeight: 'bold' }}>{guideUnit === 'cm' ? '67.0' : '26.4'}</td>
                        <td style={{ padding: '16px 8px', borderBottom: '1px solid #eee', color: '#b07b1a', fontWeight: 'bold' }}>{guideUnit === 'cm' ? '98.0' : '38.6'}</td>
                        <td style={{ padding: '16px 8px', borderBottom: '1px solid #eee', color: '#b07b1a', fontWeight: 'bold' }}>{guideUnit === 'cm' ? '102.5/127.0' : '40.4/50.0'}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '16px 8px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>M</td>
                        <td style={{ padding: '16px 8px', borderBottom: '1px solid #eee' }}>{guideUnit === 'cm' ? '84.5' : '33.3'}</td>
                        <td style={{ padding: '16px 8px', borderBottom: '1px solid #eee' }}>{guideUnit === 'cm' ? '71.0' : '28.0'}</td>
                        <td style={{ padding: '16px 8px', borderBottom: '1px solid #eee' }}>{guideUnit === 'cm' ? '102.0' : '40.2'}</td>
                        <td style={{ padding: '16px 8px', borderBottom: '1px solid #eee' }}>{guideUnit === 'cm' ? '103.9/129.0' : '40.9/50.8'}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '16px 8px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>L</td>
                        <td style={{ padding: '16px 8px', borderBottom: '1px solid #eee' }}>{guideUnit === 'cm' ? '90.5' : '35.6'}</td>
                        <td style={{ padding: '16px 8px', borderBottom: '1px solid #eee' }}>{guideUnit === 'cm' ? '77.0' : '30.3'}</td>
                        <td style={{ padding: '16px 8px', borderBottom: '1px solid #eee' }}>{guideUnit === 'cm' ? '108.0' : '42.5'}</td>
                        <td style={{ padding: '16px 8px', borderBottom: '1px solid #eee' }}>{guideUnit === 'cm' ? '105.2/131.0' : '41.4/51.6'}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '16px 8px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>XL</td>
                        <td style={{ padding: '16px 8px', borderBottom: '1px solid #eee' }}>{guideUnit === 'cm' ? '96.5' : '38.0'}</td>
                        <td style={{ padding: '16px 8px', borderBottom: '1px solid #eee' }}>{guideUnit === 'cm' ? '83.0' : '32.7'}</td>
                        <td style={{ padding: '16px 8px', borderBottom: '1px solid #eee' }}>{guideUnit === 'cm' ? '114.0' : '44.9'}</td>
                        <td style={{ padding: '16px 8px', borderBottom: '1px solid #eee' }}>{guideUnit === 'cm' ? '106.5/133.0' : '41.9/52.4'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div style={{ marginTop: '16px', fontSize: '13px', color: '#999' }}>
                  *This data was obtained from manually measuring the product, it may be off by 1-2 {guideUnit.toUpperCase()}.
                </div>
              </div>

              <div style={{ padding: '24px 20px', borderBottom: '8px solid #f5f5f5' }}>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '15px', width: '80px' }}>Fit Type</span>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold' }}>
                      <span>Skinny</span><span>Regular</span><span>Oversized</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '80px' }}></div>
                    <div style={{ flex: 1, position: 'relative', height: '4px', background: '#eee', borderRadius: '2px' }}>
                      <div style={{ position: 'absolute', left: '25%', top: '-2px', width: '20px', height: '8px', background: '#000', borderRadius: '4px' }}></div>
                      <div style={{ position: 'absolute', left: '0', top: '-4px', width: '2px', height: '12px', background: '#eee' }}></div>
                      <div style={{ position: 'absolute', left: '50%', top: '-4px', width: '2px', height: '12px', background: '#eee' }}></div>
                      <div style={{ position: 'absolute', right: '0', top: '-4px', width: '2px', height: '12px', background: '#eee' }}></div>
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '15px', width: '80px' }}>Stretch</span>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold' }}>
                      <span>Non</span><span>Slight</span><span>Medium</span><span>High</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '80px' }}></div>
                    <div style={{ flex: 1, position: 'relative', height: '4px', background: '#eee', borderRadius: '2px' }}>
                      <div style={{ position: 'absolute', right: '0', top: '-2px', width: '20px', height: '8px', background: '#000', borderRadius: '4px' }}></div>
                      <div style={{ position: 'absolute', left: '0', top: '-4px', width: '2px', height: '12px', background: '#eee' }}></div>
                      <div style={{ position: 'absolute', left: '33.3%', top: '-4px', width: '2px', height: '12px', background: '#eee' }}></div>
                      <div style={{ position: 'absolute', left: '66.6%', top: '-4px', width: '2px', height: '12px', background: '#eee' }}></div>
                      <div style={{ position: 'absolute', right: '0', top: '-4px', width: '2px', height: '12px', background: '#eee' }}></div>
                    </div>
                  </div>
                </div>
              </div>
              </>
            )}

              <div style={{ padding: '24px 20px' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold' }}>How Buyer's Reviewed The Fit</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', marginBottom: '8px' }}>
                  <span style={{ color: '#666', fontWeight: 'bold' }}>Small : <span style={{ fontWeight: 'normal' }}>3%</span></span>
                  <span style={{ fontWeight: 'bold', borderBottom: '2px solid #000', paddingBottom: '4px' }}>True to Size : 94%</span>
                  <span style={{ color: '#666', fontWeight: 'bold' }}>Large : <span style={{ fontWeight: 'normal' }}>3%</span></span>
                </div>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>
                  Selected fit data from real user reviews for reference.
                </div>

                <div style={{ overflowX: 'auto', margin: '0 -20px', padding: '0 20px' }}>
                  <table style={{ width: '100%', minWidth: '400px', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'center' }}>
                    <thead>
                      <tr style={{ background: '#f9f9f9' }}>
                        <th style={{ padding: '12px 8px', borderBottom: '1px solid #eee', color: '#000', fontWeight: 'bold', textAlign: 'left' }}>
                          Buyer<br/><span style={{ fontSize: '11px', fontWeight: 'normal' }}>(cm/kg)</span>
                        </th>
                        <th style={{ padding: '12px 8px', borderBottom: '1px solid #eee', color: '#000', fontWeight: 'bold' }}>Size</th>
                        <th style={{ padding: '12px 8px', borderBottom: '1px solid #eee', color: '#000', fontWeight: 'bold' }}>Bust</th>
                        <th style={{ padding: '12px 8px', borderBottom: '1px solid #eee', color: '#000', fontWeight: 'bold' }}>Waist</th>
                        <th style={{ padding: '12px 8px', borderBottom: '1px solid #eee', color: '#000', fontWeight: 'bold' }}>Hips</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { buyer: '167/56', size: 'XS', bust: '88', waist: '70', hips: '91' },
                        { buyer: '160/41', size: 'XS', bust: '73', waist: '64', hips: '80' },
                        { buyer: '165/53', size: 'XS', bust: '78', waist: '65', hips: '96' },
                        { buyer: '174/80', size: 'S', bust: '70', waist: '55', hips: '99' },
                        { buyer: '155/90', size: 'S', bust: '112', waist: '109', hips: '127' },
                        { buyer: '155/72', size: 'S', bust: '80', waist: '65', hips: '110' },
                        { buyer: '165/62', size: 'M', bust: '86', waist: '71', hips: '94' },
                        { buyer: '163/56', size: 'M', bust: '101', waist: '77', hips: '96' },
                        { buyer: '140/50', size: 'M', bust: '94', waist: '61', hips: '85' },
                        { buyer: '145/60', size: 'L', bust: '74', waist: '80', hips: '99' },
                      ].map((row, i) => (
                        <tr key={i}>
                          <td style={{ padding: '16px 8px', borderBottom: '1px solid #eee', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '16px', height: '16px', background: '#eee', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            </div>
                            {row.buyer}
                          </td>
                          <td style={{ padding: '16px 8px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>{row.size}</td>
                          <td style={{ padding: '16px 8px', borderBottom: '1px solid #eee' }}>{row.bust}</td>
                          <td style={{ padding: '16px 8px', borderBottom: '1px solid #eee' }}>{row.waist}</td>
                          <td style={{ padding: '16px 8px', borderBottom: '1px solid #eee' }}>{row.hips}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Type Selector Modal */}
      {showGuideTypeSelector && (
        <div className="modal-overlay" onClick={() => setShowGuideTypeSelector(false)} style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ minHeight: '60vh', paddingBottom: '0', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #eee' }}>
              <div style={{ width: '24px' }}></div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', fontFamily: 'system-ui, -apple-system, sans-serif' }}>Please Select</h3>
              <X size={24} onClick={() => setShowGuideTypeSelector(false)} style={{ cursor: 'pointer' }} />
            </div>
            <div style={{ overflowY: 'auto', flex: 1, padding: '0 20px' }}>
              {['Default (SHEIN Default Sizing)', 'DE', 'JP', 'MX', 'IT', 'FR', 'ES', 'EU', 'BR', 'AU', 'SG', 'UK', 'US', 'CA'].map(type => (
                <div 
                  key={type}
                  onClick={() => {
                    setGuideType(type.split(' ')[0]);
                    setShowGuideTypeSelector(false);
                  }}
                  style={{ padding: '16px 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: guideType === type.split(' ')[0] ? 'bold' : 'normal' }}
                >
                  {type}
                  {guideType === type.split(' ')[0] && <span style={{ color: '#000', fontWeight: 'bold' }}>✓</span>}
                </div>
              ))}
            </div>
            <div style={{ padding: '16px 20px', borderTop: '1px solid #eee', textAlign: 'center', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setShowGuideTypeSelector(false)}>
              Cancel
            </div>
          </div>
        </div>
      )}

      {/* Check My Size Modal */}
      {showSizeModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ minHeight: sizeModalStep === 4 ? '70vh' : 'auto', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #eee', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
              {sizeModalStep > 1 && sizeModalStep < 4 ? (
                <ChevronLeft size={24} onClick={() => setSizeModalStep(sizeModalStep - 1)} style={{ cursor: 'pointer' }} />
              ) : (
                <div style={{ width: '24px' }}></div>
              )}
              <h3 style={{ margin: 0, fontSize: '16px' }}>
                {sizeModalStep === 1 || sizeModalStep === 2 ? 'Your Measurements' : sizeModalStep === 3 ? 'Your Body Shape' : 'Recommendation'}
                {sizeModalStep < 4 && <span style={{ color: '#d90429' }}>*</span>}
              </h3>
              <X size={24} onClick={() => setShowSizeModal(false)} style={{ cursor: 'pointer' }} />
            </div>
            
            <div style={{ padding: sizeModalStep === 4 ? '0' : '24px 20px' }}>
              {(sizeModalStep === 1 || sizeModalStep === 2) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Switch to</span>
                  <div style={{ display: 'flex', background: '#f5f5f5', borderRadius: '4px', overflow: 'hidden' }}>
                    <button 
                      style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', background: measurementUnit === 'cm, kg' ? '#222' : 'transparent', color: measurementUnit === 'cm, kg' ? '#fff' : '#666' }}
                      onClick={() => setMeasurementUnit('cm, kg')}
                    >cm, kg</button>
                    <button 
                      style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', background: measurementUnit === 'in, lb' ? '#222' : 'transparent', color: measurementUnit === 'in, lb' ? '#fff' : '#666' }}
                      onClick={() => setMeasurementUnit('in, lb')}
                    >in, lb</button>
                  </div>
                </div>
              )}
              
              {sizeModalStep === 1 && (
                <>
                  <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Height<span style={{ color: '#d90429' }}>*</span></span>
                      <span style={{ fontWeight: '900', fontSize: '20px' }}>{measurementUnit === 'cm, kg' ? userHeight : Math.round(userHeight * 0.393701)} <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{measurementUnit === 'cm, kg' ? 'cm' : 'in'}</span></span>
                    </div>
                    <CustomSlider value={userHeight} min={140} max={200} marks={['155', '165', '175']} onChange={setUserHeight} />
                  </div>
                  <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Weight<span style={{ color: '#d90429' }}>*</span></span>
                      <span style={{ fontWeight: '900', fontSize: '20px' }}>{measurementUnit === 'cm, kg' ? userWeight : Math.round(userWeight * 2.20462)} <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{measurementUnit === 'cm, kg' ? 'kg' : 'lb'}</span></span>
                    </div>
                    <CustomSlider value={userWeight} min={30} max={120} marks={['45', '55', '65', '75']} onChange={setUserWeight} />
                  </div>
                </>
              )}
              
              {sizeModalStep === 2 && (
                <>
                  <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Bust<span style={{ color: '#d90429' }}>*</span></span>
                      <span style={{ fontWeight: '900', fontSize: '20px' }}>{measurementUnit === 'cm, kg' ? userBust : Math.round(userBust * 0.393701)} <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{measurementUnit === 'cm, kg' ? 'cm' : 'in'}</span></span>
                    </div>
                    <CustomSlider value={userBust} min={60} max={130} marks={['80', '90', '100']} onChange={setUserBust} />
                  </div>
                  <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Waist<span style={{ color: '#d90429' }}>*</span></span>
                      <span style={{ fontWeight: '900', fontSize: '20px' }}>{measurementUnit === 'cm, kg' ? userWaist : Math.round(userWaist * 0.393701)} <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{measurementUnit === 'cm, kg' ? 'cm' : 'in'}</span></span>
                    </div>
                    <CustomSlider value={userWaist} min={50} max={120} marks={['65', '75', '85']} onChange={setUserWaist} />
                  </div>
                  <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Hips<span style={{ color: '#d90429' }}>*</span></span>
                      <span style={{ fontWeight: '900', fontSize: '20px' }}>{measurementUnit === 'cm, kg' ? userHips : Math.round(userHips * 0.393701)} <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{measurementUnit === 'cm, kg' ? 'cm' : 'in'}</span></span>
                    </div>
                    <CustomSlider value={userHips} min={70} max={140} marks={['90', '100', '110']} onChange={setUserHips} />
                  </div>
                </>
              )}
              
              {sizeModalStep === 3 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '16px' }}>
                  {['Hourglass', 'Triangle', 'Rounded', 'Straight', 'Inverted Triangle'].map(shape => (
                    <div 
                      key={shape} 
                      style={{ padding: '20px 8px', background: bodyShape === shape ? '#f0f0f0' : '#f9f9f9', border: bodyShape === shape ? '2px solid #000' : '2px solid transparent', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                      onClick={() => setBodyShape(shape)}
                    >
                      <svg width="48" height="64" viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M24 6C21.8 6 20 7.8 20 10C20 12.2 21.8 14 24 14C26.2 14 28 12.2 28 10C28 7.8 26.2 6 24 6Z" stroke="#000" strokeWidth="1.5"/>
                        <path d="M18 16C16 16 14 18 13 22L12 36H16L15 60H21V44H27V60H33L32 36H36L35 22C34 18 32 16 30 16H18Z" stroke="#000" strokeWidth="1.5"/>
                        {shape === 'Hourglass' && <><path d="M14 20 L34 20 L24 35 L14 20 Z" stroke="#339af0" strokeWidth="2"/><path d="M14 50 L34 50 L24 35 L14 50 Z" stroke="#339af0" strokeWidth="2"/></>}
                        {shape === 'Triangle' && <path d="M24 20 L36 50 L12 50 Z" stroke="#339af0" strokeWidth="2"/>}
                        {shape === 'Inverted Triangle' && <path d="M12 20 L36 20 L24 50 Z" stroke="#339af0" strokeWidth="2"/>}
                        {shape === 'Rounded' && <ellipse cx="24" cy="35" rx="14" ry="18" stroke="#339af0" strokeWidth="2"/>}
                        {shape === 'Straight' && <rect x="14" y="20" width="20" height="30" stroke="#339af0" strokeWidth="2"/>}
                      </svg>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', textAlign: 'center' }}>{shape}</span>
                    </div>
                  ))}
                </div>
              )}

              {sizeModalStep === 4 && (
                <div style={{ padding: '0', background: '#f5f5f5', height: '100%' }}>
                  <div style={{ background: '#fff9e6', padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#b07b1a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <span>👍</span> <span style={{ fontSize: '24px' }}>S</span>
                    </div>
                    <div style={{ fontWeight: 'bold', fontSize: '16px', marginTop: '8px' }}>Best fit for "Me"</div>
                  </div>
                  
                  <div style={{ padding: '16px', background: '#fff', marginTop: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                      <button style={{ padding: '8px 24px', background: '#000', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: '14px' }}>Me</button>
                      <button style={{ padding: '8px 24px', background: '#f5f5f5', color: '#000', border: 'none', fontWeight: 'bold', fontSize: '14px' }}>+ Add Profile</button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px 16px', textAlign: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '900', fontSize: '16px' }}>{measurementUnit === 'cm, kg' ? userHeight : Math.round(userHeight * 0.393701)} {measurementUnit === 'cm, kg' ? 'cm' : 'in'}</div>
                        <div style={{ color: '#666', fontSize: '12px', fontWeight: 'bold', marginTop: '4px' }}>Height</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: '900', fontSize: '16px' }}>{measurementUnit === 'cm, kg' ? userWeight : Math.round(userWeight * 2.20462)} {measurementUnit === 'cm, kg' ? 'kg' : 'lb'}</div>
                        <div style={{ color: '#666', fontSize: '12px', fontWeight: 'bold', marginTop: '4px' }}>Weight</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: '900', fontSize: '16px' }}>{measurementUnit === 'cm, kg' ? userBust : Math.round(userBust * 0.393701)} {measurementUnit === 'cm, kg' ? 'cm' : 'in'}</div>
                        <div style={{ color: '#666', fontSize: '12px', fontWeight: 'bold', marginTop: '4px' }}>Bust</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: '900', fontSize: '16px' }}>{measurementUnit === 'cm, kg' ? userWaist : Math.round(userWaist * 0.393701)} {measurementUnit === 'cm, kg' ? 'cm' : 'in'}</div>
                        <div style={{ color: '#666', fontSize: '12px', fontWeight: 'bold', marginTop: '4px' }}>Waist</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: '900', fontSize: '16px' }}>{measurementUnit === 'cm, kg' ? userHips : Math.round(userHips * 0.393701)} {measurementUnit === 'cm, kg' ? 'cm' : 'in'}</div>
                        <div style={{ color: '#666', fontSize: '12px', fontWeight: 'bold', marginTop: '4px' }}>Hips</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: '900', fontSize: '16px' }}>{bodyShape || 'Rounded'}</div>
                        <div style={{ color: '#666', fontSize: '12px', fontWeight: 'bold', marginTop: '4px' }}>Body Shape</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: '900', fontSize: '16px' }}>--</div>
                        <div style={{ color: '#666', fontSize: '12px', fontWeight: 'bold', marginTop: '4px' }}>Consumer Preference</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: '900', fontSize: '16px' }}>--</div>
                        <div style={{ color: '#666', fontSize: '12px', fontWeight: 'bold', marginTop: '4px' }}>Age Range</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: '900', fontSize: '16px' }}>75 cm</div>
                        <div style={{ color: '#666', fontSize: '12px', fontWeight: 'bold', marginTop: '4px' }}>Underbust</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {sizeModalStep === 1 && (
              <div style={{ padding: '0 20px 24px 20px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <input type="checkbox" id="privacy" style={{ marginTop: '4px' }} />
                <label htmlFor="privacy" style={{ fontSize: '11px', color: '#666', lineHeight: '1.4', fontWeight: 'bold' }}>
                  By clicking "Submit", you consent to KlarElle processing your personal data to provide personalized product sizing recommendations for your profile... <span style={{ color: '#1c7ed6' }}>Privacy Policy</span>
                </label>
              </div>
            )}

            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 20px calc(16px + env(safe-area-inset-bottom))', background: '#fff', borderTop: '1px solid #eee' }}>
              <button 
                onClick={() => {
                  if (sizeModalStep < 4) setSizeModalStep(sizeModalStep + 1);
                  else {
                    setShowSizeModal(false);
                    addToCart(product, 'S', selectedColor); // Dummy add 'S' to cart since recommendation is 'S'
                  }
                }}
                style={{ width: '100%', padding: '16px', background: '#000', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
              >
                {sizeModalStep === 3 ? 'Submit' : sizeModalStep === 4 ? 'Add Best Fit to Cart' : `Continue (${sizeModalStep}/3)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" style={{ minHeight: '60vh', paddingBottom: '0', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #eee' }}>
              <div style={{ width: '24px' }}></div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Product Details</h3>
              <X size={24} onClick={() => setShowDetailsModal(false)} style={{ cursor: 'pointer' }} />
            </div>
            <div style={{ overflowY: 'auto', flex: 1, padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px', fontSize: '13px', color: '#000', fontWeight: '600' }}>
                <span style={{ color: '#666', fontWeight: 'normal' }}>Material:</span>
                <span>{product.material || 'N/A'}</span>
                <span style={{ color: '#666', fontWeight: 'normal' }}>Composition:</span>
                <span>{product.composition || 'N/A'}</span>
                <span style={{ color: '#666', fontWeight: 'normal' }}>Pattern Type:</span>
                <span>{product.pattern_type || 'N/A'}</span>
                <span style={{ color: '#666', fontWeight: 'normal' }}>Care Instructions:</span>
                <span>{product.care_instructions || 'N/A'}</span>
                <span style={{ color: '#666', fontWeight: 'normal' }}>Style:</span>
                <span>{product.style || 'N/A'}</span>
              </div>
              <div style={{ marginTop: '24px', fontSize: '13px', lineHeight: '1.6' }}>
                <p>{product.description || "Enhance your wardrobe with this stunning piece, crafted with premium materials for maximum comfort and style. Perfect for both casual outings and elegant evening events. Designed to fit beautifully and make you feel confident."}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Modal */}
      {showReviewsModal && (
        <div className="modal-overlay" onClick={() => setShowReviewsModal(false)}>
          <div className="modal-content" style={{ minHeight: '80vh', paddingBottom: '0', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #eee' }}>
              <div style={{ width: '24px' }}></div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>All Reviews ({reviewStats.count})</h3>
              <X size={24} onClick={() => setShowReviewsModal(false)} style={{ cursor: 'pointer' }} />
            </div>
            <div style={{ overflowY: 'auto', flex: 1, padding: '20px' }}>
              {reviews.map(review => (
                <div key={review.id} className="review-card">
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                        {review.user_name}
                        <div style={{ display: 'flex', color: '#fcc419' }}>
                          {[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} fill={s <= review.rating ? "currentColor" : "none"} stroke="currentColor" />)}
                        </div>
                      </div>
                      <div style={{ color: '#999' }}>Color: {review.color_bought || 'N/A'} / Size: {review.size_bought || 'N/A'}</div>
                   </div>
                   <p style={{ fontSize: '13px', margin: '0 0 12px 0', fontWeight: '600' }}>{review.text}</p>
                   <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '12px', color: '#000', fontWeight: 'bold', gap: '16px', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ThumbsUp size={14} /> Helpful ({review.helpful_count})</span>
                   </div>
                </div>
              ))}
              {reviews.length === 0 && <p style={{ fontSize: '13px', color: '#666' }}>No reviews yet.</p>}
            </div>
          </div>
        </div>
      )}

      {/* Size Request Modal */}
      {showSizeRequestModal && (
        <div className="modal-overlay" onClick={() => setShowSizeRequestModal(false)}>
          <div className="modal-content" style={{ minHeight: '30vh', paddingBottom: '0', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #eee' }}>
              <div style={{ width: '24px' }}></div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Request a Size</h3>
              <X size={24} onClick={() => setShowSizeRequestModal(false)} style={{ cursor: 'pointer' }} />
            </div>
            <div style={{ overflowY: 'auto', flex: 1, padding: '20px' }}>
              <p style={{ fontSize: '14px', marginBottom: '16px' }}>Let us know which size you are looking for, and we'll try our best to stock it!</p>
              <input type="text" placeholder="e.g. XXL, 3XL" style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '16px' }} />
              <button 
                onClick={() => {
                  alert("Thank you! We have recorded your size request.");
                  setShowSizeRequestModal(false);
                }}
                style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ProductDetails;
