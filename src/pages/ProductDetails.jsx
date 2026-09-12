import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import { Heart, Truck, RotateCcw, Share2, Star, ChevronRight, X, Ruler, ThumbsUp, ChevronLeft, LayoutGrid, Pencil, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useCurrency } from '../context/CurrencyContext';
import { formatSizeLabel, recommendDressSize, getSizeChartRows } from '../utils/size';
import { isMeshDressProduct, MESH_DRESS_GUIDE_NOTE, resolveProductSizeChart } from '../data/sizeGuides';
import KlarelleSizeGuide from '../components/KlarelleSizeGuide';
import { createSizeProfile, loadSizeProfiles, saveSizeProfiles } from '../utils/sizeProfile';
import { getColorHex, collectImagesForColor, parseProductColors } from '../utils/colors';
import { getAvailabilityMode, getAvailableQty, getFulfillmentSource, getVariantStock, isProductSoldOut, pickAvailableSize } from '../utils/stock';
import { buildProductJsonLd, shareImageUrl, SITE_URL } from '../utils/seo';
import NotifyMeForm from '../components/NotifyMeForm';
import NotFound from './NotFound';
import {
  getReleaseLabel,
  isComingSoon,
  isPublishedOnStorefront,
  maybeLaunchProduct
} from '../utils/storefront';
import { applyMaterialDetails } from '../utils/materialDefaults';
import { findProductByParam, isProductUuid, productPath } from '../utils/productUrl';
import { galleryViewLabel } from '../utils/media';
import { trackViewItem } from '../utils/analytics';
import { recordProductPageView } from '../utils/productClicks';
import ProductImage from '../components/ProductImage';
import { productCollection } from '../data/collections';
import { buildBreadcrumbJsonLd } from '../utils/seoPages';
import { showPublicStockCounts } from '../utils/launch';

const collectProductImages = (product, color) => collectImagesForColor(product, color);

