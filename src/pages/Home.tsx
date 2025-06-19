import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, Truck, Shield } from 'lucide-react';

const Home: React.FC = () => {
  const [productId, setProductId] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (productId.trim()) {
      navigate(`/products/${productId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 to-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            রাহেলা ফ্যাশন এন্ড প্রিন্টিং
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-green-100">
            আপনার পছন্দের কাস্টম পোশাক এবং প্রিন্টিং সেবা
          </p>
          
          <div className="max-w-md mx-auto bg-white rounded-lg p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              প্রোডাক্ট খুঁজুন
            </h2>
            <p className="text-gray-600 mb-4">
              কোন প্রোডাক্ট নির্বাচিত নেই। প্রোডাক্ট দেখতে বা ট্র্যাক করতে প্রোডাক্ট আইডি দিন।
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  placeholder="প্রোডাক্ট আইডি লিখুন (যেমন: p1)"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                প্রোডাক্ট দেখুন
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            কেন আমাদের বেছে নিবেন?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <Package className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-800">উচ্চ মানের প্রোডাক্ট</h3>
              <p className="text-gray-600">
                আমরা শুধুমাত্র সর্বোচ্চ মানের কাপড় এবং প্রিন্টিং ম্যাটেরিয়াল ব্যবহার করি।
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <Truck className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-800">দ্রুত ডেলিভারি</h3>
              <p className="text-gray-600">
                সারা বাংলাদেশে দ্রুত এবং নিরাপদ ডেলিভারি সেবা।
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <Shield className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-800">নিরাপদ পেমেন্ট</h3>
              <p className="text-gray-600">
                অ্যাডভান্স পেমেন্ট সিস্টেমের মাধ্যমে নিরাপদ লেনদেন।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            আমাদের প্রোডাক্ট সমূহ
          </h2>
          
          <div className="text-center">
            <div className="inline-block bg-green-100 px-6 py-3 rounded-lg mb-4">
              <p className="text-green-800 font-medium">
                ডেমো প্রোডাক্ট দেখতে ID ব্যবহার করুন: <span className="font-bold">p1</span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;