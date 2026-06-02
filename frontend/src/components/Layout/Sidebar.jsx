import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/products', label: 'Products', icon: '📦' },
  { to: '/customers', label: 'Customers', icon: '👥' },
  { to: '/orders', label: 'Orders', icon: '🛒' },
];

// - [x] Add modern touches and micro-animations to Sidebar.jsx
export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <h1>InvenTrack</h1>
          <span>Inventory Management</span>
        </div>
        <button className="sidebar-close" aria-label="Close sidebar" onClick={onClose}>✖</button>
        <nav className="sidebar-nav" role="navigation" aria-label="Main navigation">
            {navItems.map((item, idx) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
                onClick={onClose}
                style={{ '--delay': `${idx * 0.05}s` }}
              >
                <span className="icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
        </nav>

        <div className="sidebar-footer">
          <p>© 2026 InvenTrack v1.0</p>
        </div>
      </aside>
    </>
  );
}
