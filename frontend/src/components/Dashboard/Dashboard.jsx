import { useState, useEffect } from 'react';
import { getDashboard } from '../../api/client';
import StatCard from './StatCard';
import LowStockTable from './LowStockTable';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await getDashboard();
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Overview of your inventory & orders</p>
          </div>
        </div>
        <div className="stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton skeleton-stat" />
          ))}
        </div>
        <div className="card">
          <div className="card-body">
            {[1, 2, 3].map((i) => (
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
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your inventory & orders</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Products"
          value={data?.total_products ?? 0}
          icon="📦"
          color="blue"
        />
        <StatCard
          title="Total Customers"
          value={data?.total_customers ?? 0}
          icon="👥"
          color="green"
        />
        <StatCard
          title="Total Orders"
          value={data?.total_orders ?? 0}
          icon="🛒"
          color="purple"
        />
        <StatCard
          title="Low Stock Items"
          value={data?.low_stock_products?.length ?? 0}
          icon="⚠️"
          color="orange"
        />
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Low Stock Alert</h2>
        </div>
        <div className="card-body">
          <LowStockTable products={data?.low_stock_products ?? []} />
        </div>
      </div>
    </div>
  );
}
