import { useState, useEffect } from 'react';

const initialForm = {
  name: '',
  sku: '',
  price: '',
  quantity_in_stock: '',
  description: '',
};

export default function ProductForm({ onSubmit, editingProduct, onClose }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setForm({
        name: editingProduct.name || '',
        sku: editingProduct.sku || '',
        price: editingProduct.price?.toString() || '',
        quantity_in_stock: editingProduct.quantity_in_stock?.toString() || '',
        description: editingProduct.description || '',
      });
    } else {
      setForm(initialForm);
    }
    setErrors({});
  }, [editingProduct]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Product name is required';
    if (!form.sku.trim()) errs.sku = 'SKU is required';
    if (!form.price || parseFloat(form.price) <= 0)
      errs.price = 'Price must be greater than 0';
    if (form.quantity_in_stock === '' || parseInt(form.quantity_in_stock) < 0)
      errs.quantity_in_stock = 'Quantity must be 0 or greater';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        name: form.name.trim(),
        sku: form.sku.trim(),
        price: parseFloat(form.price),
        quantity_in_stock: parseInt(form.quantity_in_stock),
        description: form.description.trim(),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input
              className="form-input"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g., Wireless Keyboard"
            />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">SKU *</label>
            <input
              className="form-input"
              name="sku"
              value={form.sku}
              onChange={handleChange}
              placeholder="e.g., WK-001"
            />
            {errors.sku && <div className="form-error">{errors.sku}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Price ($) *</label>
            <input
              className="form-input"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={handleChange}
              placeholder="0.00"
            />
            {errors.price && <div className="form-error">{errors.price}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Quantity *</label>
            <input
              className="form-input"
              name="quantity_in_stock"
              type="number"
              min="0"
              value={form.quantity_in_stock}
              onChange={handleChange}
              placeholder="0"
            />
            {errors.quantity_in_stock && (
              <div className="form-error">{errors.quantity_in_stock}</div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-input form-textarea"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Optional product description..."
            rows={3}
          />
        </div>
      </div>

      <div className="modal-footer">
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting}
        >
          {submitting
            ? 'Saving...'
            : editingProduct
            ? 'Update Product'
            : 'Add Product'}
        </button>
      </div>
    </form>
  );
}