const CustomSlider = ({ value, min, max, onChange, marks }) => {
  const span = Math.max(1, max - min);
  const pct = (val) => `${((Number(val) - min) / span) * 100}%`;
  const clamped = Math.min(max, Math.max(min, Number(value) || min));
  return (
    <div style={{ width: '100%', height: '44px', background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '4px', position: 'relative' }}>
      <div style={{ position: 'absolute', left: pct(clamped), top: 0, bottom: 18, width: '2px', background: '#1c7ed6', transform: 'translateX(-50%)', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', left: pct(clamped), top: '-6px', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '8px solid #1c7ed6', pointerEvents: 'none' }}></div>
      {marks.map((mark) => (
        <span
          key={mark}
          style={{ position: 'absolute', left: pct(mark), bottom: 4, transform: 'translateX(-50%)', fontSize: '10px', color: '#999', pointerEvents: 'none' }}
        >
          {mark}
        </span>
      ))}
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={clamped}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', margin: 0 }}
      />
    </div>
  );
};

const ChoiceSlider = ({ value, options, onChange }) => {
  const max = Math.max(1, options.length - 1);
  const pct = `${(Number(value) / max) * 100}%`;
  return (
    <div style={{ flex: 1, position: 'relative', height: '28px' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: '12px', height: '4px', background: '#eee', borderRadius: '2px' }} />
      {options.map((_, i) => (
        <div
          key={options[i]}
          style={{ position: 'absolute', left: `${(i / max) * 100}%`, top: '8px', width: '2px', height: '12px', background: '#ddd', transform: 'translateX(-50%)' }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          left: pct,
          top: '8px',
          width: '18px',
          height: '12px',
          background: '#000',
          borderRadius: '4px',
          transform: 'translateX(-50%)',
          pointerEvents: 'none'
        }}
      />
      <input
        type="range"
        min={0}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', margin: 0 }}
      />
    </div>
  );
};

function parseFitLevel(text) {
  const value = String(text || '').toLowerCase();
  if (value.includes('oversize') || value.includes('relax') || value.includes('loose')) return 2;
  if (value.includes('skinny') || value.includes('slim') || value.includes('bodycon')) return 0;
  return 1;
}

function parseStretchLevel(text) {
  const value = String(text || '').toLowerCase();
  if (value.includes('high')) return 3;
  if (value.includes('moderate') || value.includes('medium')) return 2;
  if (value.includes('slight')) return 1;
  if (value.includes('no stretch') || value.includes('non')) return 0;
  return 1;
}

function loadHelpfulVotes() {
  try {
    return JSON.parse(localStorage.getItem('klarelle_helpful_reviews') || '[]');
  } catch {
    return [];
  }
}

function ReviewHelpfulButton({ review }) {
  const [count, setCount] = useState(review.helpful_count || 0);
  const [voted, setVoted] = useState(() => loadHelpfulVotes().includes(review.id));

  const markHelpful = async () => {
    if (voted) return;
    const next = count + 1;
    const { error } = await supabase.from('product_reviews').update({ helpful_count: next }).eq('id', review.id);
    if (error) return;
    localStorage.setItem('klarelle_helpful_reviews', JSON.stringify([...loadHelpfulVotes(), review.id]));
    setCount(next);
    setVoted(true);
  };

  return (
    <button
      type="button"
      onClick={markHelpful}
      disabled={voted}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        background: 'none',
        border: 'none',
        padding: 0,
        fontSize: '12px',
        fontWeight: 'bold',
        color: voted ? '#666' : '#000',
        cursor: voted ? 'default' : 'pointer'
      }}
    >
      <ThumbsUp size={14} fill={voted ? 'currentColor' : 'none'} /> Helpful ({count})
    </button>
  );
}

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { formatPrice } = useCurrency();
  
  const [product, setProduct] = useState(null);
  const [matchingStyles, setMatchingStyles] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ avg: 0, count: 0, fitSmall: 0, fitTrue: 0, fitLarge: 0 });
  const [loading, setLoading] = useState(true);
  
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [sizePrompt, setSizePrompt] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const { us: usStock, intl: intlStock } = getVariantStock(product, selectedColor, selectedSize);
  const fulfilledFrom = getFulfillmentSource(product, selectedColor, selectedSize);
  const availableStock = getAvailableQty({ us: usStock, intl: intlStock });

  const cartItemId = product ? `${product.id}-${selectedSize || 'default'}-${selectedColor || 'default'}` : null;
  const qtyInCart = cartItems?.find(item => item.cartItemId === cartItemId)?.quantity || 0;
  const remainingStock = Math.max(0, availableStock - qtyInCart);
  const availabilityMode = getAvailabilityMode(product);
  const isPreOrder = availabilityMode === 'preorder';
  const productSoldOut = isProductSoldOut(product);
  const selectedVariantSoldOut = Boolean(selectedSize) && availabilityMode === 'stock' && availableStock <= 0;
  const isSoldOut = availabilityMode === 'sold_out' || productSoldOut || selectedVariantSoldOut;
  const revealStockCounts = showPublicStockCounts();

  // Cap quantity if they switch to a variant with less stock than currently selected
  useEffect(() => {
    if (product && !isPreOrder && quantity > remainingStock && remainingStock > 0) {
      setQuantity(remainingStock);
    } else if (product && !isPreOrder && remainingStock === 0) {
      setQuantity(1); // Reset to 1 visually, button will be disabled anyway
    }
  }, [remainingStock, quantity, product, isPreOrder]);

  const handleAddToCart = () => {
    if (isComingSoon(product) || isSoldOut) {
      setShowNotifyModal(true);
      return;
    }
    if (product?.parsedSizes?.length && !selectedSize) {
      setSizePrompt(true);
      return;
    }
    if (!isPreOrder && quantity > remainingStock) {
      alert(revealStockCounts
        ? `You already have ${qtyInCart} in your cart. You can only add ${remainingStock} more.`
        : 'You already have the available quantity of this item in your cart.');
      return;
    }
    addToCart(product, selectedSize, selectedColor, quantity, fulfilledFrom);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const applyProfile = (profile) => {
    if (!profile) return;
    setUserHeight(profile.height);
    setUserWeight(profile.weight);
    setUserBust(profile.bust);
    setUserWaist(profile.waist);
    setUserHips(profile.hips);
    setUserUnderbust(profile.underbust || 75);
    setBodyShape(profile.bodyShape || 'Rounded');
    setFitPreference(profile.fitPreference || '');
    setAgeRange(profile.ageRange || '');
    setMeasurementUnit(profile.unit || 'cm, kg');
  };

  const openCheckMySize = () => {
    const stored = loadSizeProfiles();
    setSizeProfiles(stored.profiles);
    setActiveProfileId(stored.activeId);
    setSizePrivacyAgreed(stored.profiles.length > 0);
    const profile = stored.profiles.find((item) => item.id === stored.activeId) || stored.profiles[0];
    if (profile) {
      applyProfile(profile);
      setEditingProfileId(profile.id);
      setRecommendedSize(recommendDressSize({
        bust: profile.bust,
        waist: profile.waist,
        hips: profile.hips,
        sizes: product.parsedSizes,
        chart: resolveProductSizeChart(product)
      }));
      setSizeModalStep(4);
    } else {
      setEditingProfileId(null);
      setSizeModalStep(1);
    }
    setShowSizeModal(true);
  };

  const persistCurrentProfile = () => {
    const fit = recommendDressSize({
      bust: userBust,
      waist: userWaist,
      hips: userHips,
      sizes: product.parsedSizes,
      chart: resolveProductSizeChart(product)
    });
    setRecommendedSize(fit);
    const fields = {
      height: userHeight,
      weight: userWeight,
      bust: userBust,
      waist: userWaist,
      hips: userHips,
      underbust: userUnderbust,
      bodyShape: bodyShape || 'Rounded',
      fitPreference,
      ageRange,
      unit: measurementUnit
    };
    let next = [...sizeProfiles];
    let activeId = editingProfileId;
    if (editingProfileId && next.some((item) => item.id === editingProfileId)) {
      next = next.map((item) => item.id === editingProfileId ? { ...item, ...fields } : item);
    } else {
      const created = createSizeProfile({
        ...fields,
        name: next.length === 0 ? 'Me' : `Profile ${next.length + 1}`
      });
      next = [...next, created];
      activeId = created.id;
      setEditingProfileId(created.id);
    }
    saveSizeProfiles(next, activeId);
    setSizeProfiles(next);
    setActiveProfileId(activeId);
    return fit;
  };

  // Modal State
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [guideUnit, setGuideUnit] = useState('cm');
  const [sizeModalStep, setSizeModalStep] = useState(1);
  const [measurementUnit, setMeasurementUnit] = useState('cm, kg');
  const [bodyShape, setBodyShape] = useState(null);
  const [userHeight, setUserHeight] = useState(165);
  const [userWeight, setUserWeight] = useState(60);
  const [userBust, setUserBust] = useState(90);
  const [userWaist, setUserWaist] = useState(70);
  const [userHips, setUserHips] = useState(100);
  const [userUnderbust, setUserUnderbust] = useState(75);
  const [fitPreference, setFitPreference] = useState('');
  const [guideFit, setGuideFit] = useState(1);
  const [guideStretch, setGuideStretch] = useState(1);
  const [ageRange, setAgeRange] = useState('');
  const [sizeProfiles, setSizeProfiles] = useState([]);
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [editingProfileId, setEditingProfileId] = useState(null);
  
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageModalReady, setImageModalReady] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(true);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [showSizeRequestModal, setShowSizeRequestModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [sizePrivacyAgreed, setSizePrivacyAgreed] = useState(false);
  const [recommendedSize, setRecommendedSize] = useState('');
  const [requestedSize, setRequestedSize] = useState('');
  
  // Write Review State
  const [showWriteReviewModal, setShowWriteReviewModal] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewFit, setNewReviewFit] = useState('True to Size');
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewName, setNewReviewName] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  
  const goodsRef = useRef(null);
  const reviewsRef = useRef(null);
  const recommendRef = useRef(null);
  const galleryRef = useRef(null);
  const productVideoRef = useRef(null);
  const modalScrollerRef = useRef(null);

  const scrollToSection = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [id]);

  useEffect(() => {
    if (loading || !product) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [loading, product?.id]);

  useEffect(() => {
    const stored = loadSizeProfiles();
    setSizeProfiles(stored.profiles);
    setActiveProfileId(stored.activeId);
    const profile = stored.profiles.find((item) => item.id === stored.activeId) || stored.profiles[0];
    if (profile) applyProfile(profile);
  }, []);

  useEffect(() => {
    const fetchProductAndMatches = async () => {
      setLoading(true);
      let data = null;
      if (isProductUuid(id)) {
        const result = await supabase.from('products').select('*').eq('id', id).maybeSingle();
        data = result.data;
      } else {
        const { data: catalog } = await supabase
          .from('products')
          .select('*')
          .eq('visibility', true)
          .eq('status', 'active');
        data = findProductByParam(catalog || [], id);
      }

      if (data) {
        const rawSizes = Array.isArray(data.sizes) ? data.sizes : (typeof data.sizes === 'string' ? [data.sizes] : []);
        const pSizes = rawSizes.flatMap(s => typeof s === 'string' ? s.split(/[;,]+/) : s).map(s => String(s).trim()).filter(Boolean);
        
        const pColors = parseProductColors(data.colors);
        
        data.parsedSizes = pSizes;
        data.parsedColors = pColors;

        if (!isPublishedOnStorefront(data)) {
          setProduct(null);
          setLoading(false);
          return;
        }

        if (await maybeLaunchProduct(data)) {
          data.coming_soon = false;
        }

        setProduct(data);
        setSelectedSize('');
        setSizePrompt(false);
        const initialColor = pColors[0] || '';
        if (pColors.length > 0) {
          setSelectedColor(initialColor);
          setActiveImage(0);
        }

        // Fetch matching styles (published products from same category)
        let { data: matches } = await supabase
          .from('products')
          .select('*')
          .eq('category', data.category)
          .eq('visibility', true)
          .eq('status', 'active')
          .neq('id', data.id)
          .limit(8);
          
        if (!matches || matches.length === 0) {
          const { data: anyMatches } = await supabase
            .from('products')
            .select('*')
            .eq('visibility', true)
            .eq('status', 'active')
            .neq('id', data.id)
            .limit(8);
          matches = anyMatches;
        }
        
        if (matches) {
          setMatchingStyles(matches.filter((item) => isPublishedOnStorefront(item) && !isComingSoon(item)).slice(0, 5));
        }
        
        // Fetch reviews
        const { data: revs } = await supabase
          .from('product_reviews')
          .select('*')
          .eq('product_id', data.id)
          .order('created_at', { ascending: false });
          
        if (revs) {
          const approvedRevs = revs.filter(r => (r.status || 'Approved') === 'Approved');
          setReviews(approvedRevs);
          if (approvedRevs.length > 0) {
            const avg = (approvedRevs.reduce((sum, r) => sum + r.rating, 0) / approvedRevs.length).toFixed(2);
            const fitSmall = approvedRevs.filter(r => r.fit === 'Small').length;
            const fitTrue = approvedRevs.filter(r => r.fit === 'True to Size').length;
            const fitLarge = approvedRevs.filter(r => r.fit === 'Large').length;
            const totalFit = fitSmall + fitTrue + fitLarge;
            setReviewStats({
              avg,
              count: approvedRevs.length,
              fitSmall: totalFit ? Math.round((fitSmall/totalFit)*100) : 0,
              fitTrue: totalFit ? Math.round((fitTrue/totalFit)*100) : 0,
              fitLarge: totalFit ? Math.round((fitLarge/totalFit)*100) : 0
            });
          }
        }
      } else {
        setProduct(null);
      }
      setLoading(false);
    };

    fetchProductAndMatches();
  }, [id]);

  useEffect(() => {
    if (product && isProductUuid(id)) {
      navigate(productPath(product), { replace: true });
    }
  }, [product, id, navigate]);

  useEffect(() => {
    if (!product) return;
    trackViewItem(product);
    recordProductPageView(product);
  }, [product?.id]);

  useEffect(() => {
    if (!product) return;
    const details = applyMaterialDetails(product);
    setGuideFit(parseFitLevel(product.fit || product.fit_notes));
    setGuideStretch(parseStretchLevel(details.features || product.features));
  }, [product?.id]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!newReviewText.trim()) return alert("Please enter a review.");
    setSubmittingReview(true);
    
    const { data, error } = await supabase.from('product_reviews').insert([{
      product_id: product.id,
      user_name: newReviewName || 'Anonymous User',
      rating: newReviewRating,
      text: newReviewText,
      fit: newReviewFit,
      size_bought: selectedSize || null,
      color_bought: selectedColor || null,
      status: 'Approved' // User opted for auto-approve by default
    }]).select();
    
    setSubmittingReview(false);
    
    if (error) {
      alert("Failed to submit review.");
      console.error(error);
    } else {
      alert("Thank you for your review!");
      setShowWriteReviewModal(false);
      setNewReviewText('');
      setNewReviewName('');
      setNewReviewRating(5);
      
      // Update local state instantly if it's auto-approved
      if (data && data[0]) {
        const newReviewList = [data[0], ...reviews];
        setReviews(newReviewList);
        
        // Update stats
        const avg = (newReviewList.reduce((sum, r) => sum + r.rating, 0) / newReviewList.length).toFixed(2);
        const fitSmall = newReviewList.filter(r => r.fit === 'Small').length;
        const fitTrue = newReviewList.filter(r => r.fit === 'True to Size').length;
        const fitLarge = newReviewList.filter(r => r.fit === 'Large').length;
        const totalFit = fitSmall + fitTrue + fitLarge;
        setReviewStats({
          avg,
          count: newReviewList.length,
          fitSmall: totalFit ? Math.round((fitSmall/totalFit)*100) : 0,
          fitTrue: totalFit ? Math.round((fitTrue/totalFit)*100) : 0,
          fitLarge: totalFit ? Math.round((fitLarge/totalFit)*100) : 0
        });
      }
    }
  };

  useEffect(() => {
    const video = productVideoRef.current;
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
    const keepMuted = () => {
      video.muted = true;
      video.volume = 0;
    };
    video.addEventListener('play', keepMuted);
    video.addEventListener('volumechange', keepMuted);
    return () => {
      video.removeEventListener('play', keepMuted);
      video.removeEventListener('volumechange', keepMuted);
    };
  }, [product?.video_url]);

  useEffect(() => {
    if (showSizeModal || showGuideModal || showReviewsModal || showDetailsModal || showSizeRequestModal || showWriteReviewModal || showImageModal || showNotifyModal || showPrivacyModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showSizeModal, showGuideModal, showReviewsModal, showDetailsModal, showSizeRequestModal, showWriteReviewModal, showImageModal, showNotifyModal, showPrivacyModal]);

  useEffect(() => {
    if (!showImageModal || !product) return;
    const count = collectProductImages(product, selectedColor).length || 1;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') setModalImageIndex((i) => (i + 1) % count);
      if (e.key === 'ArrowLeft') setModalImageIndex((i) => (i - 1 + count) % count);
      if (e.key === 'Escape') setShowImageModal(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showImageModal, product, selectedColor]);

  useEffect(() => {
    setActiveImage(0);
    const gallery = galleryRef.current;
    if (gallery) gallery.scrollTo({ left: 0, behavior: 'auto' });
  }, [selectedColor]);

  useEffect(() => {
    if (!showImageModal || !modalScrollerRef.current) return;
    modalScrollerRef.current.scrollTo({ left: window.innerWidth * modalImageIndex, behavior: 'smooth' });
  }, [modalImageIndex, showImageModal]);

  if (loading) return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 20px', fontSize: '18px', color: '#666' }}>Loading product details...</div>;
  if (!product) return <NotFound />;

  const images = collectProductImages(product, selectedColor);
  const fabric = applyMaterialDetails(product);
  const preorderLeadTime = product.preorder_lead_time || '14–21 business days';
  const comingSoon = isComingSoon(product);
  const releaseLabel = getReleaseLabel(product);
  const productImage = shareImageUrl(product.image_url);
  const collection = productCollection(product);


  return (
    <>
    <SEO
      title={product.name}
      description={product.description?.substring(0, 160)}
      image={productImage}
      type="product"
      canonicalUrl={`${SITE_URL}${productPath(product)}`}
      jsonLd={[
        buildProductJsonLd(product, {
          url: `${SITE_URL}${productPath(product)}`,
          image: productImage,
          soldOut: isProductSoldOut(product),
          comingSoon: comingSoon || isPreOrder,
          ratingCount: reviewStats.count,
          ratingValue: reviewStats.avg
        }),
        buildBreadcrumbJsonLd([
          { name: 'Home', url: `${SITE_URL}/` },
          { name: collection.label, url: `${SITE_URL}/category/${collection.slug}` },
          { name: product.name, url: `${SITE_URL}${productPath(product)}` }
        ])
      ]}
    />
    <div className="product-details-page" style={{ paddingBottom: '90px' }}>
      <div className="container" style={{ padding: '40px 20px' }}>
        
        <div style={{ marginBottom: '24px', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>
          <Link to="/" style={{ color: '#666', textDecoration: 'none' }}>Home</Link> / 
          <Link to={`/category/${collection.slug}`} style={{ color: '#666', textDecoration: 'none', marginLeft: '8px' }}>{collection.label}</Link> / 
          <span style={{ color: '#000', marginLeft: '8px', fontWeight: 'bold' }}>{product.name}</span>
        </div>

        <div className="product-layout">
          <style>{`
            @media (min-width: 900px) {
              .product-layout { display: grid; grid-template-columns: minmax(0, 1fr) minmax(300px, 360px); gap: 28px; align-items: start; max-width: 1000px; }
              .gallery-grid { display: block; overflow: hidden; }
              .gallery-grid .main-image-wrap { display: none; width: 100%; flex: none; max-height: 52vh; }
              .gallery-grid .main-image-wrap.is-active { display: flex; }
              .desktop-add-cart { display: flex !important; }
              .sticky-bottom-bar { display: none !important; }
            }
            .product-layout { display: flex; flex-direction: column; gap: 24px; }
            .gallery-column { min-width: 0; width: 100%; }
            
            .gallery-grid { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; gap: 0; scrollbar-width: none; -ms-overflow-style: none; }
            .gallery-grid::-webkit-scrollbar { display: none; }
            .main-image-wrap { background: #000; position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; flex: 0 0 100%; scroll-snap-align: start; max-height: 70vh; }
            .main-image { width: 100%; height: 100%; display: block; object-fit: contain; object-position: center; }
            .main-image-wrap video.main-image { object-fit: cover; width: 100%; height: 100%; }
            
            .info-section { display: flex; flex-direction: column; gap: 0; min-width: 0; width: 100%; }
            .pd-title { font-size: 24px; font-weight: 400; margin: 0 0 12px 0; line-height: 1.3; }
            .pd-price-wrap { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
            .pd-price { font-size: 28px; font-weight: 800; }
            .pd-old { text-decoration: line-through; color: #999; font-size: 16px; }
            
            .pd-options-title { font-size: 14px; font-weight: bold; text-transform: capitalize; }
            
            .size-grid { display: grid; gap: 10px 8px; margin: 12px 0; padding-top: 10px; overflow: visible; }
            .size-btn { padding: 12px 4px; border: 1px solid #f0f0f0; background: #f9f9f9; cursor: pointer; text-align: center; transition: all 0.2s; font-size: 13px; font-weight: 600; position: relative; overflow: visible; }
            .size-btn:hover { border-color: #999; }
            .size-btn.active { border-color: #000; background: #000; color: white; }
            .size-left-badge { position: absolute; top: -8px; right: -4px; background: #c2410c; color: #fff; font-size: 9px; font-weight: 700; line-height: 1; padding: 3px 5px; border-radius: 3px; white-space: nowrap; pointer-events: none; }
            .size-btn.active .size-left-badge { background: #9a3412; }
            
            .color-grid { display: flex; gap: 8px; margin: 8px 0 16px 0; flex-wrap: wrap; }
            .color-swatch { width: 22px; height: 22px; border-radius: 50%; border: 1px solid #d1d5db; cursor: pointer; padding: 0; position: relative; }
            .color-swatch.active { border: 2px solid #000; box-shadow: 0 0 0 3px #fff inset; }
            
            .section-divider { border-top: 8px solid #f5f5f5; margin: 24px -20px; padding: 24px 20px 0 20px; }
            
            .review-card { border-bottom: 1px solid #eee; padding-bottom: 16px; margin-bottom: 16px; }
            .review-card:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }

            .sticky-bottom-bar { position: fixed !important; bottom: 0; left: 0; right: 0; width: 100%; background: #fff; padding: 12px 16px calc(12px + env(safe-area-inset-bottom)); border-top: 1px solid #eee; display: flex; gap: 12px; align-items: center; z-index: 400; box-sizing: border-box; }
            .add-to-bag { flex: 1; padding: 16px; background: #000; color: white; border: none; font-size: 16px; font-weight: bold; cursor: pointer; transition: background 0.3s; border-radius: 4px; }
            
            .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 3000; display: flex; align-items: flex-end; justify-content: center; overflow: hidden; }
            .modal-content { background: #fff; width: 100%; max-width: 500px; border-radius: 16px 16px 0 0; min-height: 60vh; max-height: 90vh; position: relative; padding-bottom: 80px; display: flex; flex-direction: column; }
            
            .desktop-add-cart { display: none; }
            @media (max-width: 900px) {
              .desktop-add-cart { display: none !important; }
              .product-layout { gap: 24px; }
              .gallery-grid { margin: 0; width: 100%; max-width: 100%; }
              .main-image-wrap { flex: 0 0 100%; max-height: none; width: 100%; aspect-ratio: 4/5; }
            }
          `}</style>
          
          <div className="gallery-column">
          <div className="gallery-grid" ref={galleryRef}>
            {images.map((img, i) => (
              <div key={`${selectedColor}-${img}-${i}`} className={`main-image-wrap${activeImage === i ? ' is-active' : ''}`} onClick={() => { setModalImageIndex(i); setImageModalReady(false); setShowImageModal(true); }} style={{ cursor: 'zoom-in' }}>
                <ProductImage
                  src={img}
                  product={product}
                  extras={{ color: selectedColor, view: galleryViewLabel(i) }}
                  className="main-image"
                  sizes="(max-width: 900px) 100vw, 640px"
                  widths={[600, 1000, 1400]}
                  lazy={i > 0}
                  priority={i === 0}
                />
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
                  ref={productVideoRef}
                  src={product.video_url} 
                  className="main-image" 
                  autoPlay 
                  muted 
                  loop 
                  playsInline 
                  controls={false}
                />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginTop: '12px', paddingBottom: '4px' }}>
              {images.map((img, i) => (
                <button
                  key={`thumb-${i}`}
                  type="button"
                  onClick={() => {
                    setActiveImage(i);
                    const wrap = galleryRef.current || document.querySelector('.gallery-grid');
                    const slide = wrap?.children?.[i];
                    if (wrap && slide) {
                      wrap.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' });
                    }
                  }}
                  style={{
                    flex: '0 0 64px',
                    width: '64px',
                    height: '80px',
                    padding: 0,
                    border: activeImage === i ? '2px solid #000' : '1px solid #e5e7eb',
                    background: '#f5f5f5',
                    cursor: 'pointer'
                  }}
                >
                  <ProductImage
                    src={img}
                    product={product}
                    extras={{ color: selectedColor, view: `${galleryViewLabel(i)} thumbnail` }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    sizes="64px"
                    widths={[128, 256]}
                  />
                </button>
              ))}
            </div>
          )}
          </div>

          <div className="info-section">
            <div ref={goodsRef}>
              <h1 className="pd-title" style={{ fontSize: '16px' }}>{product.name}</h1>
              {comingSoon && (
                <div style={{ margin: '0 0 12px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ background: '#111', color: '#fff', fontSize: '11px', letterSpacing: '1px', padding: '4px 8px', textTransform: 'uppercase', fontWeight: 700 }}>Coming Soon</span>
                  <span style={{ fontSize: '13px', color: '#666' }}>{releaseLabel}</span>
                </div>
              )}
              <div className="pd-price-row">
                <span className="pd-price" style={{ color: '#000' }}>{formatPrice(product.price)}</span>
              </div>
              {isPreOrder && !comingSoon && (
                <div style={{
                  marginTop: '12px',
                  padding: '10px 12px',
                  background: '#fff7ed',
                  border: '1px solid #fdba74',
                  borderRadius: '4px',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  color: '#111'
                }}>
                  <strong>Preorder.</strong> This dress is offered as a preorder. Preorders are processed within {preorderLeadTime}. Payment is taken now and the item ships after production.
                </div>
              )}
              {isSoldOut && !comingSoon && !isPreOrder && (
                <div style={{
                  marginTop: '12px',
                  padding: '10px 12px',
                  background: '#f4f4f4',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  color: '#111'
                }}>
                  <strong>Sold out.</strong> This size or color is not available. Notify me when it is in stock.
                </div>
              )}
            </div>

            {/* Description & Product Details (Expandable) */}
            {product.description && (
              <div style={{ marginTop: '16px', fontSize: '13px', lineHeight: '1.6', color: '#333', whiteSpace: 'pre-line' }}>
                {product.description}
              </div>
            )}

            {/* Colors */}
            {product.parsedColors && product.parsedColors.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <div className="pd-options-title">Color: <span style={{fontWeight:'normal'}}>{selectedColor}</span></div>
                <div className="color-grid">
                  {product.parsedColors.map((color) => (
                    <div key={color} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <button 
                        type="button"
                        title={color}
                        aria-label={color}
                        className={`color-swatch ${selectedColor === color ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedColor(color);
                          if (selectedSize && !(product.parsedSizes || []).some((size) => size === selectedSize)) {
                            setSelectedSize('');
                          }
                          setActiveImage(0);
                          setModalImageIndex(0);
                          if (galleryRef.current) galleryRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                        }}
                        style={{ backgroundColor: getColorHex(color) }}
                      />
                      <span style={{ fontSize: '9px', color: '#666', maxWidth: '48px', textAlign: 'center', lineHeight: 1.2 }}>{color}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#666', lineHeight: '1.4' }}>
                  <strong>Color and Appearance</strong><br/>
                  We use reasonable efforts to present color and details accurately. Device settings, lighting, dye lots, fabric direction, and hand-finished embellishments may cause minor variation.
                </div>
              </div>
            )}
            
            <div style={{ marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '16px', marginBottom: '16px' }}>
              <div className="pd-options-title" style={{ margin: '0 0 12px 0', fontSize: '14px', textTransform: 'uppercase' }}>Fabric & Fit</div>
              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '8px', fontSize: '13px', lineHeight: '1.6', color: '#333' }}>
                <span style={{ color: '#666' }}>Fabric composition</span>
                <span>{fabric.composition || product.material || 'See product description'}</span>
                <span style={{ color: '#666' }}>Stretch</span>
                <span>{fabric.features || 'See product description'}</span>
                <span style={{ color: '#666' }}>Care instructions</span>
                <span>{fabric.care_instructions || 'Follow the care label attached to the garment'}</span>
                <span style={{ color: '#666' }}>Fit notes</span>
                <span>{product.fit || 'Compare your measurements with the size guide'}</span>
                <span style={{ color: '#666' }}>Model measurements</span>
                <span>{product.measurements || 'See size guide for garment measurements'}</span>
              </div>
              {(fabric.style || product.occasion || fabric.pattern_type) && (
                <>
                  <div 
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '12px 0 0' }} 
                    onClick={() => setDetailsExpanded(!detailsExpanded)}
                  >
                    <div className="pd-options-title" style={{ margin: 0, fontSize: '13px' }}>More details</div>
                    <div style={{ transform: detailsExpanded ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform 0.2s', display: 'flex' }}>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                  {detailsExpanded && (
                    <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '8px', fontSize: '13px', marginTop: '8px' }}>
                      {fabric.style && (<><span style={{ color: '#666' }}>Style</span><span>{fabric.style}</span></>)}
                      {product.occasion && (<><span style={{ color: '#666' }}>Occasion</span><span>{product.occasion}</span></>)}
                      {fabric.pattern_type && (<><span style={{ color: '#666' }}>Pattern</span><span>{fabric.pattern_type}</span></>)}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Sizes */}
            {product.parsedSizes && product.parsedSizes.length > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="pd-options-title">Select Size</div>
                </div>
                
                <div
                  className="size-grid"
                  style={{ gridTemplateColumns: `repeat(${Math.min(Math.max(product.parsedSizes.length, 1), 5)}, 1fr)` }}
                >
                  {product.parsedSizes.map(size => {
                    const sizeStock = getVariantStock(product, selectedColor, size);
                    const sizeQty = getAvailableQty(sizeStock);
                    const sizeInStock = sizeQty > 0;
                    const showLeft = revealStockCounts && sizeInStock && sizeQty <= 3;
                    return (
                    <button
                      key={size}
                      type="button"
                      className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedSize(size);
                        setSizePrompt(false);
                        if (!sizeInStock && !isPreOrder && !comingSoon) {
                          setShowNotifyModal(true);
                        }
                      }}
                      style={sizeInStock ? { width: '100%' } : { width: '100%', opacity: 0.45, textDecoration: 'line-through' }}
                    >
                      {formatSizeLabel(size)}
                      {showLeft && <span className="size-left-badge">{sizeQty} left</span>}
                    </button>
                    );
                  })}
                </div>
                {sizePrompt && (
                  <div style={{ marginTop: '8px', fontSize: '13px', color: '#b91c1c', fontWeight: 600 }}>
                    Please select a size
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', fontSize: '12px', fontWeight: 'bold', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowGuideModal(true);
                    }}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', background: 'none', border: 'none', padding: 0, fontSize: '12px', fontWeight: 'bold', color: '#000' }}
                  >
                    <LayoutGrid size={14} style={{ marginRight: '4px' }} /> Size Guide
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      openCheckMySize();
                    }}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', background: 'none', border: 'none', padding: 0, fontSize: '12px', fontWeight: 'bold', color: '#000' }}
                  >
                    <Ruler size={14} style={{ marginRight: '4px' }} /> Check My Size <ChevronRight size={14} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSizeRequestModal(true)}
                  style={{ marginTop: '8px', background: 'none', border: 'none', padding: 0, fontSize: '12px', color: '#666', cursor: 'pointer' }}
                >
                  Not your size? Tell us <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
                </button>
                
                <div style={{ marginTop: '12px', fontSize: '12px', color: '#666', lineHeight: '1.4' }}>
                  <strong>Sizing and Fit</strong><br/>
                  Compare your body measurements with the product-specific chart. Sizing may vary by fabric, compression, construction, and silhouette. If between sizes, consider the listed stretch and fit recommendation or contact support@klarelle.store. A size recommendation is guidance and does not guarantee individual fit.
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            {!comingSoon && !isSoldOut && (
            <div style={{ marginTop: '24px' }}>
              <div className="pd-options-title">Quantity <span style={{fontSize: '12px', color: '#666', fontWeight: 'normal'}}>{isPreOrder ? `(Preorder · ${preorderLeadTime})` : (revealStockCounts ? `(In stock: ${availableStock})` : '')}</span></div>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '12px', border: '1px solid #e0e0e0', width: 'fit-content', borderRadius: '4px' }}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: '8px 16px', fontSize: '18px', cursor: 'pointer', background: '#f9f9f9', borderRight: '1px solid #e0e0e0', borderTopLeftRadius: '4px', borderBottomLeftRadius: '4px' }}>-</button>
                <div style={{ padding: '0 24px', fontSize: '16px', fontWeight: 'bold' }}>{quantity}</div>
                <button onClick={() => {
                  if (isPreOrder || quantity < remainingStock) {
                    setQuantity(quantity + 1);
                  } else {
                    alert(revealStockCounts
                      ? `Sorry, only ${remainingStock} more items available to add to your cart (You already have ${qtyInCart} in cart).`
                      : 'That is all we can add of this item right now.');
                  }
                }} style={{ padding: '8px 16px', fontSize: '18px', cursor: 'pointer', background: '#f9f9f9', borderLeft: '1px solid #e0e0e0', borderTopRightRadius: '4px', borderBottomRightRadius: '4px' }}>+</button>
              </div>
            </div>
            )}

            {(comingSoon || isSoldOut) && (
              <div style={{ marginTop: '24px' }}>
            <NotifyMeForm product={product} selectedSize={selectedSize} reason={comingSoon ? 'coming-soon' : 'oos'} />
              </div>
            )}

            {/* Shipping & Returns */}
            <div style={{ marginTop: '24px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
              <div className="pd-options-title" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={16} /> Shipping & Returns
              </div>
              <div style={{ fontSize: '13px', color: '#333', lineHeight: '1.6' }}>
                <strong>Returns:</strong> Eligible exchanges or store credit are accepted within seven days. Items must be unworn and in original condition with tags attached. Refunds are not available.
              </div>
            </div>

            {/* Sticky Navigation Tabs */}
            <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #eee', marginTop: '24px', marginBottom: '16px', paddingBottom: '12px', fontSize: '14px', fontWeight: 'bold', position: 'sticky', top: '0px', background: '#fff', zIndex: 10 }}>
              <span style={{ borderBottom: '2px solid #000', paddingBottom: '12px', marginBottom: '-13px', cursor: 'pointer' }} onClick={() => scrollToSection(goodsRef)}>Details</span>
              {reviewStats.count > 0 && (
                <span style={{ color: '#666', cursor: 'pointer' }} onClick={() => scrollToSection(reviewsRef)}>Reviews</span>
              )}
              <span style={{ color: '#666', cursor: 'pointer' }} onClick={() => scrollToSection(recommendRef)}>You May Also Like</span>
            </div>

            {/* Reviews: empty products show only Write Review. Stars, count, and review cards appear after a customer submits one. */}
            <div className="section-divider" ref={reviewsRef}>
              {reviewStats.count > 0 ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span style={{ fontSize: '24px', fontWeight: '900' }}>{reviewStats.avg}</span>
                      <div style={{ display: 'flex', color: '#fcc419' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} size={14} fill={star <= Math.round(reviewStats.avg) ? "currentColor" : "none"} stroke="currentColor" />
                        ))}
                      </div>
                      <span style={{ fontSize: '12px', color: '#666' }}>({reviewStats.count})</span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <button onClick={() => setShowWriteReviewModal(true)} style={{ padding: '6px 12px', background: '#000', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Write Review</button>
                      <span style={{ fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setShowReviewsModal(true)}>View more <ChevronRight size={14} /></span>
                    </div>
                  </div>

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

                  {reviews.map(review => (
                    <div key={review.id} className="review-card">
                       <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                            {review.user_name}
                            <div style={{ display: 'flex', color: '#fcc419' }}>
                              {[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} fill={s <= review.rating ? "currentColor" : "none"} stroke="currentColor" />)}
                            </div>
                          </div>
                          <div style={{ color: '#999' }}>Color: {review.color_bought || 'N/A'} / Size: {formatSizeLabel(review.size_bought || 'N/A')}</div>
                       </div>
                       <p style={{ fontSize: '13px', margin: '0 0 12px 0', fontWeight: '600' }}>{review.text}</p>
                       <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <ReviewHelpfulButton review={review} />
                       </div>
                    </div>
                  ))}
                </>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => setShowWriteReviewModal(true)} style={{ padding: '6px 12px', background: '#000', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Write Review</button>
                </div>
              )}
            </div>


            
            {/* Matching Styles */}
            <div className="section-divider" ref={recommendRef}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                 <div className="pd-options-title" style={{ fontSize: '16px', margin: 0 }}>You Might Also Like</div>
               </div>
               
               <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '16px', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
                 {matchingStyles.map(p => (
                   <Link to={productPath(p)} key={p.id} style={{ minWidth: '120px', textDecoration: 'none', color: '#000' }}>
                     <ProductImage src={p.image_url} product={p} extras={{ view: 'front view' }} style={{ width: '120px', height: '160px', objectFit: 'cover', borderRadius: '4px' }} sizes="120px" widths={[240, 360]} />
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
              {comingSoon ? (
                <button className="add-to-bag" onClick={() => setShowNotifyModal(true)}>NOTIFY ME WHEN AVAILABLE</button>
              ) : isSoldOut ? (
                <button className="add-to-bag" onClick={() => setShowNotifyModal(true)}>NOTIFY ME WHEN AVAILABLE</button>
              ) : (
                <button className="add-to-bag" onClick={handleAddToCart}>
                  {addedToCart ? 'ADDED TO CART' : (isPreOrder ? 'PREORDER' : 'ADD TO CART')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {createPortal(
        <div className="sticky-bottom-bar" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, width: '100%', zIndex: 400 }}>
          <button type="button" onClick={() => toggleFavorite(product.id)} style={{ background: 'none', border: 'none', padding: '0 8px', cursor: 'pointer' }}>
            <Heart size={28} fill={isFavorite(product.id) ? '#000' : 'none'} />
          </button>
          <button
            type="button"
            className="add-to-bag"
            onClick={comingSoon || isSoldOut ? () => setShowNotifyModal(true) : handleAddToCart}
          >
            {comingSoon || isSoldOut ? 'NOTIFY ME WHEN AVAILABLE' : (addedToCart ? 'ADDED TO CART' : (isPreOrder ? 'PREORDER' : 'ADD TO CART'))}
          </button>
        </div>,
        document.body
      )}

      {showNotifyModal && createPortal(
        <div className="modal-overlay" onClick={() => setShowNotifyModal(false)}>
          <div className="modal-content" style={{ padding: '24px', maxHeight: '80vh' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Notify me when in stock</h3>
              <X size={22} onClick={() => setShowNotifyModal(false)} style={{ cursor: 'pointer' }} />
            </div>
            <NotifyMeForm product={product} selectedSize={selectedSize} reason={comingSoon ? 'coming-soon' : 'oos'} onClose={() => setShowNotifyModal(false)} />
          </div>
        </div>,
        document.body
      )}
      
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
              <>
                  <KlarelleSizeGuide
                    rows={getSizeChartRows(product.parsedSizes, resolveProductSizeChart(product))}
                    unit={guideUnit}
                    onUnitChange={setGuideUnit}
                    recommendedSize={recommendedSize}
                    selectedSize={selectedSize}
                    title={isMeshDressProduct(product) ? 'Mesh Dress Size Guide' : 'Size Guide'}
                    subtitle={isMeshDressProduct(product) ? `Slight stretch • Body measurements — ${guideUnit === 'in' ? 'inches' : 'centimeters'}` : undefined}
                    note={isMeshDressProduct(product) ? MESH_DRESS_GUIDE_NOTE : undefined}
                  />
                  <div style={{ padding: '16px 20px', borderBottom: '8px solid #f5f5f5' }}>
                {product.measurements && (
                  <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.5, margin: '0 0 16px' }}>{product.measurements}</p>
                )}
                <div style={{ fontSize: '13px', color: '#999' }}>
                  *Same chart as this dress. If you have used Check My Size, your best match is highlighted. A recommendation is guidance only.
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
                    <ChoiceSlider value={guideFit} options={['Skinny', 'Regular', 'Oversized']} onChange={setGuideFit} />
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
                    <ChoiceSlider value={guideStretch} options={['Non', 'Slight', 'Medium', 'High']} onChange={setGuideStretch} />
                  </div>
                </div>
              </div>
              </>
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
                    <CustomSlider value={userHeight} min={0} max={200} marks={['0', '50', '100', '150', '200']} onChange={setUserHeight} />
                  </div>
                  <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Weight<span style={{ color: '#d90429' }}>*</span></span>
                      <span style={{ fontWeight: '900', fontSize: '20px' }}>{measurementUnit === 'cm, kg' ? userWeight : Math.round(userWeight * 2.20462)} <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{measurementUnit === 'cm, kg' ? 'kg' : 'lb'}</span></span>
                    </div>
                    <CustomSlider value={userWeight} min={0} max={200} marks={['0', '50', '100', '150', '200']} onChange={setUserWeight} />
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
                  <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Underbust</span>
                      <span style={{ fontWeight: '900', fontSize: '20px' }}>{measurementUnit === 'cm, kg' ? userUnderbust : Math.round(userUnderbust * 0.393701)} <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{measurementUnit === 'cm, kg' ? 'cm' : 'in'}</span></span>
                    </div>
                    <CustomSlider value={userUnderbust} min={60} max={110} marks={['66', '76', '86']} onChange={setUserUnderbust} />
                  </div>
                </>
              )}
              
              {sizeModalStep === 3 && (
                <>
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
                <div style={{ marginTop: '24px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>Fit preference</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['Slim Fit', 'Normal Fit', 'Relaxed Fit'].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setFitPreference(option)}
                        style={{ padding: '8px 12px', border: '1px solid #111', background: fitPreference === option ? '#111' : '#fff', color: fitPreference === option ? '#fff' : '#111', fontSize: '12px', fontWeight: 600 }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>Age range</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['18-24', '25-34', '35-44', '45-54', '55-64', '65+'].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setAgeRange(option)}
                        style={{ padding: '8px 12px', border: '1px solid #111', background: ageRange === option ? '#111' : '#fff', color: ageRange === option ? '#fff' : '#111', fontSize: '12px', fontWeight: 600 }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                </>
              )}

              {sizeModalStep === 4 && (
                <div style={{ padding: '0', background: '#f5f5f5', height: '100%' }}>
                  <div style={{ background: '#fff9e6', padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#b07b1a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <span>👍</span> <span style={{ fontSize: '24px' }}>{formatSizeLabel(recommendedSize || selectedSize || 'M')}</span>
                    </div>
                    <div style={{ fontWeight: 'bold', fontSize: '16px', marginTop: '8px' }}>Best fit for "{sizeProfiles.find((item) => item.id === activeProfileId)?.name || 'Me'}"</div>
                  </div>
                  
                  <div style={{ padding: '16px', background: '#fff', marginTop: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                      {sizeProfiles.map((profile) => (
                        <button
                          key={profile.id}
                          type="button"
                          onClick={() => {
                            applyProfile(profile);
                            setActiveProfileId(profile.id);
                            setEditingProfileId(profile.id);
                            saveSizeProfiles(sizeProfiles, profile.id);
                            setRecommendedSize(recommendDressSize({
                              bust: profile.bust,
                              waist: profile.waist,
                              hips: profile.hips,
                              sizes: product.parsedSizes,
                              chart: resolveProductSizeChart(product)
                            }));
                          }}
                          style={{ padding: '8px 20px', background: activeProfileId === profile.id ? '#000' : '#f5f5f5', color: activeProfileId === profile.id ? '#fff' : '#000', border: 'none', fontWeight: 'bold', fontSize: '14px' }}
                        >
                          {profile.name}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProfileId(null);
                          setBodyShape(null);
                          setFitPreference('');
                          setAgeRange('');
                          setSizeModalStep(1);
                        }}
                        style={{ padding: '8px 20px', background: '#fff', color: '#000', border: '1px solid #111', fontWeight: 'bold', fontSize: '14px' }}
                      >
                        + Add Profile
                      </button>
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
                        <div style={{ fontWeight: '900', fontSize: '16px' }}>{fitPreference || '--'}</div>
                        <div style={{ color: '#666', fontSize: '12px', fontWeight: 'bold', marginTop: '4px' }}>Consumer Preference</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: '900', fontSize: '16px' }}>{ageRange || '--'}</div>
                        <div style={{ color: '#666', fontSize: '12px', fontWeight: 'bold', marginTop: '4px' }}>Age Range</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: '900', fontSize: '16px' }}>{measurementUnit === 'cm, kg' ? userUnderbust : Math.round(userUnderbust * 0.393701)} {measurementUnit === 'cm, kg' ? 'cm' : 'in'}</div>
                        <div style={{ color: '#666', fontSize: '12px', fontWeight: 'bold', marginTop: '4px' }}>Underbust</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '20px' }}>
                      <button type="button" onClick={() => setSizeModalStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }} aria-label="Edit profile">
                        <Pencil size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const next = sizeProfiles.filter((item) => item.id !== activeProfileId);
                          const nextActive = next[0]?.id || null;
                          saveSizeProfiles(next, nextActive);
                          setSizeProfiles(next);
                          setActiveProfileId(nextActive);
                          setEditingProfileId(nextActive);
                          if (next[0]) {
                            applyProfile(next[0]);
                            setRecommendedSize(recommendDressSize({
                              bust: next[0].bust,
                              waist: next[0].waist,
                              hips: next[0].hips,
                              sizes: product.parsedSizes,
                              chart: resolveProductSizeChart(product)
                            }));
                          } else {
                            setSizeModalStep(1);
                          }
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                        aria-label="Delete profile"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {sizeModalStep === 1 && (
              <div style={{ padding: '0 20px 24px 20px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <input type="checkbox" id="privacy" style={{ marginTop: '4px' }} />
                <label htmlFor="privacy" style={{ fontSize: '11px', color: '#666', lineHeight: '1.4', fontWeight: 'bold' }}>
                  By clicking "Submit", you consent to KlarElle processing your personal data to provide personalized product sizing recommendations for your profile. You can modify or delete this profile at any time.{' '}
                  <button type="button" onClick={() => setShowPrivacyModal(true)} style={{ color: '#1c7ed6', background: 'none', border: 'none', padding: 0, fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Privacy Policy</button>
                </label>
              </div>
            )}

            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 20px calc(16px + env(safe-area-inset-bottom))', background: '#fff', borderTop: '1px solid #eee' }}>
              <button 
                onClick={() => {
                  if (sizeModalStep === 1 && !sizePrivacyAgreed) {
                    setShowPrivacyModal(true);
                    return;
                  }
                  if (sizeModalStep === 3) {
                    persistCurrentProfile();
                    setSizeModalStep(4);
                    return;
                  }
                  if (sizeModalStep < 4) {
                    setSizeModalStep(sizeModalStep + 1);
                    return;
                  }
                  const fit = recommendedSize || pickAvailableSize(product, selectedColor, product.parsedSizes);
                  setSelectedSize(fit);
                  addToCart(product, fit, selectedColor);
                  setShowSizeModal(false);
                }}
                style={{ width: '100%', padding: '16px', background: '#000', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
              >
                {sizeModalStep === 3 ? 'Submit' : sizeModalStep === 4 ? 'Add Best Fit to Cart' : `Continue (${sizeModalStep}/3)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPrivacyModal && createPortal(
        <div className="modal-overlay" style={{ zIndex: 4000 }} onClick={() => setShowPrivacyModal(false)}>
          <div className="modal-content" style={{ minHeight: 'auto', paddingBottom: 0 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #eee' }}>
              <div style={{ width: '24px' }} />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Privacy Policy Agreement</h3>
              <X size={24} onClick={() => setShowPrivacyModal(false)} style={{ cursor: 'pointer' }} />
            </div>
            <div style={{ padding: '20px', fontSize: '13px', lineHeight: 1.6, color: '#333' }}>
              By continuing, you consent to KlarElle using your measurements to recommend a size for this dress. You can close this at any time. A recommendation is guidance and does not guarantee individual fit.
            </div>
            <div style={{ padding: '16px 20px calc(16px + env(safe-area-inset-bottom))', display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                style={{ flex: 1, padding: '14px', background: '#fff', color: '#111', border: '1px solid #111', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Not Now
              </button>
              <button
                type="button"
                onClick={() => {
                  setSizePrivacyAgreed(true);
                  setShowPrivacyModal(false);
                  if (sizeModalStep === 1) setSizeModalStep(2);
                }}
                style={{ flex: 1, padding: '14px', background: '#000', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Agree
              </button>
            </div>
          </div>
        </div>,
        document.body
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
                <span>{fabric.composition || 'N/A'}</span>
                <span style={{ color: '#666', fontWeight: 'normal' }}>Pattern Type:</span>
                <span>{fabric.pattern_type || 'N/A'}</span>
                <span style={{ color: '#666', fontWeight: 'normal' }}>Care Instructions:</span>
                <span>{fabric.care_instructions || 'N/A'}</span>
                <span style={{ color: '#666', fontWeight: 'normal' }}>Style:</span>
                <span>{fabric.style || 'N/A'}</span>
                <span style={{ color: '#666', fontWeight: 'normal' }}>Stretch:</span>
                <span>{fabric.features || 'N/A'}</span>
              </div>
              <div style={{ marginTop: '24px', fontSize: '13px', lineHeight: '1.6' }}>
                <p>{product.description || "Enhance your wardrobe with this stunning piece, crafted with premium materials for maximum comfort and style. Perfect for both casual outings and elegant evening events. Designed to fit beautifully and make you feel confident."}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Write Review Modal */}
      {showWriteReviewModal && (
        <div className="modal-overlay" onClick={() => setShowWriteReviewModal(false)}>
          <div className="modal-content" style={{ minHeight: 'auto', paddingBottom: '20px', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #eee' }}>
              <div style={{ width: '24px' }}></div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Write a Review</h3>
              <X size={24} onClick={() => setShowWriteReviewModal(false)} style={{ cursor: 'pointer' }} />
            </div>
            <form onSubmit={submitReview} style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Your Rating</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                      key={star} 
                      size={24} 
                      onClick={() => setNewReviewRating(star)}
                      fill={star <= newReviewRating ? "#fcc419" : "none"} 
                      stroke={star <= newReviewRating ? "#fcc419" : "#d1d5db"} 
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Your Name (Optional)</label>
                <input 
                  type="text" 
                  value={newReviewName} 
                  onChange={e => setNewReviewName(e.target.value)} 
                  placeholder="How should we call you?"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>How was the fit?</label>
                <select 
                  value={newReviewFit} 
                  onChange={e => setNewReviewFit(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', outline: 'none', background: '#fff' }}
                >
                  <option value="Small">Runs Small</option>
                  <option value="True to Size">True to Size</option>
                  <option value="Large">Runs Large</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Your Review</label>
                <textarea 
                  value={newReviewText} 
                  onChange={e => setNewReviewText(e.target.value)} 
                  placeholder="Tell others what you thought about this item..."
                  rows="4"
                  required
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={submittingReview}
                style={{ background: '#000', color: '#fff', padding: '14px', border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold', cursor: submittingReview ? 'not-allowed' : 'pointer', marginTop: '8px', opacity: submittingReview ? 0.7 : 1 }}
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
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
                      <div style={{ color: '#999' }}>Color: {review.color_bought || 'N/A'} / Size: {formatSizeLabel(review.size_bought || 'N/A')}</div>
                   </div>
                   <p style={{ fontSize: '13px', margin: '0 0 12px 0', fontWeight: '600' }}>{review.text}</p>
                   <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <ReviewHelpfulButton review={review} />
                   </div>
                </div>
              ))}
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
              <p style={{ fontSize: '14px', marginBottom: '16px' }}>Tell us the size you need. We will try to stock it.</p>
              <input
                type="text"
                value={requestedSize}
                onChange={(e) => setRequestedSize(e.target.value)}
                placeholder="e.g. XXL, 3XL"
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '16px', boxSizing: 'border-box' }}
              />
              <button 
                onClick={async () => {
                  const sizeNote = requestedSize.trim();
                  if (!sizeNote) return;
                  await supabase.from('support_tickets').insert([{
                    customer_name: 'Size request',
                    customer_email: 'size-request@klarelle.store',
                    subject: `Size request: ${product.name}`,
                    message: `Requested size: ${sizeNote}\nProduct: ${product.name}\nColor: ${selectedColor || 'n/a'}`,
                    status: 'Open',
                    priority: 'Medium'
                  }]);
                  setRequestedSize('');
                  setShowSizeRequestModal(false);
                }}
                style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Modal */}
      {showImageModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#000', zIndex: 99999, display: 'flex', flexDirection: 'column', opacity: imageModalReady ? 1 : 0, transition: 'opacity 0.15s ease-in' }}>
          <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 100000, cursor: 'pointer', background: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowImageModal(false)}>
            <X size={24} color="#fff" />
          </div>

          {images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={() => setModalImageIndex((i) => (i - 1 + images.length) % images.length)}
                style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', zIndex: 100000, width: '48px', height: '48px', borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.18)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ChevronLeft size={28} />
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={() => setModalImageIndex((i) => (i + 1) % images.length)}
                style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', zIndex: 100000, width: '48px', height: '48px', borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.18)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}
          
          <div
            ref={(el) => {
              modalScrollerRef.current = el;
              if (el && el.dataset.initialized !== 'true') {
                setTimeout(() => {
                  el.scrollLeft = window.innerWidth * modalImageIndex;
                  setImageModalReady(true);
                }, 20);
                el.dataset.initialized = 'true';
              }
            }}
            style={{ display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', flex: 1, WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
          >
            {images.map((img, i) => (
              <div key={i} style={{ flex: '0 0 100%', scrollSnapAlign: 'start', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <ProductImage
                  src={img}
                  product={product}
                  extras={{ color: selectedColor, view: `zoomed ${galleryViewLabel(i)}` }}
                  style={{ width: '100%', maxHeight: '100vh', objectFit: 'contain' }}
                  sizes="100vw"
                  widths={[800, 1400, 2000]}
                  lazy={false}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </>
  );
}

export default ProductDetails;
