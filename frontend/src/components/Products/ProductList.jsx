import { useState, useEffect } from 'react';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../../api/client';
import { useToast } from '../UI/Toast';
import Modal from '../UI/Modal';
import ConfirmDialog from '../UI/ConfirmDialog';
import ProductForm from './ProductForm';
import ProductCard from './ProductCard';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (err) {
      showError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
        showSuccess('Product updated successfully');
      } else {
        await createProduct(data);
        showSuccess('Product created successfully');
      }
      setModalOpen(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(deleteTarget.id);
      showSuccess('Product deleted successfully');
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to delete product');
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Products</h1>
        </div>
        <div className="card">
          <div className="card-body">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton skeleton-row" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{products.length} total products</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          + Add Product
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              className="form-input"
              placeholder="Search by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {filteredProducts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <h3 className="empty-state-title">
                {search ? 'No products found' : 'No products yet'}
              </h3>
              <p className="empty-state-desc">
                {search
                  ? 'Try adjusting your search criteria.'
                  : 'Add your first product to get started with inventory tracking.'}
              </p>
              {!search && (
                <button
                  className="btn btn-primary mt-lg"
                  onClick={openAddModal}
                >
                  + Add Product
                </button>
              )}
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onEdit={handleEdit}
                      onDelete={setDeleteTarget}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="md"
      >
        <ProductForm
          onSubmit={handleSubmit}
          editingProduct={editingProduct}
          onClose={() => {
            setModalOpen(false);
            setEditingProduct(null);
          }}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
