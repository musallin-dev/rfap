import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { initializeDemoData } from './services/firebaseService';

// Layout Components
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';

// Pages
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import OrderForm from './pages/OrderForm';
import Payment from './pages/Payment';
import Success from './pages/Success';
import AdminLogin from './pages/Admin/Login';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminOrders from './pages/Admin/Orders';
import AdminProducts from './pages/Admin/Products';
import AdminAnalytics from './pages/Admin/Analytics';

// Scroll to top component
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  useEffect(() => {
    // Initialize demo data on app start
    initializeDemoData();
  }, []);

  return (
    <HelmetProvider>
      <Router>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen">
          <Routes>
            {/* Admin Routes (without header/footer) */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            
            {/* Public Routes (with header/footer) */}
            <Route path="/*" element={
              <>
                <Header />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/order/:id" element={<OrderForm />} />
                    <Route path="/payment/:id" element={<Payment />} />
                    <Route path="/success/:orderId" element={<Success />} />
                  </Routes>
                </main>
                <Footer />
              </>
            } />
          </Routes>
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;