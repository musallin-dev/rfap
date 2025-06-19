import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Product, getProduct } from '../services/firebaseService';

const OrderForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    quantity: 1,
    deliveryNote: '',
    jerseyName: '',
    jerseyNumber: '',
    addons: [] as string[]
  });

  useEffect(() => {
    const fetchProduct = async () => {
      if (id) {
        const productData = await getProduct(id);
        setProduct(productData);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddonChange = (addonName: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      addons: checked 
        ? [...prev.addons, addonName]
        : prev.addons.filter(addon => addon !== addonName)
    }));
  };

  const calculateTotal = () => {
    if (!product) return 0;
    
    let total = product.price * formData.quantity;
    
    if (product.addons) {
      product.addons.forEach(addon => {
        if (formData.addons.includes(addon.name)) {
          total += addon.price * formData.quantity;
        }
      });
    }
    
    return total;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const orderData = {
      ...formData,
      productId: id!,
      totalPrice: calculateTotal()
    };
    
    localStorage.setItem('orderData', JSON.stringify(orderData));
    navigate(`/payment/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">প্রোডাক্ট পাওয়া যায়নি</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            হোমে ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">অর্ডার ফর্ম</h1>
          
          {/* Product Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-8">
            <div className="flex items-center space-x-4">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div>
                <h3 className="font-semibold text-gray-800">{product.name}</h3>
                <p className="text-green-600 font-bold">৳{product.price}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                নাম *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="আপনার পূর্ণ নাম"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ফোন নম্বর *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="০১৭XXXXXXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ঠিকানা *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="সম্পূর্ণ ঠিকানা লিখুন"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                পরিমাণ *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="1"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Extra Fields */}
            {product.extraFields && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ডেলিভারি নোট
                  </label>
                  <input
                    type="text"
                    name="deliveryNote"
                    value={formData.deliveryNote}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="বিশেষ নির্দেশনা (যদি থাকে)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    জার্সি নাম
                  </label>
                  <input
                    type="text"
                    name="jerseyName"
                    value={formData.jerseyName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="জার্সিতে যে নাম প্রিন্ট করতে চান"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    জার্সি নাম্বার
                  </label>
                  <input
                    type="text"
                    name="jerseyNumber"
                    value={formData.jerseyNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="জার্সিতে যে নাম্বার প্রিন্ট করতে চান"
                  />
                </div>
              </>
            )}

            {/* Addons */}
            {product.addons && product.addons.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  অতিরিক্ত সেবা
                </label>
                <div className="space-y-3">
                  {product.addons.map((addon) => (
                    <label key={addon.name} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.addons.includes(addon.name)}
                        onChange={(e) => handleAddonChange(addon.name, e.target.checked)}
                        className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-gray-700">{addon.name}</span>
                      <span className="text-green-600 font-semibold">+৳{addon.price}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Total */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-800">মোট মূল্য:</span>
                <span className="text-2xl font-bold text-green-600">৳{calculateTotal()}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <span>পেমেন্ট পেজে যান</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;