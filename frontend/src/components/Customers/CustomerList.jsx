import { useState, useEffect } from 'react';
import { getCustomers, createCustomer, deleteCustomer } from '../../api/client';
import { useToast } from '../UI/Toast';
import Modal from '../UI/Modal';
import ConfirmDialog from '../UI/ConfirmDialog';
import CustomerForm from './CustomerForm';
import CustomerCard from './CustomerCard';

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await getCustomers();
      setCustomers(res.data);
    } catch (err) {
      showError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      await createCustomer(data);
      showSuccess('Customer added successfully');
      setModalOpen(false);
      fetchCustomers();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to add customer');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCustomer(deleteTarget.id);
      showSuccess('Customer deleted successfully');
      setDeleteTarget(null);
      fetchCustomers();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to delete customer');
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Customers</h1>
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
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">{customers.length} total customers</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          + Add Customer
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              className="form-input"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {filteredCustomers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <h3 className="empty-state-title">
                {search ? 'No customers found' : 'No customers yet'}
              </h3>
              <p className="empty-state-desc">
                {search
                  ? 'Try adjusting your search criteria.'
                  : 'Add your first customer to start managing your client base.'}
              </p>
              {!search && (
                <button
                  className="btn btn-primary mt-lg"
                  onClick={() => setModalOpen(true)}
                >
                  + Add Customer
                </button>
              )}
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <CustomerCard
                      key={customer.id}
                      customer={customer}
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
        onClose={() => setModalOpen(false)}
        title="Add New Customer"
        size="md"
      >
        <CustomerForm
          onSubmit={handleSubmit}
          onClose={() => setModalOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        title="Delete Customer"
        message={`Are you sure you want to delete "${deleteTarget?.full_name}"? This action cannot be undone.`}
      />
    </div>
  );
}
