const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getStatusBadge = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'confirmed' || s === 'completed')
    return <span className="badge badge-success">{status}</span>;
  if (s === 'pending')
    return <span className="badge badge-warning">{status}</span>;
  if (s === 'cancelled')
    return <span className="badge badge-danger">{status}</span>;
  return <span className="badge badge-neutral">{status}</span>;
};

export default function OrderDetails({ order, onCancel }) {
  if (!order) return null;

  return (
    <>
      <div className="modal-body">
        <div className="order-detail-grid">
          <div className="order-detail-item">
            <label>Order ID</label>
            <span>#{order.id}</span>
          </div>
          <div className="order-detail-item">
            <label>Customer</label>
            <span>{order.customer?.name || order.customer_name || '—'}</span>
          </div>
          <div className="order-detail-item">
            <label>Status</label>
            <span>{getStatusBadge(order.status)}</span>
          </div>
          <div className="order-detail-item">
            <label>Date</label>
            <span>{formatDate(order.created_at)}</span>
          </div>
        </div>

        <div className="form-label mb-md">Order Items</div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item, index) => (
                <tr key={index}>
                  <td>{item.product?.name || item.product_name || '—'}</td>
                  <td>{item.quantity}</td>
                  <td className="price-text">
                    {formatCurrency(item.price || item.unit_price || 0)}
                  </td>
                  <td className="price-text">
                    {formatCurrency(
                      (item.price || item.unit_price || 0) * item.quantity
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="order-total-row">
          <span className="order-total-label">Total:</span>
          <span className="order-total-value">
            {formatCurrency(order.total_amount || order.total || 0)}
          </span>
        </div>
      </div>

      <div className="modal-footer">
        {order.status?.toLowerCase() !== 'cancelled' && (
          <button
            className="btn btn-danger"
            onClick={() => onCancel(order)}
          >
            Cancel Order
          </button>
        )}
      </div>
    </>
  );
}
