import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/UI/Toast';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import ProductList from './components/Products/ProductList';
import CustomerList from './components/Customers/CustomerList';
import OrderList from './components/Orders/OrderList';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/orders" element={<OrderList />} />
          </Routes>
        </Layout>
      </ToastProvider>
    </BrowserRouter>
  );
}
