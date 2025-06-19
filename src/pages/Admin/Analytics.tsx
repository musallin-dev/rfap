import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Users,
  Calendar,
  BarChart3
} from 'lucide-react';
import { getAllOrders, getAllProducts, Order, Product } from '../../services/firebaseService';

const AdminAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin');
      return;
    }

    fetchData();
  }, [navigate]);

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

  const getFilteredOrders = () => {
    const days = parseInt(dateRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return orders.filter(order => new Date(order.createdAt) >= cutoffDate);
  };

  const getAnalytics = () => {
    const filteredOrders = getFilteredOrders();
    
    const totalRevenue = filteredOrders
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + order.totalPrice, 0);
    
    const totalOrders = filteredOrders.length;
    const completedOrders = filteredOrders.filter(order => order.status === 'delivered').length;
    const pendingOrders = filteredOrders.filter(order => order.status === 'pending').length;
    const cancelledOrders = filteredOrders.filter(order => order.status === 'cancelled').length;
    
    const conversionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
    const averageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;
    
    // Daily sales data for the last 7 days
    const dailySales = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayOrders = filteredOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === date.toDateString() && order.status === 'delivered';
      });
      const dayRevenue = dayOrders.reduce((sum, order) => sum + order.totalPrice, 0);
      dailySales.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: dayRevenue,
        orders: dayOrders.length
      });
    }
    
    // Top products
    const productSales: Record<string, { quantity: number; revenue: number }> = {};
    filteredOrders.forEach(order => {
      if (order.status === 'delivered') {
        if (!productSales[order.productId]) {
          productSales[order.productId] = { quantity: 0, revenue: 0 };
        }
        productSales[order.productId].quantity += order.quantity;
        productSales[order.productId].revenue += order.totalPrice;
      }
    });
    
    const topProducts = Object.entries(productSales)
      .map(([productId, data]) => {
        const product = products.find(p => p.id === productId);
        return {
          id: productId,
          name: product?.name || 'Unknown Product',
          ...data
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      totalRevenue,
      totalOrders,
      completedOrders,
      pendingOrders,
      cancelledOrders,
      conversionRate,
      averageOrderValue,
      dailySales,
      topProducts
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const analytics = getAnalytics();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 gap-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Back to Dashboard</span>
              </button>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Analytics</h1>
            </div>
            
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base w-full sm:w-auto"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-full">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">৳{analytics.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-full">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{analytics.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="bg-purple-100 p-2 rounded-full">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{analytics.conversionRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="bg-orange-100 p-2 rounded-full">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">৳{analytics.averageOrderValue.toFixed(0)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Daily Sales Chart */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Daily Sales (Last 7 Days)</h3>
            <div className="space-y-3 sm:space-y-4">
              {analytics.dailySales.map((day, index) => (
                <div key={index} className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 xs:gap-0">
                  <span className="text-xs sm:text-sm text-gray-600 w-16">{day.date}</span>
                  <div className="flex flex-1 flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full">
                    <span className="text-xs sm:text-sm font-medium min-w-[70px]">৳{day.revenue}</span>
                    <div className="w-full sm:w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
  width: `${Math.max((day.revenue / Math.max(...analytics.dailySales.map(d => d.revenue))) * 100, 5)}%`
}}

                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 min-w-[70px]">{day.orders} orders</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Top Products</h3>
            <div className="space-y-3 sm:space-y-4">
              {analytics.topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3 truncate">
                    <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-bold flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">{product.name}</span>
                  </div>
                  <div className="text-right min-w-[90px]">
                    <p className="text-xs sm:text-sm font-semibold text-gray-900">৳{product.revenue.toLocaleString()}</p>
                    <p className="text-2xs sm:text-xs text-gray-500">{product.quantity} sold</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="mt-6 sm:mt-8 bg-white p-4 sm:p-6 rounded-lg shadow">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Order Status Breakdown</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg">
              <div className="text-lg sm:text-2xl font-bold text-green-600">{analytics.completedOrders}</div>
              <div className="text-xs sm:text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-yellow-50 rounded-lg">
              <div className="text-lg sm:text-2xl font-bold text-yellow-600">{analytics.pendingOrders}</div>
              <div className="text-xs sm:text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-red-50 rounded-lg">
              <div className="text-lg sm:text-2xl font-bold text-red-600">{analytics.cancelledOrders}</div>
              <div className="text-xs sm:text-sm text-gray-600">Cancelled</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-blue-50 rounded-lg">
              <div className="text-lg sm:text-2xl font-bold text-blue-600">{analytics.totalOrders}</div>
              <div className="text-xs sm:text-sm text-gray-600">Total</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;