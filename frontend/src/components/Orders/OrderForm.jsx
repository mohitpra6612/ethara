import { useState, useEffect } from 'react';
import { getCustomers, getProducts } from '../../api/client';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);

const emptyItem = { product_id: '', quantity: 1 };

export default function OrderForm({ onSubmit, onClose }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([
          getCustomers(),
          getProducts(),
        ]);
        setCustomers(custRes.data);
        setProducts(prodRes.data);
      } catch (err) {
        console.error('Failed to load form data:', err);
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, []);

  const validate = () => {
    const errs = {};
    if (!customerId) errs.customer = 'Please select a customer';
    const validItems = items.filter((item) => item.product_id);
    if (validItems.length === 0) errs.items = 'Add at least one item';
    items.forEach((item, i) => {
      if (item.product_id && (!item.quantity || item.quantity <= 0)) {
        errs[`quantity_${i}`] = 'Qty must be > 0';
      }
    });
    return errs;
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    if (errors[`quantity_${index}`]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[`quantity_${index}`];
        return next;
      });
    }
  };

  const addItem = () => {
    setItems((prev) => [...prev, { ...emptyItem }]);
  };

  const removeItem = (index) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const getItemSubtotal = (item) => {
    const product = products.find((p) => p.id === parseInt(item.product_id));
    if (!product || !item.quantity) return 0;
    return product.price * item.quantity;
  };

  const total = items.reduce((sum, item) => sum + getItemSubtotal(item), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      const orderItems = items
        .filter((item) => item.product_id)
        .map((item) => ({
          product_id: parseInt(item.product_id),
          quantity: parseInt(item.quantity),
        }));
      await onSubmit({
        customer_id: parseInt(customerId),
        items: orderItems,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <>
        <div className="modal-body">
          <div className="loading-spinner">
            <div className="spinner" />
          </div>
        </div>
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body">
        <div className="form-group">
          <label className="form-label">Customer *</label>
          <select
            className="form-select"
            value={customerId}
            onChange={(e) => {
              setCustomerId(e.target.value);
              if (errors.customer) {
                setErrors((prev) => ({ ...prev, customer: '' }));
              }
            }}
          >
            <option value="">Select a customer...</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name} ({c.email})
              </option>
            ))}
          </select>
          {errors.customer && (
            <div className="form-error">{errors.customer}</div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Order Items *</label>
          {errors.items && <div className="form-error mb-md">{errors.items}</div>}

          {items.map((item, index) => (
            <div key={index} className="order-item-row">
              <select
                className="form-select"
                value={item.product_id}
                onChange={(e) =>
                  handleItemChange(index, 'product_id', e.target.value)
                }
              >
                <option value="">Select product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {formatCurrency(p.price)} ({p.quantity_in_stock} in stock)
                  </option>
                ))}
              </select>
              <input
                className="form-input"
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) =>
                  handleItemChange(index, 'quantity', parseInt(e.target.value) || '')
                }
                placeholder="Qty"
              />
              <div className="order-item-subtotal">
                {item.product_id ? formatCurrency(getItemSubtotal(item)) : '—'}
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-icon btn-sm"
                onClick={() => removeItem(index)}
                disabled={items.length <= 1}
                title="Remove item"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            type="button"
            className="btn btn-ghost btn-sm mt-md"
            onClick={addItem}
          >
            + Add Item
          </button>
        </div>

        <div className="order-total-row">
          <span className="order-total-label">Total:</span>
          <span className="order-total-value">{formatCurrency(total)}</span>
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
          {submitting ? 'Creating...' : 'Create Order'}
        </button>
      </div>
    </form>
  );
}
