import { useState, useEffect } from 'react';
import {
  getOrders,
  getOrder,
  createOrder,
  deleteOrder,
} from '../../api/client';
import { useToast } from '../UI/Toast';
import Modal from '../UI/Modal';
import ConfirmDialog from '../UI/ConfirmDialog';
import OrderForm from './OrderForm';
import OrderDetails from './OrderDetails';

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

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await getOrders();
      setOrders(res.data);
    } catch (err) {
      showError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      await createOrder(data);
      showSuccess('Order created successfully');
      setCreateModalOpen(false);
      fetchOrders();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to create order');
    }
  };

  const handleView = async (order) => {
    try {
      const res = await getOrder(order.id);
      setViewingOrder(res.data);
    } catch (err) {
      showError('Failed to load order details');
    }
  };

  const handleCancel = async () => {
    try {
      await deleteOrder(cancelTarget.id);
      showSuccess('Order cancelled successfully');
      setCancelTarget(null);
      setViewingOrder(null);
      fetchOrders();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to cancel order');
    }
  };

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Orders</h1>
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
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">{orders.length} total orders</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setCreateModalOpen(true)}
        >
          + Create Order
        </button>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🛒</div>
              <h3 className="empty-state-title">No orders yet</h3>
              <p className="empty-state-desc">
                Create your first order to start tracking sales and revenue.
              </p>
              <button
                className="btn btn-primary mt-lg"
                onClick={() => setCreateModalOpen(true)}
              >
                + Create Order
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="text-mono">#{order.id}</td>
                      <td>
                        <strong>
                          {order.customer?.name || order.customer_name || '—'}
                        </strong>
                      </td>
                      <td className="text-secondary">
                        {order.items?.length ??
                          order.item_count ??
                          '—'}{' '}
                        items
                      </td>
                      <td className="price-text">
                        {formatCurrency(
                          order.total_amount || order.total || 0
                        )}
                      </td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td className="text-secondary">
                        {formatDate(order.created_at)}
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleView(order)}
                          >
                            👁 View
                          </button>
                          {order.status?.toLowerCase() !== 'cancelled' && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => setCancelTarget(order)}
                            >
                              ✕ Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Order"
        size="lg"
      >
        <OrderForm
          onSubmit={handleCreate}
          onClose={() => setCreateModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={!!viewingOrder}
        onClose={() => setViewingOrder(null)}
        title={`Order #${viewingOrder?.id || ''}`}
        size="lg"
      >
        <OrderDetails
          order={viewingOrder}
          onCancel={(order) => {
            setCancelTarget(order);
            setViewingOrder(null);
          }}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!cancelTarget}
        onConfirm={handleCancel}
        onCancel={() => setCancelTarget(null)}
        title="Cancel Order"
        message={`Are you sure you want to cancel order #${cancelTarget?.id}? This action cannot be undone.`}
      />
    </div>
  );
}
