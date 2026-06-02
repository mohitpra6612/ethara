const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);

const getStockBadge = (quantity) => {
  if (quantity <= 5) return <span className="badge badge-danger">Critical</span>;
  if (quantity <= 10) return <span className="badge badge-warning">Low</span>;
  return <span className="badge badge-success">In Stock</span>;
};

export default function ProductCard({ product, onEdit, onDelete }) {
  return (
    <tr>
      <td>
        <strong>{product.name}</strong>
      </td>
      <td className="text-mono text-secondary">{product.sku}</td>
      <td className="price-text">{formatCurrency(product.price)}</td>
      <td>
        <div className="flex gap-sm" style={{ alignItems: 'center' }}>
          {product.quantity_in_stock} {getStockBadge(product.quantity_in_stock)}
        </div>
      </td>
      <td>
        <div className="table-actions">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onEdit(product)}
          >
            ✏️ Edit
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onDelete(product)}
          >
            🗑 Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
