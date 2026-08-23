import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Upload, X, CheckCircle2, AlertCircle, RefreshCw, Eye, EyeOff, Tag, Box, Star, Loader2, Image } from 'lucide-react';

function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    price: '',
    old_price: '',
    category: 'new-in',
    stock: 0,
    low_stock_threshold: 5,
    status: 'active',
    visibility: true,
    material: '',
    composition: '',
    pattern_type: '',
    care_instructions: '',
    style: '',
    size_guide_url: '',
    video_url: ''
  });

  const [sizesInput, setSizesInput] = useState('');
  const [colorsInput, setColorsInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [variantImages, setVariantImages] = useState({});

  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    if (!error && data) {
      setCategories(data.map(c => ({ value: c.slug, label: c.name })));
    }
  };

  const fetchProduct = async () => {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (data) {
      setFormData({
        name: data.name || '',
        sku: data.sku || '',
        description: data.description || '',
        price: data.price || '',
        old_price: data.old_price || '',
        category: data.category || 'new-in',
        stock: data.stock || 0,
        low_stock_threshold: data.low_stock_threshold || 5,
        status: data.status || 'active',
        visibility: data.visibility ?? true,
        material: data.material || '',
        composition: data.composition || '',
        pattern_type: data.pattern_type || '',
        care_instructions: data.care_instructions || '',
        style: data.style || '',
        size_guide_url: data.size_guide_url || '',
        video_url: data.video_url || '',
      });

      setSizesInput(Array.isArray(data.sizes) ? data.sizes.join(', ') : (data.sizes || ''));
      setColorsInput(Array.isArray(data.colors) ? data.colors.join(', ') : (data.colors || ''));
      setTagsInput(Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags || ''));
      setVariantImages(data.variant_images || {});

      const loadedImages = [];
      if (data.images && Array.isArray(data.images) && data.images.length > 0) {
        data.images.forEach((url, i) => loadedImages.push({ url, isMain: i === 0 }));
      } else {
        if (data.image_url) loadedImages.push({ url: data.image_url, isMain: true });
        if (data.hover_image_url) loadedImages.push({ url: data.hover_image_url, isMain: false });
      }
      setImages(loadedImages);
    }
  };

  const generateSKU = () => {
    const random = Math.floor(100 + Math.random() * 900);
    const sku = `MFG-PRD-${random}`;
    setFormData({ ...formData, sku });
  };

  const calculateDiscount = () => {
    if (formData.old_price && formData.price) {
      const oldP = parseFloat(formData.old_price);
      const newP = parseFloat(formData.price);
      if (oldP > newP) {
        return Math.round(((oldP - newP) / oldP) * 100);
      }
    }
    return 0;
  };

  const getStockStatus = () => {
    if (formData.stock <= 0) return { text: 'Out of Stock', color: '#dc2626', bg: '#fef2f2', icon: '🔴' };
    if (formData.stock <= formData.low_stock_threshold) return { text: 'Low Stock', color: '#d97706', bg: '#fffbeb', icon: '🟠' };
    return { text: 'In Stock', color: '#16a34a', bg: '#f0fdf4', icon: '🟢' };
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const processFiles = async (files) => {
    try {
      setUploading(true);
      const newImages = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} is too large. Max 5MB.`);
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file);
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
        
        // Auto-set first image as main if no main exists
        const isFirst = images.length === 0 && newImages.length === 0;
        newImages.push({ url: data.publicUrl, isMain: isFirst });
      }

      setImages((prev) => [...prev, ...newImages]);
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const processSingleFile = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 20 * 1024 * 1024) {
      alert(`${file.name} is too large. Max 20MB.`);
      return;
    }

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${field}-${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
      setFormData(prev => ({ ...prev, [field]: data.publicUrl }));
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    const removed = newImages.splice(index, 1)[0];
    
    // If we removed the main image, make the first available one main
    if (removed.isMain && newImages.length > 0) {
      newImages[0].isMain = true;
    }
    
    setImages(newImages);
  };

  const setMainImage = (index) => {
    const newImages = images.map((img, i) => ({ ...img, isMain: i === index }));
    setImages(newImages);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Please enter a valid price';
    if (!formData.category) newErrors.category = 'Category is required';
    if (images.length === 0) newErrors.images = 'Please upload at least one product image';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (saveAsStatus) => {
    if (!validate()) return;
    
    setLoading(true);
    
    const mainImgNode = images.find(img => img.isMain);
    const sortedImages = mainImgNode 
      ? [mainImgNode, ...images.filter(img => !img.isMain)] 
      : images;
      
    const imageUrls = sortedImages.map(img => img.url);
    const mainImg = imageUrls[0] || '';
    const hoverImg = imageUrls[1] || '';

    const productData = {
      name: formData.name,
      sku: formData.sku,
      description: formData.description,
      price: parseFloat(formData.price),
      old_price: formData.old_price ? parseFloat(formData.old_price) : null,
      category: formData.category,
      stock: parseInt(formData.stock, 10),
      low_stock_threshold: parseInt(formData.low_stock_threshold, 10),
      status: saveAsStatus || formData.status,
      visibility: formData.visibility,
      image_url: mainImg,
      hover_image_url: hoverImg,
      images: imageUrls,
      material: formData.material,
      composition: formData.composition,
      pattern_type: formData.pattern_type,
      care_instructions: formData.care_instructions,
      style: formData.style,
      size_guide_url: formData.size_guide_url,
      video_url: formData.video_url,
      sizes: sizesInput.split(/[;,]+/).map(s => s.trim()).filter(Boolean),
      colors: colorsInput.split(/[;,]+/).map(c => c.trim()).filter(Boolean),
      tags: tagsInput.split(/[;,]+/).map(t => t.trim()).filter(Boolean),
      variant_images: variantImages
    };

    try {
      if (isEditing) {
        const { error } = await supabase.from('products').update(productData).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert([productData]);
        if (error) throw error;
      }
      navigate('/admin/products');
    } catch (err) {
      alert('Error saving product: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const discount = calculateDiscount();
  const stockStatus = getStockStatus();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif', color: '#111827' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{isEditing ? 'Edit Product' : 'Add New Product'}</h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>Create and manage product details, inventory, and media.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            type="button" 
            onClick={() => navigate('/admin/products')} 
            style={{ padding: '10px 16px', backgroundColor: '#FAF9F6', color: '#111827', border: '1px solid #D2C4B3', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={() => handleSubmit('draft')}
            disabled={loading}
            style={{ padding: '10px 16px', backgroundColor: '#f3f4f6', color: '#111827', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {loading ? <Loader2 size={16} className="spin" /> : null}
            Save as Draft
          </button>
          <button 
            type="button"
            onClick={() => handleSubmit('active')}
            disabled={loading} 
            style={{ padding: '10px 16px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '14px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {loading ? <Loader2 size={16} className="spin" /> : <CheckCircle2 size={16} />}
            Publish Product
          </button>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        <style>{`
          @media(min-width: 1024px) {
            .form-grid { grid-template-columns: 2fr 1fr; }
          }
          .card { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; overflow: hidden; margin-bottom: 24px; }
          .card-header { padding: 16px 20px; border-bottom: 1px solid #e5e7eb; background: #fafafa; font-weight: 600; font-size: 16px; display: flex; alignItems: center; gap: 8px; }
          .card-body { padding: 20px; }
          .input-label { display: block; font-weight: 500; font-size: 14px; margin-bottom: 6px; color: #374151; }
          .input-field { width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; color: #111827; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
          .input-field:focus { border-color: #000; box-shadow: 0 0 0 1px #000; }
          .error-text { color: #dc2626; font-size: 12px; margin-top: 4px; display: flex; align-items: center; gap: 4px; }
          
          .drag-zone { border: 2px dashed #D2C4B3; border-radius: 8px; padding: 40px 20px; text-align: center; background: #fff; cursor: pointer; transition: all 0.2s; }
          .drag-zone:hover { border-color: #BCA38F; background: #FAF9F6; }
          
          .image-card { position: relative; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; background: #fff; }
          .image-card img { width: 100%; height: 120px; object-fit: cover; display: block; }
          .image-card .actions { padding: 8px; display: flex; justify-content: space-between; align-items: center; background: #f9fafb; border-top: 1px solid #e5e7eb; }
          .badge-main { position: absolute; top: 8px; left: 8px; background: rgba(0,0,0,0.7); color: white; font-size: 10px; font-weight: bold; padding: 4px 8px; border-radius: 4px; backdrop-filter: blur(4px); }
          
          @keyframes spin { 100% { transform: rotate(360deg); } }
          .spin { animation: spin 1s linear infinite; }
        `}</style>

        <div className="form-grid" style={{ display: 'grid', gap: '24px' }}>
          
          {/* LEFT COLUMN - MAIN FORM */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            
            {/* Product Information */}
            <div className="card">
              <div className="card-header"><Box size={18} /> Product Information</div>
              <div className="card-body" style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label className="input-label">Product Name *</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="e.g. Premium Bone Straight Wig"
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  />
                  {errors.name && <div className="error-text"><AlertCircle size={14}/> {errors.name}</div>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="input-label">SKU</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="MFG-WIG-001"
                        value={formData.sku} 
                        onChange={(e) => setFormData({...formData, sku: e.target.value})} 
                      />
                      <button type="button" onClick={generateSKU} style={{ padding: '0 16px', background: '#FAF9F6', border: '1px solid #D2C4B3', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap', color: '#111827' }}>
                        Generate
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="input-label">Category *</label>
                    <select 
                      className="input-field"
                      value={formData.category} 
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="" disabled>Select a category...</option>
                      {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                    </select>
                    {errors.category && <div className="error-text"><AlertCircle size={14}/> {errors.category}</div>}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className="input-label">Product Description</label>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>{formData.description.length} chars</span>
                  </div>
                  <textarea 
                    className="input-field" 
                    rows="5"
                    placeholder="Describe the product details, material, and care instructions..."
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="input-label">Material (e.g. Knitted Fabric)</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={formData.material} 
                      onChange={(e) => setFormData({...formData, material: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="input-label">Composition (e.g. 95% Polyester)</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={formData.composition} 
                      onChange={(e) => setFormData({...formData, composition: e.target.value})} 
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="input-label">Pattern Type (e.g. Plain)</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={formData.pattern_type} 
                      onChange={(e) => setFormData({...formData, pattern_type: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="input-label">Style (e.g. Elegant, Casual)</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={formData.style} 
                      onChange={(e) => setFormData({...formData, style: e.target.value})} 
                    />
                  </div>
                </div>
                <div>
                  <label className="input-label">Care Instructions</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="e.g. Machine wash or professional dry clean"
                    value={formData.care_instructions} 
                    onChange={(e) => setFormData({...formData, care_instructions: e.target.value})} 
                  />
                </div>
                
                <div>
                  <label className="input-label">Tags (comma separated e.g. Midi, Sleeveless)</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Midi, Sleeveless, Regular"
                    value={tagsInput} 
                    onChange={(e) => setTagsInput(e.target.value)} 
                  />
                </div>
              </div>
            </div>

            {/* Media / Images */}
            <div className="card">
              <div className="card-header"><Upload size={18} /> Product Images *</div>
              <div className="card-body">
                {errors.images && <div className="error-text" style={{ marginBottom: '16px' }}><AlertCircle size={14}/> {errors.images}</div>}
                
                <div 
                  className="drag-zone"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    multiple 
                    accept="image/png, image/jpeg, image/webp"
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                  />
                  {uploading ? (
                    <div style={{ color: '#6b7280' }}>
                      <Loader2 size={32} className="spin" style={{ margin: '0 auto 12px', color: '#111827' }} />
                      <p style={{ margin: 0, fontWeight: '500' }}>Uploading images...</p>
                    </div>
                  ) : (
                    <>
                      <div style={{ background: '#e5e7eb', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <Upload size={24} color="#4b5563" />
                      </div>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#111827' }}>Drag & drop images here</h4>
                      <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6b7280' }}>or click to browse files</p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>PNG, JPG or WEBP • Maximum 5MB per image</p>
                    </>
                  )}
                </div>

                {images.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px', marginTop: '24px' }}>
                    {images.map((img, index) => (
                      <div key={index} className="image-card">
                        {img.isMain && <div className="badge-main">MAIN IMAGE</div>}
                        <img src={img.url} alt={`Upload ${index + 1}`} />
                        <div className="actions">
                          <button 
                            type="button"
                            title="Set as Main"
                            onClick={() => setMainImage(index)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: img.isMain ? '#000' : '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '500' }}
                          >
                            <Star size={14} fill={img.isMain ? "#000" : "none"} /> Main
                          </button>
                          <button 
                            type="button"
                            title="Remove"
                            onClick={() => removeImage(index)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#ef4444' }}
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="card">
              <div className="card-header"><Tag size={18} /> Pricing</div>
              <div className="card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label className="input-label">Selling Price *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#6b7280', fontWeight: '500' }}>$</span>
                    <input 
                      type="number" 
                      step="0.01" 
                      className="input-field" 
                      style={{ paddingLeft: '32px' }}
                      placeholder="0.00"
                      value={formData.price} 
                      onChange={(e) => setFormData({...formData, price: e.target.value})} 
                    />
                  </div>
                  {errors.price && <div className="error-text"><AlertCircle size={14}/> {errors.price}</div>}
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className="input-label">Old Price (Compare-at)</label>
                    {discount > 0 && <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 'bold' }}>{discount}% OFF</span>}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#6b7280', fontWeight: '500' }}>$</span>
                    <input 
                      type="number" 
                      step="0.01" 
                      className="input-field" 
                      style={{ paddingLeft: '32px' }}
                      placeholder="0.00"
                      value={formData.old_price} 
                      onChange={(e) => setFormData({...formData, old_price: e.target.value})} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="card">
              <div className="card-header"><Box size={18} /> Inventory & Stock</div>
              <div className="card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label className="input-label">Stock Quantity *</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={formData.stock} 
                    onChange={(e) => setFormData({...formData, stock: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="input-label">Low Stock Threshold</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={formData.low_stock_threshold} 
                    onChange={(e) => setFormData({...formData, low_stock_threshold: e.target.value})} 
                  />
                </div>
              </div>
              <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', background: '#fafafa', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Stock Status:</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '100px', fontSize: '13px', fontWeight: '600', backgroundColor: stockStatus.bg, color: stockStatus.color }}>
                  {stockStatus.icon} {stockStatus.text}
                </span>
              </div>
            </div>

            {/* Variants */}
            <div className="card">
              <div className="card-header"><Tag size={18} /> Variants (Optional)</div>
              <div className="card-body" style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label className="input-label">Available Sizes (comma separated)</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="e.g. 8, 10, 12, 14"
                    value={sizesInput} 
                    onChange={(e) => setSizesInput(e.target.value)} 
                  />
                </div>
                <div>
                  <label className="input-label">Available Colors (comma separated)</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="e.g. Black, White, Red"
                    value={colorsInput} 
                    onChange={(e) => setColorsInput(e.target.value)} 
                  />
                </div>
                <div>
                  <label className="input-label">Size Guide Image</label>
                  {formData.size_guide_url ? (
                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: '8px' }}>
                      <img src={formData.size_guide_url} alt="Size Guide" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #eee' }} />
                      <button type="button" onClick={() => setFormData({...formData, size_guide_url: ''})} style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'red', color: 'white', borderRadius: '50%', border: 'none', cursor: 'pointer', padding: '4px' }}><X size={12} /></button>
                    </div>
                  ) : (
                    <div>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => processSingleFile(e, 'size_guide_url')} 
                        style={{ display: 'none' }}
                        id="size-guide-upload"
                      />
                      <label htmlFor="size-guide-upload" style={{ display: 'inline-block', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', background: '#f9fafb' }}>
                        {uploading ? 'Uploading...' : 'Upload Image'}
                      </label>
                    </div>
                  )}
                </div>
                <div>
                  <label className="input-label">Product Video (Optional)</label>
                  {formData.video_url ? (
                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: '8px' }}>
                      <video src={formData.video_url} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #eee' }} controls />
                      <button type="button" onClick={() => setFormData({...formData, video_url: ''})} style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'red', color: 'white', borderRadius: '50%', border: 'none', cursor: 'pointer', padding: '4px' }}><X size={12} /></button>
                    </div>
                  ) : (
                    <div>
                      <input 
                        type="file" 
                        accept="video/mp4,video/quicktime"
                        onChange={(e) => processSingleFile(e, 'video_url')} 
                        style={{ display: 'none' }}
                        id="video-upload"
                      />
                      <label htmlFor="video-upload" style={{ display: 'inline-block', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', background: '#f9fafb' }}>
                        {uploading ? 'Uploading...' : 'Upload Video (Max 20MB)'}
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Color Images */}
            {colorsInput && colorsInput.trim().length > 0 && (
              <div className="card">
                <div className="card-header"><Image size={18} /> Color Specific Images</div>
                <div className="card-body" style={{ display: 'grid', gap: '20px' }}>
                  <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>Add an image URL for each color. When customers select this color, the main image will automatically change to this image!</p>
                  
                  {colorsInput.split(/[;,]+/).map(c => c.trim()).filter(Boolean).map(color => (
                    <div key={color}>
                      <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: color.toLowerCase(), border: '1px solid #ddd' }} />
                        {color} Image URL
                      </label>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder={`https://example.com/${color.toLowerCase()}-dress.jpg`}
                        value={variantImages[color] || ''} 
                        onChange={(e) => setVariantImages({...variantImages, [color]: e.target.value})} 
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN - SIDEBAR */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            
            {/* Live Preview */}
            <div className="admin-card p-0" style={{ marginBottom: '24px', border: '1px solid #D2C4B3' }}>
              <div className="card-header" style={{ padding: '16px 20px', borderBottom: '1px solid #D2C4B3', fontWeight: '600', color: '#111827' }}>
                Search Engine Optimization
              </div>
              <div className="card-body" style={{ background: '#FAF9F6', padding: '32px 20px' }}>
                
                {/* Storefront Card Replica */}
                <div style={{ background: '#fff', borderRadius: '4px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                  <div style={{ width: '100%', height: '240px', background: '#e5e7eb', position: 'relative' }}>
                    {images.length > 0 ? (
                      <img src={images.find(img => img.isMain)?.url || images[0].url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                        <ImageIcon size={48} style={{ opacity: 0.5, marginBottom: '8px' }} />
                        <span style={{ fontSize: '12px' }}>No image uploaded</span>
                      </div>
                    )}
                    
                    {/* Discount Badge */}
                    {discount > 0 && (
                      <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#000', color: '#fff', fontSize: '12px', fontWeight: 'bold', padding: '4px 8px' }}>
                        -{discount}%
                      </div>
                    )}
                  </div>
                  
                  <div style={{ padding: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>
                      {categories.find(c => c.value === formData.category)?.label || 'Category'}
                    </div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: '#111827', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '40px' }}>
                      {formData.name || 'Premium Product Name Example'}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>
                        ${parseFloat(formData.price || 0).toFixed(2)}
                      </span>
                      {formData.old_price && parseFloat(formData.old_price) > parseFloat(formData.price || 0) && (
                        <span style={{ fontSize: '12px', color: '#9ca3af', textDecoration: 'line-through' }}>
                          ${parseFloat(formData.old_price).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Publishing */}
            <div className="card">
              <div className="card-header"><RefreshCw size={18} /> Publishing</div>
              <div className="card-body" style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label className="input-label">Product Status</label>
                  <select 
                    className="input-field"
                    value={formData.status} 
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                  <label className="input-label" style={{ marginBottom: '12px' }}>Visibility</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '12px' }}>
                    <input 
                      type="radio" 
                      name="visibility" 
                      checked={formData.visibility === true} 
                      onChange={() => setFormData({...formData, visibility: true})}
                      style={{ width: '16px', height: '16px', accentColor: '#000' }}
                    />
                    <span style={{ fontSize: '14px', color: '#111827', display: 'flex', alignItems: 'center', gap: '6px' }}><Eye size={16} color="#6b7280"/> Visible in Store</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="visibility" 
                      checked={formData.visibility === false} 
                      onChange={() => setFormData({...formData, visibility: false})}
                      style={{ width: '16px', height: '16px', accentColor: '#000' }}
                    />
                    <span style={{ fontSize: '14px', color: '#111827', display: 'flex', alignItems: 'center', gap: '6px' }}><EyeOff size={16} color="#6b7280"/> Hidden from Store</span>
                  </label>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// Helper icon since lucide-react Image is imported as ImageIcon in some versions, we'll just draw a quick SVG
const ImageIcon = ({ size, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
  </svg>
);

// We also need Trash from lucide, but I forgot to add it to the import list, so let's import it at the top.
// Wait, I can't modify the import without rewriting, so I'll just use a small SVG inline for Trash to be safe since I used it.
const Trash = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

export default ProductForm;
