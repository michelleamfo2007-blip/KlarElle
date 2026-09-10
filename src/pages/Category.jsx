import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import { Filter } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import FilterSidebar from '../components/FilterSidebar';
import FilterModal from '../components/FilterModal';
import { isProductPreorder, isProductSoldOut } from '../utils/stock';
import ColorPreviewDots, { useProductColorImage } from '../components/ColorPreviewDots';
import NotifyMeForm from '../components/NotifyMeForm';
import { COLLECTION_ALIASES, getCollectionBySlug, STORE_COLLECTIONS } from '../data/collections';
import { getReleaseLabel, isComingSoon, isPublishedOnStorefront, matchesCollection, maybeLaunchProduct } from '../utils/storefront';
import { getCollectionSeo } from '../utils/seoPages';
import NotFound from './NotFound';
import { productPath } from '../utils/productUrl';
import { trackSelectItem } from '../utils/analytics';
import ProductImage from '../components/ProductImage';
import { buildCollectionFilterOptions, productMatchesFilterValue } from '../utils/collectionFilters';
import './Category.css';

function CategoryProductCard({ product, formatPrice, onNotify }) {
  const { colors, selectedColor, setSelectedColor, image } = useProductColorImage(product);
  const comingSoon = isComingSoon(product);
  const soldOut = isProductSoldOut(product);
  const preorder = isProductPreorder(product);

  return (
    <div className="product-card">
      {comingSoon ? (
        <div className="product-badge" style={{ background: '#111', color: '#fff', letterSpacing: '1px' }}>COMING SOON</div>
      ) : preorder ? (
        <div className="product-badge" style={{ background: '#9a3412', color: '#fff', letterSpacing: '1px' }}>PREORDER</div>
      ) : soldOut ? (
        <div className="product-badge" style={{ background: '#000', color: '#fff' }}>SOLD OUT</div>
      ) : product.old_price && parseFloat(product.old_price) > parseFloat(product.price) && (
        <div className="product-badge">-{Math.round(((product.old_price - product.price) / product.old_price) * 100)}%</div>
      )}
      <div className="product-image-wrap">
        <Link to={productPath(product)} onClick={() => trackSelectItem(product)}>
          <ProductImage key={selectedColor} src={image || '/placeholder.png'} product={product} extras={{ color: selectedColor }} className="product-image primary" style={{ opacity: soldOut && !comingSoon ? 0.6 : 1 }} />
        </Link>
      </div>
      <div className="product-info">
        <Link to={productPath(product)} onClick={() => trackSelectItem(product)}><h3 className="product-title">{product.name}</h3></Link>
        <div className="product-price-wrap">
          <span className="product-price sale">{formatPrice(product.price)}</span>
          {product.old_price && parseFloat(product.old_price) > parseFloat(product.price) && <span className="product-old-price">{formatPrice(product.old_price)}</span>}
        </div>
        {comingSoon && (
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{getReleaseLabel(product)}</div>
        )}
        <ColorPreviewDots colors={colors} selectedColor={selectedColor} onSelect={setSelectedColor} />
        {comingSoon || soldOut ? (
          <button type="button" className="luxury-add-btn" onClick={() => onNotify(product)}>NOTIFY ME</button>
        ) : (
          <Link to={productPath(product)} className="luxury-add-btn" onClick={() => trackSelectItem(product)}>ADD TO CART</Link>
        )}
      </div>
    </div>
  );
}

