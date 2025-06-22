import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  DollarSign, 
  TrendingUp,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { getAllOrders, getAllProducts, Order, Product } from '../../services/firebaseService';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin');
      return;
    }

    const fetchData = async () => {
      try {
        const [ordersData, productsData] = await Promise.all([
          getAllOrders(),
          getAllProducts()
        ]);
        setOrders(ordersData);
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    navigate('/admin');
  };

  const getOrderStats = () => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const completedOrders = orders.filter(order => order.status === 'delivered').length;
    const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;
    const totalRevenue = orders
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + order.totalPrice, 0);

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full animate-ping"></div>
            </div>
          </div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = getOrderStats();
  
  // Safeguard against undefined items
  const recentOrders = orders.slice(0, 5).map(order => ({
    ...order,
    items: order.items || [] // Ensure items is always an array
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Floating Header */}
      <header className={`sticky top-0 z-20 bg-white shadow-md transition-all duration-300 ${isScrolled ? 'py-3' : 'py-5'} rounded-b-2xl`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-600 p-2 rounded-xl">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 bg-gradient-to-r from-red-500 to-rose-600 text-white px-3 py-2 rounded-xl hover:shadow-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="mb-8 bg-white p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-bold text-gray-900">Business Overview</h2>
            <div className="flex space-x-2">
              <button 
                className={`px-3 py-1 rounded-full text-sm font-medium ${activeTab === 'overview' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500'}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button 
                className={`px-3 py-1 rounded-full text-sm font-medium ${activeTab === 'analytics' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500'}`}
                onClick={() => navigate('/admin/analytics')}
              >
                Analytics
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
              <div className="flex items-center">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                <span className="ml-2 text-sm text-gray-600">Total Orders</span>
              </div>
              <div className="text-xl font-bold mt-1 text-gray-900">{stats.totalOrders}</div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-xl border border-amber-100">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-amber-600" />
                <span className="ml-2 text-sm text-gray-600">Pending</span>
              </div>
              <div className="text-xl font-bold mt-1 text-gray-900">{stats.pendingOrders}</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="ml-2 text-sm text-gray-600">Completed</span>
              </div>
              <div className="text-xl font-bold mt-1 text-gray-900">{stats.completedOrders}</div>
            </div>
            
            <div className="bg-gradient-to-br from-rose-50 to-red-50 p-4 rounded-xl border border-rose-100">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-rose-600" />
                <span className="ml-2 text-sm text-gray-600">Cancelled</span>
              </div>
              <div className="text-xl font-bold mt-1 text-gray-900">{stats.cancelledOrders}</div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 p-4 rounded-xl border border-emerald-100">
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <span className="ml-2 text-sm text-gray-600">Revenue</span>
              </div>
              <div className="text-xl font-bold mt-1 text-gray-900">৳{stats.totalRevenue.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <button
            onClick={() => navigate('/admin/orders')}
            className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1 text-left group"
          >
            <div className="flex justify-between items-center">
              <div className="bg-blue-100 p-3 rounded-xl">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mt-3 mb-1">Manage Orders</h3>
            <p className="text-sm text-gray-600">View, update, and track all orders</p>
          </button>

          <button
            onClick={() => navigate('/admin/products')}
            className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1 text-left group"
          >
            <div className="flex justify-between items-center">
              <div className="bg-green-100 p-3 rounded-xl">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mt-3 mb-1">Manage Products</h3>
            <p className="text-sm text-gray-600">Add, edit, and delete products</p>
          </button>

          <button
            onClick={() => navigate('/admin/analytics')}
            className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1 text-left group"
          >
            <div className="flex justify-between items-center">
              <div className="bg-purple-100 p-3 rounded-xl">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mt-3 mb-1">Analytics</h3>
            <p className="text-sm text-gray-600">View sales reports and analytics</p>
          </button>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Recent Orders</h3>
            <button 
              onClick={() => navigate('/admin/orders')}
              className="text-sm text-indigo-600 font-medium flex items-center"
            >
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="divide-y divide-gray-100">
            {recentOrders.map((order) => {
              // Safeguard again in case items is undefined
              const items = order.items || [];
              
              return (
                <div 
                  key={order.id}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/orders/${order.id}`)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900">#{order.id.slice(0, 8)}</div>
                      <div className="text-sm text-gray-500 mt-1">{order.customerName}</div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold">৳{order.totalPrice}</div>
                      <div className="flex items-center justify-end mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3">
                    <div className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="flex space-x-1">
                      {items.slice(0, 3).map((item, idx) => (
                        <div 
                          key={idx} 
                          className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-700"
                        >
                          {item.quantity}
                        </div>
                      ))}
                      {items.length > 3 && (
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-500">
                          +{items.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {recentOrders.length === 0 && (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-2">No recent orders</div>
              <button 
                onClick={() => navigate('/admin/products')}
                className="text-indigo-600 font-medium"
              >
                Add products to get started
              </button>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-5 mt-8">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-5 rounded-2xl">
            <div className="text-lg font-bold">৳{stats.totalRevenue.toLocaleString()}</div>
            <div className="text-sm opacity-80 mt-1">Total Revenue</div>
            <div className="flex items-center mt-4">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs ml-1">12% from last month</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-5 rounded-2xl">
            <div className="text-lg font-bold">{products.length}</div>
            <div className="text-sm opacity-80 mt-1">Active Products</div>
            <div className="flex items-center mt-4">
              <Package className="w-4 h-4" />
              <span className="text-xs ml-1">Manage in Products</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;