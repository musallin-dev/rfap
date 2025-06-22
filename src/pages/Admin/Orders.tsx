import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock,
  Package,
  Truck,
  X,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Loader,
  LogOut,
  Users, // Added missing import
  Edit, // Added missing import
  DollarSign // Added missing import
} from 'lucide-react';
import { getAllOrders, updateOrder, deleteOrder, Order } from '../../services/firebaseService';

const AdminOrders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState<{key: keyof Order; direction: 'asc' | 'desc'} | null>(null);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin');
      return;
    }

    fetchOrders();
  }, [navigate]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter, sortConfig]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await getAllOrders();
      setOrders(ordersData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.phone && order.phone.includes(searchTerm)) ||
        (order.productId && order.productId.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Apply sorting
    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key]! < b[sortConfig.key]!) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key]! > b[sortConfig.key]!) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredOrders(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setIsUpdatingStatus(true);
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const updatedTrackingSteps = order.trackingSteps?.map((step, index) => {
        if (newStatus === 'pending') return index === 0 ? { ...step, completed: true, date: new Date().toLocaleDateString('bn-BD') } : step;
        if (newStatus === 'confirmed' && index <= 1) return { ...step, completed: true, date: new Date().toLocaleDateString('bn-BD') };
        if (newStatus === 'processing' && index <= 2) return { ...step, completed: true, date: new Date().toLocaleDateString('bn-BD') };
        if (newStatus === 'shipped' && index <= 3) return { ...step, completed: true, date: new Date().toLocaleDateString('bn-BD') };
        if (newStatus === 'delivered' && index <= 4) return { ...step, completed: true, date: new Date().toLocaleDateString('bn-BD') };
        if (newStatus === 'cancelled') return index === 0 ? { ...step, completed: true } : step;
        return step;
      });

      await updateOrder(orderId, { 
        status: newStatus as any,
        trackingSteps: updatedTrackingSteps
      });
      
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ 
          ...selectedOrder, 
          status: newStatus,
          trackingSteps: updatedTrackingSteps
        });
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('অর্ডার আপডেট করতে সমস্যা হয়েছে');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই অর্ডারটি মুছে ফেলতে চান?')) {
      try {
        await deleteOrder(orderId);
        fetchOrders();
        if (selectedOrder?.id === orderId) {
          setShowModal(false);
        }
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('অর্ডার মুছতে সমস্যা হয়েছে');
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <Package className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    navigate('/admin');
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const handleSort = (key: keyof Order) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
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
          <p className="text-gray-600 font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Floating Header */}
      <header className={`sticky top-0 z-20 bg-white shadow-md transition-all duration-300 ${isScrolled ? 'py-3' : 'py-5'} rounded-b-2xl`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline font-medium">Dashboard</span>
              </button>
              <h1 className="text-xl font-bold text-gray-900">Order Management</h1>
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
        {/* Filters Card */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Filter Orders</h2>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-1 text-indigo-600"
            >
              <span className="text-sm">{showFilters ? 'Hide' : 'Show'} Filters</span>
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <Filter className="w-5 h-5" />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none transition-all"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="bg-indigo-50 rounded-xl p-3 flex items-center justify-center">
                <span className="text-sm font-medium text-indigo-700">
                  Showing: <span className="font-bold">{filteredOrders.length}</span> orders
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center">
                      Order ID
                      {sortConfig?.key === 'id' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('totalPrice')}
                  >
                    <div className="flex items-center">
                      Amount
                      {sortConfig?.key === 'totalPrice' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center">
                      Date
                      {sortConfig?.key === 'createdAt' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center">
                      <div className="text-gray-500 flex flex-col items-center justify-center py-8">
                        <Package className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium">No orders found</p>
                        <p className="text-gray-500 mt-2">Try adjusting your search or filter</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((order) => (
                    <tr 
                      key={order.id} 
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                          #{order.id.substring(0, 8)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                            {order.customerName || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-[120px]">
                            {order.phone || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          ৳{order.totalPrice || '0'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowModal(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors p-1.5 rounded-lg hover:bg-indigo-50"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="text-red-600 hover:text-red-900 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                            title="Delete Order"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredOrders.length > itemsPerPage && (
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                <span className="font-medium">{Math.min(indexOfLastItem, filteredOrders.length)}</span> of{' '}
                <span className="font-medium">{filteredOrders.length}</span> orders
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1.5 rounded-lg border ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1.5 rounded-lg border ${currentPage === pageNum ? 'bg-indigo-600 text-white border-indigo-600' : 'hover:bg-gray-50'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1.5 rounded-lg border ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Detail Modal */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                  {/* Customer Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                    <h3 className="text-lg font-semibold mb-4 text-indigo-700 flex items-center">
                      <span className="bg-indigo-100 p-1.5 rounded-lg mr-2">
                        <Users className="w-5 h-5 text-indigo-600" />
                      </span>
                      Customer Information
                    </h3>
                    <div className="space-y-3 text-gray-700">
                      <p><span className="font-medium">Name:</span> {selectedOrder.customerName || 'N/A'}</p>
                      <p><span className="font-medium">Phone:</span> {selectedOrder.phone || 'N/A'}</p>
                      <p><span className="font-medium">Address:</span> {selectedOrder.address || 'N/A'}</p>
                      <p><span className="font-medium">Sender Number:</span> {selectedOrder.senderNumber || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Order Card */}
                  <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-xl p-5 border border-emerald-100">
                    <h3 className="text-lg font-semibold mb-4 text-emerald-700 flex items-center">
                      <span className="bg-emerald-100 p-1.5 rounded-lg mr-2">
                        <Package className="w-5 h-5 text-emerald-600" />
                      </span>
                      Order Information
                    </h3>
                    <div className="space-y-3 text-gray-700">
                      <p><span className="font-medium">Order ID:</span> {selectedOrder.id}</p>
                      <p><span className="font-medium">Product ID:</span> {selectedOrder.productId || 'N/A'}</p>
                      <p><span className="font-medium">Quantity:</span> {selectedOrder.quantity || '0'}</p>
                      <p><span className="font-medium">Total Price:</span> ৳{selectedOrder.totalPrice || '0'}</p>
                      <p><span className="font-medium">Security Charge:</span> ৳{selectedOrder.securityCharge || '0'}</p>
                      <p><span className="font-medium">Created At:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {selectedOrder.extraFields && (
                  <div className="mb-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100">
                    <h3 className="text-lg font-semibold mb-4 text-amber-700 flex items-center">
                      <span className="bg-amber-100 p-1.5 rounded-lg mr-2">
                        <Edit className="w-5 h-5 text-amber-600" />
                      </span>
                      Extra Information
                    </h3>
                    
                    {selectedOrder.extraFields.deliveryNote && (
                      <div className="mb-4">
                        <p className="font-medium">Delivery Note:</p>
                        <p className="bg-white p-3 rounded-lg mt-1 border border-amber-100">
                          {selectedOrder.extraFields.deliveryNote}
                        </p>
                      </div>
                    )}
                    
                    {selectedOrder.extraFields.jerseyDetails && selectedOrder.extraFields.jerseyDetails.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">Jersey Details:</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full border-collapse rounded-lg overflow-hidden">
                            <thead>
                              <tr className="bg-amber-100">
                                <th className="py-2 px-4 border border-amber-200 text-left text-amber-800">#</th>
                                <th className="py-2 px-4 border border-amber-200 text-left text-amber-800">Name</th>
                                <th className="py-2 px-4 border border-amber-200 text-left text-amber-800">Number</th>
                                <th className="py-2 px-4 border border-amber-200 text-left text-amber-800">Size</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedOrder.extraFields.jerseyDetails.map((detail, index) => (
                                <tr key={index} className="border-b border-amber-200 bg-white">
                                  <td className="py-2 px-4 border border-amber-200">{index + 1}</td>
                                  <td className="py-2 px-4 border border-amber-200">{detail.name || '-'}</td>
                                  <td className="py-2 px-4 border border-amber-200">{detail.number || '-'}</td>
                                  <td className="py-2 px-4 border border-amber-200">{detail.size || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedOrder.addons && selectedOrder.addons.length > 0 && (
                  <div className="mb-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-5 border border-purple-100">
                    <h3 className="text-lg font-semibold mb-4 text-purple-700 flex items-center">
                      <span className="bg-purple-100 p-1.5 rounded-lg mr-2">
                        <Package className="w-5 h-5 text-purple-600" />
                      </span>
                      Addons
                    </h3>
                    <ul className="space-y-2">
                      {selectedOrder.addons.map((addon, index) => (
                        <li 
                          key={index} 
                          className="flex justify-between items-center bg-white p-3 rounded-lg border border-purple-100"
                        >
                          <span>{addon.name}</span>
                          <span className="font-medium">
                            ৳{addon.price} × {selectedOrder.quantity} = ৳{addon.price * selectedOrder.quantity}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedOrder.paymentScreenshot && (
                  <div className="mb-6 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-5 border border-green-100">
                    <h3 className="text-lg font-semibold mb-4 text-green-700 flex items-center">
                      <span className="bg-green-100 p-1.5 rounded-lg mr-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </span>
                      Payment Screenshot
                    </h3>
                    <div className="flex justify-center">
                      <img
                        src={selectedOrder.paymentScreenshot}
                        alt="Payment Screenshot"
                        className="max-w-full rounded-lg border-2 border-dashed border-green-200 max-h-64"
                      />
                    </div>
                  </div>
                )}

                <div className="mb-6 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-5 border border-rose-100">
                  <h3 className="text-lg font-semibold mb-4 text-rose-700 flex items-center">
                    <span className="bg-rose-100 p-1.5 rounded-lg mr-2">
                      <Truck className="w-5 h-5 text-rose-600" />
                    </span>
                    Tracking Steps
                  </h3>
                  <div className="space-y-4">
                    {selectedOrder.trackingSteps?.map((step, index) => (
                      <div 
                        key={index} 
                        className={`flex items-start p-3 rounded-lg ${step.completed ? 'bg-white border border-green-200' : 'bg-gray-50'}`}
                      >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-1 ${
                          step.completed ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'
                        }`}>
                          {step.completed ? <CheckCircle className="w-4 h-4" /> : index + 1}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${step.completed ? 'text-green-600' : 'text-gray-600'}`}>
                            {step.step}
                          </p>
                          {step.date && (
                            <p className="text-sm text-gray-500 mt-1">Completed: {step.date}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">Update Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(selectedOrder.id, status)}
                        disabled={isUpdatingStatus}
                        className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center transition-all transform hover:-translate-y-0.5 ${
                          selectedOrder.status === status
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-white text-gray-700 shadow hover:shadow-md'
                        } ${isUpdatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {getStatusIcon(status)}
                        <span className="ml-1 capitalize">
                          {status}
                          {isUpdatingStatus && selectedOrder.status === status && (
                            <Loader className="ml-2 w-4 h-4 animate-spin" />
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;