function Category() {
  const { id } = useParams(); // gets 'dresses', 'tops', etc. from URL
  const { formatPrice } = useCurrency();
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState({});
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [notifyProduct, setNotifyProduct] = useState(null);
  const [filterOptions, setFilterOptions] = useState({});

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setLoading(true);
      
      let query = supabase
        .from('products')
        .select('*')
        .eq('visibility', true)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
        
      const { data, error } = await query;
      
      if (!error && data) {
        for (const product of data) {
          if (isComingSoon(product) && product.coming_soon) {
            if (await maybeLaunchProduct(product)) product.coming_soon = false;
          }
        }
        setAllProducts(data);
      }
      setLoading(false);
    };

    fetchCategoryProducts();
  }, [id]);

  useEffect(() => {
    setActiveFilters({});
  }, [id]);

  useEffect(() => {
    const inCollection = allProducts.filter((product) => (
      isPublishedOnStorefront(product) && matchesCollection(product, id)
    ));
    setFilterOptions(buildCollectionFilterOptions(inCollection));
  }, [allProducts, id]);

  useEffect(() => {
    let result = [...allProducts].filter((product) => matchesCollection(product, id));

    const activeKeys = Object.keys(activeFilters).filter((key) => (
      Array.isArray(activeFilters[key]) && activeFilters[key].length > 0
    ));

    activeKeys.forEach((key) => {
      result = result.filter((product) => productMatchesFilterValue(product, key, activeFilters[key]));
    });

    setProducts(result);
  }, [activeFilters, allProducts, id]);

  const collection = getCollectionBySlug(id);
  const known = id === 'all' || id === 'collections' || Boolean(getCollectionBySlug(id)) || Boolean(COLLECTION_ALIASES[id]);
  const seo = getCollectionSeo(id);
  const categoryName = seo?.heading || collection?.title || id.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  const collectionHasProducts = allProducts.some((product) => matchesCollection(product, id));
  const hasFilterOptions = Object.values(filterOptions).some((options) => (options || []).length > 0);

  if (id === 'coming-soon') return <Navigate to="/category/new-in" replace />;
  if (!known) return <NotFound />;
  if (!loading && !collectionHasProducts) return <NotFound />;

  return (
    <>
    <SEO
      title={seo?.title || categoryName}
      description={seo?.description}
      noindex={!loading && products.length === 0}
    />
    <div className="category-page-container">
      {/* Sidebar */}
      {hasFilterOptions && (
      <div className="desktop-filter-sidebar">
        <FilterSidebar 
          filterOptions={filterOptions} 
          activeFilters={activeFilters} 
          onFilterChange={setActiveFilters} 
        />
      </div>
      )}

      {/* Main Content */}
      <div className="category-content">
        <div className="category-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '28px', marginBottom: '8px', textTransform: collection ? 'none' : 'capitalize' }}>{categoryName}</h1>
            <p style={{ color: '#666', maxWidth: '520px', lineHeight: 1.5, fontSize: '14px', margin: 0 }}>{seo?.copy || collection?.tagline || 'Explore all KlarElle styles.'}</p>
            <div style={{ marginTop: '12px', fontSize: '13px', color: '#666' }}>
              {STORE_COLLECTIONS.filter((item) => item.slug !== id).slice(0, 5).map((item, index) => (
                <span key={item.slug}>
                  {index > 0 && ' · '}
                  <Link to={`/category/${item.slug}`} style={{ color: '#111' }}>{item.title}</Link>
                </span>
              ))}
            </div>
          </div>
          {hasFilterOptions && (
          <button 
            className="mobile-filter-btn" 
            onClick={() => setIsMobileFilterOpen(true)}
            style={{ display: 'none', alignItems: 'center', gap: '4px', padding: '8px 16px', background: '#fff', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
          >
            Filter <Filter size={16} />
          </button>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>Loading {categoryName}...</div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <p style={{ fontSize: '16px', color: '#333' }}>No dresses match these filters.</p>
            <p style={{ color: '#666', marginTop: '8px' }}>Clear filters or explore <Link to="/category/new-in" style={{ color: 'black', textDecoration: 'underline' }}>The New Edit</Link>.</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <CategoryProductCard
                key={product.id}
                product={product}
                formatPrice={formatPrice}
                onNotify={setNotifyProduct}
              />
            ))}
          </div>
        )}
      </div>

      <FilterModal 
        isOpen={isMobileFilterOpen} 
        onClose={() => setIsMobileFilterOpen(false)}
        filterOptions={filterOptions}
        activeFilters={activeFilters}
        onApplyFilters={setActiveFilters}
      />
      {notifyProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setNotifyProduct(null)}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '480px', padding: '24px', borderRadius: '16px 16px 0 0' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>{notifyProduct.name}</h3>
            <NotifyMeForm product={notifyProduct} onClose={() => setNotifyProduct(null)} />
          </div>
        </div>
      )}
    </div>
    </>
  );
}

export default Category;
