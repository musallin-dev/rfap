import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Plus, Minus } from 'lucide-react';
import { Product, getProduct } from '../services/firebaseService';

interface JerseyDetails {
  name: string;
  number: string;
  size: string;
}

interface Addon {
  name: string;
  price: number;
}

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
    jerseyDetails: [{ name: '', number: '', size: '' }] as JerseyDetails[],
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

  useEffect(() => {
    const newJerseyDetails = Array.from({ length: formData.quantity }, (_, index) => 
      formData.jerseyDetails[index] || { name: '', number: '', size: '' }
    );
    setFormData(prev => ({ ...prev, jerseyDetails: newJerseyDetails }));
  }, [formData.quantity]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(1, formData.quantity + change);
    setFormData(prev => ({ ...prev, quantity: newQuantity }));
  };

  const handleJerseyDetailChange = (index: number, field: keyof JerseyDetails, value: string) => {
    setFormData(prev => ({
      ...prev,
      jerseyDetails: prev.jerseyDetails.map((detail, i) => 
        i === index ? { ...detail, [field]: value } : detail
      )
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
    
    if (!product) return;
    
    const addonsWithPrices = formData.addons.map(name => {
      const addon = product.addons?.find(a => a.name === name);
      return { name, price: addon?.price || 0 };
    });

    const orderData = {
      ...formData,
      addons: addonsWithPrices,
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
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-lg transition-colors"
                  disabled={formData.quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xl font-semibold text-gray-800 min-w-[3rem] text-center">
                  {formData.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                জার্সি বিবরণ (প্রতিটি জার্সির জন্য)
              </label>
              <div className="space-y-4">
                {formData.jerseyDetails.map((detail, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-3">জার্সি #{index + 1}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          নাম
                        </label>
                        <input
                          type="text"
                          value={detail.name}
                          onChange={(e) => handleJerseyDetailChange(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                          placeholder="জার্সিতে প্রিন্ট করার নাম"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          নাম্বার
                        </label>
                        <input
                          type="text"
                          value={detail.number}
                          onChange={(e) => handleJerseyDetailChange(index, 'number', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                          placeholder="নাম্বার"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          সাইজ
                        </label>
                        <select
                          value={detail.size}
                          onChange={(e) => handleJerseyDetailChange(index, 'size', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        >
                          <option value="">সাইজ নির্বাচন করুন</option>
                          <option value="XS">XS</option>
                          <option value="S">S</option>
                          <option value="M">M</option>
                          <option value="L">L</option>
                          <option value="XL">XL</option>
                          <option value="XXL">XXL</option>
                          <option value="XXXL">XXXL</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

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

            {product.addons && product.addons.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  অতিরিক্ত সেবা
                </label>
                <div className="space-y-3">
                  {product.addons.map((addon) => (
                    <label key={addon.name} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.addons.includes(addon.name)}
                          onChange={(e) => handleAddonChange(addon.name, e.target.checked)}
                          className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-gray-700">{addon.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-green-600 font-semibold">৳{addon.price} x {formData.quantity}</span>
                        <div className="text-sm text-gray-500">= ৳{addon.price * formData.quantity}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-green-50 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">পণ্যের মূল্য:</span>
                  <span className="text-gray-800">৳{product.price} x {formData.quantity} = ৳{product.price * formData.quantity}</span>
                </div>
                
                {product.addons && formData.addons.length > 0 && (
                  <div className="space-y-1">
                    {product.addons
                      .filter(addon => formData.addons.includes(addon.name))
                      .map(addon => (
                        <div key={addon.name} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">{addon.name}:</span>
                          <span className="text-gray-700">৳{addon.price} x {formData.quantity} = ৳{addon.price * formData.quantity}</span>
                        </div>
                      ))
                    }
                  </div>
                )}
                
                <hr className="border-green-200" />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">মোট মূল্য:</span>
                  <span className="text-2xl font-bold text-green-600">৳{calculateTotal()}</span>
                </div>
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