import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, Upload, X, AlertCircle } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

function RequestReturn() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { formatPrice } = useCurrency();
  
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [selectedItems, setSelectedItems] = useState([]);
  const [reason, setReason] = useState('');
  const [photos, setPhotos] = useState([]); // File objects
  
  const returnReasons = [
    "Item is defective or damaged",
    "Wrong item sent",
    "Item does not match description",
    "Item does not fit",
    "Changed my mind",
    "Other"
  ];

  useEffect(() => {
    if (!session?.user?.email) {
      navigate('/login');
      return;
    }
    fetchOrderDetails();
  }, [id, session]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .eq('customer_email', session.user.email)
      .single();
      
    if (orderError || !orderData) {
      setError('Order not found or unauthorized.');
      setLoading(false);
      return;
    }
    
    // Check if order is eligible (must be Delivered, within 7 days)
    if (orderData.status !== 'Delivered') {
      setError('Only delivered orders are eligible for return.');
      setLoading(false);
      return;
    }
    
    setOrder(orderData);
    
    const { data: itemsData } = await supabase
      .from('order_items')
      .select(`
        *,
        product:products (name, image_url)
      `)
      .eq('order_id', id);
      
    if (itemsData) setItems(itemsData);
    setLoading(false);
  };

  const toggleItemSelection = (item) => {
    if (selectedItems.find(i => i.id === item.id)) {
      setSelectedItems(selectedItems.filter(i => i.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 5) {
      alert("You can only upload up to 5 photos.");
      return;
    }
    setPhotos([...photos, ...files]);
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      alert('Please select at least one item to return.');
      return;
    }
    if (!reason) {
      alert('Please select a reason for the return.');
      return;
    }
    
    setSubmitting(true);
    setError('');

    try {
      // 1. Upload photos to 'returns' bucket
      const photoUrls = [];
      for (const file of photos) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${session.user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('returns')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('returns')
          .getPublicUrl(filePath);

        photoUrls.push(publicUrlData.publicUrl);
      }

      // 2. Create return request record
      const itemsJson = selectedItems.map(item => ({
        id: item.id,
        product_id: item.product_id,
        name: item.product?.name,
        size: item.size,
        color: item.color,
        price: item.price,
        quantity: 1 // simplify assuming returning 1 of each selected item
      }));

      const { data: returnData, error: returnError } = await supabase
        .from('return_requests')
        .insert([{
          order_id: id,
          customer_email: session.user.email,
          items: itemsJson,
          reason,
          photos: photoUrls,
          status: 'Pending Review'
        }])
        .select()
        .single();

      if (returnError) throw returnError;

      // 3. Update order status to 'Return Requested' to prevent multiple requests
      await supabase
        .from('orders')
        .update({ status: 'Returns' })
        .eq('id', id);

      // 4. Trigger Email API
      await fetch('/api/send-return-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session.user.email,
          returnId: returnData.id,
          status: 'Pending Review'
        })
      });

      // 5. Navigate to return details
      navigate(`/profile/returns/${returnData.id}`);

    } catch (err) {
      console.error('Error submitting return:', err);
      setError('Failed to submit return request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  if (error) {
    return (
      <div style={{ padding: '60px 20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <AlertCircle size={48} color="#dc2626" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ marginBottom: '16px' }}>Cannot Process Return</h2>
        <p style={{ color: '#666', marginBottom: '24px' }}>{error}</p>
        <Link to="/profile/orders" style={{ padding: '10px 24px', background: '#000', color: '#fff', textDecoration: 'none', borderRadius: '24px' }}>
          Back to My Orders
        </Link>
      </div>
    );
  }

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', fontFamily: '-apple-system, sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', minHeight: '100vh', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <Link to="/profile/orders" style={{ color: 'inherit' }}>
            <ChevronLeft size={24} style={{ cursor: 'pointer' }} />
          </Link>
          <h1 style={{ flex: 1, textAlign: 'center', fontSize: '20px', margin: 0 }}>Request Return</h1>
          <div style={{ width: '24px' }}></div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>1. Select Items to Return</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {items.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => toggleItemSelection(item)}
                  style={{ 
                    display: 'flex', 
                    gap: '16px', 
                    padding: '12px', 
                    border: '1px solid',
                    borderColor: selectedItems.find(i => i.id === item.id) ? '#000' : '#eee',
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    background: selectedItems.find(i => i.id === item.id) ? '#fafafa' : '#fff'
                  }}
                >
                  <div style={{ width: '60px', height: '60px', background: '#f5f5f5', borderRadius: '4px', overflow: 'hidden' }}>
                    {item.product?.image_url && (
                      <img src={item.product.image_url} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{item.product?.name || 'Product'}</div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      {item.color} | {item.size}
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', marginTop: '4px' }}>
                      {formatPrice(item.price)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ 
                      width: '20px', height: '20px', 
                      borderRadius: '50%', 
                      border: '2px solid',
                      borderColor: selectedItems.find(i => i.id === item.id) ? '#000' : '#ddd',
                      background: selectedItems.find(i => i.id === item.id) ? '#000' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {selectedItems.find(i => i.id === item.id) && <div style={{ width: '8px', height: '8px', background: '#fff', borderRadius: '50%' }} />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>2. Reason for Return</h3>
            <select 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}
            >
              <option value="">Select a reason</option>
              {returnReasons.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>3. Photos (Optional)</h3>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
              If the item is damaged or defective, please upload clear photos of the issue to speed up your request.
            </p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
              {photos.map((photo, index) => (
                <div key={index} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #eee' }}>
                  <img src={URL.createObjectURL(photo)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button 
                    type="button" 
                    onClick={() => removePhoto(index)}
                    style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              
              {photos.length < 5 && (
                <label style={{ 
                  width: '80px', height: '80px', 
                  border: '1px dashed #ccc', borderRadius: '8px', 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                  cursor: 'pointer', background: '#fafafa', color: '#666' 
                }}>
                  <Upload size={20} style={{ marginBottom: '4px' }} />
                  <span style={{ fontSize: '10px' }}>Upload</span>
                  <input type="file" multiple accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                </label>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={submitting || selectedItems.length === 0 || !reason}
            style={{ 
              width: '100%', padding: '16px', 
              background: submitting || selectedItems.length === 0 || !reason ? '#ccc' : '#000', 
              color: '#fff', border: 'none', borderRadius: '8px', 
              fontSize: '16px', fontWeight: 'bold', cursor: submitting || selectedItems.length === 0 || !reason ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Return Request'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RequestReturn;
