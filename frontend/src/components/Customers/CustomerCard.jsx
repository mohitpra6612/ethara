const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function CustomerCard({ customer, onDelete }) {
  return (
    <tr>
      <td>
        <strong>{customer.full_name}</strong>
      </td>
      <td className="text-secondary">{customer.email}</td>
      <td className="text-secondary">{customer.phone}</td>
      <td className="text-secondary">{formatDate(customer.created_at)}</td>
      <td>
        <div className="table-actions">
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onDelete(customer)}
          >
            🗑 Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
