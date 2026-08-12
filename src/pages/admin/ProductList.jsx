import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (!error) setProducts(data || []);
    setLoading(false);
  };

  const deleteProduct = async (id) => {
    if(window.confirm('Are you sure you want to delete this product?')) {
      await supabase.from('products').delete().eq('id', id);
      fetchProducts();
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Products</h1>
        <Link to="/admin/products/new" style={{ padding: '10px 20px', background: 'black', color: 'white', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
          + Add Product
        </Link>
      </div>

      {loading ? <p>Loading products...</p> : (
        <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #eee', backgroundColor: '#fafafa' }}>
                <th style={{ padding: '16px' }}>Image</th>
                <th style={{ padding: '16px' }}>Name</th>
                <th style={{ padding: '16px' }}>Price</th>
                <th style={{ padding: '16px' }}>Stock</th>
                <th style={{ padding: '16px' }}>Category</th>
                <th style={{ padding: '16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#666' }}>No products found. Add one!</td></tr>
              ) : (
                products.map(product => (
                  <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '16px' }}>
                      {product.image_url ? <img src={product.image_url} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} /> : 'No image'}
                    </td>
                    <td style={{ padding: '16px', fontWeight: '500' }}>{product.name}</td>
                    <td style={{ padding: '16px' }}>${product.price}</td>
                    <td style={{ padding: '16px' }}>{product.stock}</td>
                    <td style={{ padding: '16px', textTransform: 'capitalize' }}>{product.category.replace('-', ' ')}</td>
                    <td style={{ padding: '16px' }}>
                      <Link to={`/admin/products/edit/${product.id}`} style={{ color: 'blue', marginRight: '16px' }}>Edit</Link>
                      <button onClick={() => deleteProduct(product.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ProductList;
