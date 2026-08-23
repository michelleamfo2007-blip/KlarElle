import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Folder, Tag } from 'lucide-react';
import './Admin.css';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
      
    if (!error && data) {
      setCategories(data);
    } else if (error) {
      console.error("Error fetching categories:", error);
    }
    setLoading(false);
  };

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;
    
    setIsSubmitting(true);
    const slug = generateSlug(newCategory.name);
    
    const { error } = await supabase
      .from('categories')
      .insert([{ name: newCategory.name.trim(), slug }]);

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        alert('A category with this name (or similar slug) already exists.');
      } else {
        alert('Error adding category: ' + error.message);
      }
    } else {
      setNewCategory({ name: '' });
      setShowAdd(false);
      fetchCategories();
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete the category "${name}"? This will not delete the products in this category.`)) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) {
        alert('Failed to delete category');
      } else {
        fetchCategories();
      }
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="admin-header-flex">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Product Categories</h1>
          <p style={{ color: '#6b7280', margin: 0 }}>Manage the categories available for your products.</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="btn-primary"
        >
          {showAdd ? 'Cancel' : <><Plus size={18} /> Add Category</>}
        </button>
      </div>

      {showAdd && (
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #D2C4B3', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Folder size={18} /> Create New Category
          </h2>
          <form onSubmit={handleAddCategory} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Category Name</label>
              <input 
                type="text" 
                value={newCategory.name}
                onChange={(e) => setNewCategory({ name: e.target.value })}
                placeholder="e.g. Maxi Dresses"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}
                required
              />
              {newCategory.name && (
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px' }}>
                  Slug preview: <span style={{ fontFamily: 'monospace', background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>{generateSlug(newCategory.name)}</span>
                </div>
              )}
            </div>
            
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isSubmitting || !newCategory.name.trim()}
              style={{ padding: '10px 24px', opacity: (isSubmitting || !newCategory.name.trim()) ? 0.7 : 1 }}
            >
              {isSubmitting ? 'Saving...' : 'Save Category'}
            </button>
          </form>
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #D2C4B3', overflow: 'hidden' }}>
        <div className="table-responsive-wrapper">
          <table className="table-standard admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>URL Slug</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                    No categories found. Click "Add Category" to create one.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id}>
                    <td style={{ fontWeight: '500' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Tag size={16} color="#BCA38F" /> {cat.name}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '12px', background: '#f3f4f6', padding: '4px 8px', borderRadius: '4px', color: '#4b5563' }}>
                        {cat.slug}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDelete(cat.id, cat.name)}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: '#dc2626', 
                          cursor: 'pointer',
                          padding: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '4px'
                        }}
                        title="Delete Category"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Categories;
