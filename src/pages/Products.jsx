import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Package,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';
import axiosClient, { formatCurrency } from '../api/axiosClient';
import DataTable from '../components/DataTable';
import ProductForm from '../components/ProductForm';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modals & Actions
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteProductCandidate, setDeleteProductCandidate] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/products', {
        params: {
          search: search.trim() || undefined,
          category: selectedCategory || undefined,
          status: selectedStatus || undefined,
          page,
          size: 10,
        },
      });
      setProducts(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      setToast({ message: 'Failed to fetch products.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axiosClient.get('/products/categories');
      setCategories(res.data || []);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, selectedCategory, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchProducts();
  };

  const handleCreateOrUpdate = async (productData) => {
    if (editingProduct) {
      await axiosClient.put(`/products/${editingProduct.id}`, productData);
      setToast({ message: 'Product updated successfully.', type: 'success' });
    } else {
      await axiosClient.post('/products', productData);
      setToast({ message: 'Product created successfully.', type: 'success' });
    }
    fetchProducts();
    fetchCategories();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteProductCandidate) return;
    try {
      await axiosClient.delete(`/products/${deleteProductCandidate.id}`);
      setToast({ message: `Deleted ${deleteProductCandidate.name}`, type: 'success' });
      setDeleteProductCandidate(null);
      fetchProducts();
      fetchCategories();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to delete product.', type: 'error' });
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Product Name',
      render: (p) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{p.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.sku}</div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (p) => (
        <span
          style={{
            backgroundColor: '#F1F5F9',
            padding: '0.2rem 0.55rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.78rem',
            fontWeight: 500,
          }}
        >
          {p.category}
        </span>
      ),
    },
    {
      key: 'price',
      header: 'Unit Price',
      render: (p) => <span style={{ fontWeight: 600 }}>{formatCurrency(p.price)}</span>,
    },
    {
      key: 'stockQuantity',
      header: 'Current Stock',
      render: (p) => (
        <div>
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{p.stockQuantity}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.35rem' }}>
            (Min: {p.minStockLevel})
          </span>
        </div>
      ),
    },
    {
      key: 'stockStatus',
      header: 'Status',
      render: (p) => {
        let pillClass = 'in-stock';
        let label = 'In Stock';
        if (p.stockQuantity <= 0) {
          pillClass = 'out-of-stock';
          label = 'Out of Stock';
        } else if (p.stockQuantity <= p.minStockLevel) {
          pillClass = 'low-stock';
          label = 'Low Stock';
        }
        return <span className={`status-pill ${pillClass}`}>{label}</span>;
      },
    },
    {
      key: 'supplier',
      header: 'Supplier',
      render: (p) => (
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          {p.supplier || '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (p) => (
        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
          <button
            className="btn-icon"
            title="Edit Product"
            onClick={() => {
              setEditingProduct(p);
              setFormModalOpen(true);
            }}
          >
            <Edit2 size={16} />
          </button>
          <button
            className="btn-icon"
            title="Delete Product"
            style={{ color: 'var(--danger)' }}
            onClick={() => setDeleteProductCandidate(p)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {toast && (
        <div className="toast-container">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Header Toolbar */}
      <div className="toolbar-bar">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Product Catalog</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Manage store merchandise, pricing, stock levels, and suppliers.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={fetchProducts} title="Refresh">
            <RefreshCw size={16} />
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingProduct(null);
              setFormModalOpen(true);
            }}
          >
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Filters Card */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Input */}
          <div className="search-box" style={{ flex: 1, minWidth: '240px' }}>
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div style={{ minWidth: '180px' }}>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(0);
              }}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Stock Status Filter */}
          <div style={{ minWidth: '160px' }}>
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(0);
              }}
            >
              <option value="">All Stock Status</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>

          <button type="submit" className="btn btn-secondary">
            Filter
          </button>
        </form>
      </div>

      {/* Products Table Card */}
      <div className="card">
        <DataTable
          columns={columns}
          data={products}
          loading={loading}
          emptyTitle="No products found"
          emptyDescription="Try adjusting your search criteria or add a new product to your inventory."
          pagination={{
            page,
            totalPages,
            totalElements,
            onPageChange: (newPage) => setPage(newPage),
          }}
        />
      </div>

      {/* Add / Edit Product Modal */}
      <ProductForm
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        product={editingProduct}
        categories={categories}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteProductCandidate}
        title="Delete Product"
        message={`Are you sure you want to permanently delete '${deleteProductCandidate?.name}'? This will also remove all associated sales logs and forecasts.`}
        confirmLabel="Yes, Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteProductCandidate(null)}
        danger={true}
      />
    </div>
  );
};

export default Products;
