import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Users,
  Calendar,
  BarChart3,
  Award,
  Medal,
  Trophy
} from 'lucide-react';
import { getAllOrders, getAllProducts, Order, Product } from '../../services/firebaseService';

const AdminAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days
  const [isAnimating, setIsAnimating] = useState(false);

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

  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIsAnimating(true);
    setDateRange(e.target.value);
    setTimeout(() => setIsAnimating(false), 500);
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
    const maxRevenue = Math.max(...[1, ...filteredOrders
      .filter(o => o.status === 'delivered')
      .map(o => o.totalPrice)]);
    
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
        orders: dayOrders.length,
        heightPercentage: Math.max(10, (dayRevenue / maxRevenue) * 100)
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full animate-ping"></div>
            </div>
          </div>
          <p className="text-gray-600 font-medium">Crunching analytics...</p>
        </div>
      </div>
    );
  }

  const analytics = getAnalytics();

  // Medal icons for top 3 products
  const getMedalIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-4 h-4 text-yellow-500" />;
    if (index === 1) return <Award className="w-4 h-4 text-gray-400" />;
    if (index === 2) return <Medal className="w-4 h-4 text-amber-700" />;
    return <span className="text-xs font-bold ml-1">{index + 1}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Floating header */}
      <header className="sticky top-0 z-10 bg-white shadow-md rounded-b-xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </button>
            
            <h1 className="text-xl font-bold text-gray-900 flex-1 text-center">Analytics</h1>
            
            <div className="flex items-center space-x-2 bg-indigo-50 px-3 py-1.5 rounded-full">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <select
                value={dateRange}
                onChange={handleDateChange}
                className="bg-transparent text-indigo-700 font-medium text-sm focus:outline-none appearance-none"
              >
                <option value="7">7D</option>
                <option value="30">30D</option>
                <option value="90">90D</option>
                <option value="365">1Y</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className={`max-w-7xl mx-auto px-4 py-6 transition-opacity duration-300 ${isAnimating ? 'opacity-50' : 'opacity-100'}`}>
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-4 rounded-2xl shadow-lg transform transition-transform hover:scale-[1.02]">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-full">
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium opacity-80">Total Revenue</p>
                <p className="text-lg font-bold">৳{analytics.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white p-4 rounded-2xl shadow-lg transform transition-transform hover:scale-[1.02]">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-full">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium opacity-80">Total Orders</p>
                <p className="text-lg font-bold">{analytics.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-4 rounded-2xl shadow-lg transform transition-transform hover:scale-[1.02]">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-full">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium opacity-80">Conversion</p>
                <p className="text-lg font-bold">{analytics.conversionRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-4 rounded-2xl shadow-lg transform transition-transform hover:scale-[1.02]">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-full">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium opacity-80">Avg. Order</p>
                <p className="text-lg font-bold">৳{analytics.averageOrderValue.toFixed(0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Sales Chart */}
        <div className="bg-white p-5 rounded-2xl shadow-sm mb-6 transform transition-transform hover:scale-[1.01]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">Daily Sales</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              Last 7 days
            </span>
          </div>
          
          <div className="flex items-end justify-between h-40 gap-2">
            {analytics.dailySales.map((day, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center flex-1"
              >
                <div className="relative flex flex-col items-center group">
                  <div 
                    className="w-full bg-gradient-to-t from-indigo-400 to-indigo-600 rounded-t-lg transition-all duration-500 ease-out"
                    style={{ height: `${day.heightPercentage}%` }}
                  >
                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      ৳{day.revenue} • {day.orders} orders
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-500 mt-2">{day.date}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="bg-white p-5 rounded-2xl shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Top Products</h3>
            <div className="space-y-3">
              {analytics.topProducts.map((product, index) => (
                <div 
                  key={product.id} 
                  className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex-shrink-0">
                    {getMedalIcon(index)}
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.quantity} sold</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">৳{product.revenue.toLocaleString()}</p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div 
                        className="bg-indigo-600 h-1.5 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${Math.min(100, (product.revenue / analytics.topProducts[0].revenue) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Status Breakdown */}
          <div className="bg-white p-5 rounded-2xl shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Order Status</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-green-100 to-green-50 p-4 rounded-xl border border-green-100">
                <div className="text-2xl font-bold text-green-800">{analytics.completedOrders}</div>
                <div className="text-sm text-green-700 flex items-center mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Completed
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-100 to-amber-50 p-4 rounded-xl border border-yellow-100">
                <div className="text-2xl font-bold text-amber-800">{analytics.pendingOrders}</div>
                <div className="text-sm text-amber-700 flex items-center mt-1">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                  Pending
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-red-100 to-rose-50 p-4 rounded-xl border border-red-100">
                <div className="text-2xl font-bold text-red-800">{analytics.cancelledOrders}</div>
                <div className="text-sm text-red-700 flex items-center mt-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  Cancelled
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-100 to-cyan-50 p-4 rounded-xl border border-blue-100">
                <div className="text-2xl font-bold text-blue-800">{analytics.totalOrders}</div>
                <div className="text-sm text-blue-700 flex items-center mt-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Total
                </div>
              </div>
            </div>
            
            <div className="mt-4 relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block text-gray-600">
                    Completion Rate
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-green-600">
                    {analytics.conversionRate.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-200">
                <div 
                  style={{ width: `${analytics.conversionRate}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-green-400 to-emerald-600 transition-all duration-1000 ease-out"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;