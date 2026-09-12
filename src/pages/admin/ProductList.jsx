import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { productNeedsPackageSync, syncAllProductPackageDimensions } from '../../utils/package';
import { getProductStockTotals } from '../../utils/stock';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [view, setView] = useState('catalog'); // catalog | trash

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (!error) {
      const list = data || [];
      if (list.some(productNeedsPackageSync)) {
        await syncAllProductPackageDimensions(supabase);
        const { data: refreshed } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        setProducts(refreshed || list);
      } else {
        setProducts(list);
      }
    }
    setLoading(false);
  };

  const isTrashed = (product) => String(product.status || '').toLowerCase() === 'archived';
  const catalogProducts = products.filter((product) => !isTrashed(product));
  const trashProducts = products.filter((product) => isTrashed(product));
  const visibleProducts = view === 'trash' ? trashProducts : catalogProducts;

  const allVisibleIds = visibleProducts.map((product) => product.id);
  const allSelected = visibleProducts.length > 0 && selectedIds.length === visibleProducts.length;

  const toggleOne = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    setSelectedIds(allSelected ? [] : allVisibleIds);
  };

  const applyBulkUpdate = async (updates, label) => {
    if (selectedIds.length === 0) {
      alert('Select at least one product first.');
      return;
    }
    if (!window.confirm(`${label} ${selectedIds.length} selected product${selectedIds.length === 1 ? '' : 's'}?`)) {
      return;
    }
    setBulkSaving(true);
    const { error } = await supabase.from('products').update(updates).in('id', selectedIds);
    setBulkSaving(false);
    if (error) {
      alert('Could not update products: ' + error.message);
      return;
    }
    setSelectedIds([]);
    fetchProducts();
  };

  const moveToTrash = async (id) => {
    if (!window.confirm('Move this product to Trash? You can restore it later from the Trash tab.')) {
      return;
    }
    const { error } = await supabase
      .from('products')
      .update({ status: 'archived', visibility: false })
      .eq('id', id);
    if (error) {
      alert('Could not move to Trash: ' + error.message);
      return;
    }
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    fetchProducts();
  };

  const restoreProduct = async (id) => {
    const { error } = await supabase
      .from('products')
      .update({ status: 'draft', visibility: false })
      .eq('id', id);
    if (error) {
      alert('Could not restore product: ' + error.message);
      return;
    }
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    fetchProducts();
  };

  const permanentlyDelete = async (id) => {
    if (!window.confirm('Permanently delete this product? This cannot be undone.')) {
      return;
    }
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      alert('Could not delete product: ' + error.message);
      return;
    }
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    fetchProducts();
  };

  const visibilityLabel = (product) => {
    if (isTrashed(product)) return 'Trash';
    if (product.visibility === false || product.status === 'draft') return 'Hidden';
    return 'Published';
  };

  const switchView = (next) => {
    setView(next);
    setSelectedIds([]);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ margin: 0 }}>Products</h1>
        <Link to="/admin/products/new" style={{ padding: '10px 20px', background: 'black', color: 'white', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
          + Add Product
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => switchView('catalog')}
          style={{
            padding: '8px 14px',
            borderRadius: '999px',
            border: '1px solid #e5e7eb',
            background: view === 'catalog' ? '#111' : '#fff',
            color: view === 'catalog' ? '#fff' : '#111',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Catalog ({catalogProducts.length})
        </button>
        <button
          type="button"
          onClick={() => switchView('trash')}
          style={{
            padding: '8px 14px',
            borderRadius: '999px',
            border: '1px solid #e5e7eb',
            background: view === 'trash' ? '#111' : '#fff',
            color: view === 'trash' ? '#fff' : '#111',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Trash ({trashProducts.length})
        </button>
      </div>

      {view === 'trash' && (
        <p style={{ margin: '0 0 16px', color: '#6b7280', fontSize: '14px' }}>
          Deleted dresses land here. Restore brings them back as a draft (hidden until you publish again). Permanent delete cannot be undone.
        </p>
      )}

      {selectedIds.length > 0 && view === 'catalog' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px', padding: '12px 16px', background: '#111', color: '#fff', borderRadius: '8px' }}>
          <strong>{selectedIds.length} selected</strong>
          <button
            type="button"
            disabled={bulkSaving}
            onClick={() => applyBulkUpdate({ visibility: true, status: 'active' }, 'Publish')}
            style={{ padding: '8px 14px', background: '#fff', color: '#111', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}
          >
            Publish
          </button>
          <button
            type="button"
            disabled={bulkSaving}
            onClick={() => applyBulkUpdate({ visibility: false }, 'Hide')}
            style={{ padding: '8px 14px', background: 'transparent', color: '#fff', border: '1px solid #fff', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}
          >
            Hide
          </button>
          <button
            type="button"
            disabled={bulkSaving}
            onClick={() => applyBulkUpdate({ status: 'archived', visibility: false }, 'Move to Trash')}
            style={{ padding: '8px 14px', background: 'transparent', color: '#fecaca', border: '1px solid #fecaca', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}
          >
            Move to Trash
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds([])}
            style={{ padding: '8px 14px', background: 'transparent', color: '#d1d5db', border: 'none', cursor: 'pointer' }}
          >
            Clear
          </button>
        </div>
      )}

      {selectedIds.length > 0 && view === 'trash' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px', padding: '12px 16px', background: '#111', color: '#fff', borderRadius: '8px' }}>
          <strong>{selectedIds.length} selected</strong>
          <button
            type="button"
            disabled={bulkSaving}
            onClick={() => applyBulkUpdate({ status: 'draft', visibility: false }, 'Restore')}
            style={{ padding: '8px 14px', background: '#fff', color: '#111', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}
          >
            Restore
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds([])}
            style={{ padding: '8px 14px', background: 'transparent', color: '#d1d5db', border: 'none', cursor: 'pointer' }}
          >
            Clear
          </button>
        </div>
      )}

      {loading ? <p>Loading products...</p> : (
        <div className="table-responsive-wrapper" style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <table className="admin-table">
            <thead>
              <tr style={{ borderBottom: '1px solid #eee', backgroundColor: '#fafafa' }}>
                <th style={{ padding: '16px', width: '44px' }}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Select all products"
                  />
                </th>
                <th style={{ padding: '16px' }}>Image</th>
                <th style={{ padding: '16px' }}>Name</th>
                <th style={{ padding: '16px' }}>Price</th>
                <th style={{ padding: '16px', whiteSpace: 'nowrap' }}>US stock</th>
                <th style={{ padding: '16px', whiteSpace: 'nowrap' }}>China stock</th>
                <th style={{ padding: '16px', whiteSpace: 'nowrap' }}>Total</th>
                <th style={{ padding: '16px' }}>Status</th>
                <th style={{ padding: '16px' }}>Category</th>
                <th style={{ padding: '16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleProducts.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ padding: '24px', textAlign: 'center', color: '#666' }}>
                    {view === 'trash' ? 'Trash is empty.' : 'No products found. Add one!'}
                  </td>
                </tr>
              ) : (
                visibleProducts.map((product) => {
                  const stock = getProductStockTotals(product);
                  return (
                  <tr key={product.id} style={{ borderBottom: '1px solid #eee', background: selectedIds.includes(product.id) ? '#f5f5f5' : 'transparent' }}>
                    <td style={{ padding: '16px' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(product.id)}
                        onChange={() => toggleOne(product.id)}
                        aria-label={`Select ${product.name}`}
                      />
                    </td>
                    <td style={{ padding: '16px' }}>
                      {product.image_url ? <img src={product.image_url} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} /> : 'No image'}
                    </td>
                    <td style={{ padding: '16px', fontWeight: '500' }}>{product.name}</td>
                    <td style={{ padding: '16px' }}>${product.price}</td>
                    <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>{stock.us}</td>
                    <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>{stock.intl}</td>
                    <td style={{ padding: '16px', whiteSpace: 'nowrap', fontWeight: 600 }}>{stock.total}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '100px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: visibilityLabel(product) === 'Published' ? '#dcfce7' : visibilityLabel(product) === 'Trash' ? '#fee2e2' : '#f3f4f6',
                        color: visibilityLabel(product) === 'Published' ? '#166534' : visibilityLabel(product) === 'Trash' ? '#991b1b' : '#4b5563'
                      }}>
                        {visibilityLabel(product)}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textTransform: 'capitalize' }}>{(product.category || '').replace('-', ' ')}</td>
                    <td style={{ padding: '16px' }}>
                      {view === 'trash' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => restoreProduct(product.id)}
                            style={{ color: '#166534', background: 'none', border: 'none', cursor: 'pointer', marginRight: '12px', fontWeight: 600 }}
                          >
                            Restore
                          </button>
                          <button
                            type="button"
                            onClick={() => permanentlyDelete(product.id)}
                            style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            Delete forever
                          </button>
                        </>
                      ) : (
                        <>
                          <Link to={`/admin/products/edit/${product.id}`} style={{ color: 'blue', marginRight: '16px' }}>Edit</Link>
                          <button
                            type="button"
                            onClick={() => moveToTrash(product.id)}
                            style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ProductList;
