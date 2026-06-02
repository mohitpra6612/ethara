export default function LowStockTable({ products = [] }) {
  if (products.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">✅</div>
        <h3 className="empty-state-title">All stocked up!</h3>
        <p className="empty-state-desc">
          No products are running low on inventory. Everything looks great.
        </p>
      </div>
    );
  }

  const getStockBadge = (quantity) => {
    if (quantity <= 5) {
      return <span className="badge badge-danger">Critical</span>;
    }
    if (quantity <= 10) {
      return <span className="badge badge-warning">Low</span>;
    }
    return <span className="badge badge-success">OK</span>;
  };

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>SKU</th>
            <th>Current Stock</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td className="text-mono text-secondary">{product.sku}</td>
              <td>{product.quantity_in_stock}</td>
              <td>{getStockBadge(product.quantity_in_stock)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
