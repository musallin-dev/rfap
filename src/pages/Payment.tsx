import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, CreditCard } from 'lucide-react';
import { uploadToImgBB } from '../services/imgbbService';
import { createOrder } from '../services/firebaseService';

const Payment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState<any>(null);
  const [paymentData, setPaymentData] = useState({
    senderNumber: '',
    screenshot: null as File | null
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const savedOrderData = localStorage.getItem('orderData');
    if (savedOrderData) {
      setOrderData(JSON.parse(savedOrderData));
    } else {
      navigate('/');
    }
  }, [navigate]);

  const securityCharge = orderData ? 150 * orderData.quantity : 150;
  const deliveryCharge = 110; // Updated delivery charge

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentData(prev => ({ ...prev, screenshot: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentData.screenshot) {
      alert('পেমেন্ট স্ক্রিনশট আপলোড করুন');
      return;
    }

    setSubmitting(true);

    try {
      // Upload screenshot to ImgBB
      setUploading(true);
      const screenshotUrl = await uploadToImgBB(paymentData.screenshot);
      setUploading(false);

      // Create order
      const orderId = await createOrder({
        productId: orderData.productId,
        customerName: orderData.name,
        phone: orderData.phone,
        address: orderData.address,
        quantity: orderData.quantity,
        extraFields: {
          deliveryNote: orderData.deliveryNote,
          jerseyName: orderData.jerseyName,
          jerseyNumber: orderData.jerseyNumber
        },
        addons: orderData.addons?.map((name: string) => ({ name, price: 0 })) || [],
        totalPrice: orderData.totalPrice,
        securityCharge,
        paymentScreenshot: screenshotUrl,
        senderNumber: paymentData.senderNumber,
        status: 'pending'
      });

      // Clear order data from localStorage
      localStorage.removeItem('orderData');
      
      // Navigate to success page
      navigate(`/success/${orderId}`);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('অর্ডার তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">অগ্রিম পেমেন্ট</h1>
          
          {/* Payment Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-3">
              <CreditCard className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  পেমেন্ট নির্দেশনা
                </h3>
                <p className="text-blue-700 mb-4">
                  আপনার অর্ডার কনফার্ম করতে ৳{securityCharge} সিকিউরিটি চার্জ পরিশোধ করুন।
                </p>
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-gray-600 mb-2">বিকাশ পার্সোনাল নম্বর:</p>
                  <p className="text-2xl font-bold text-gray-800">০১৭৯৮২৬৯১৪৭</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Send Money করুন এবং স্ক্রিনশট আপলোড করুন
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">অর্ডার সারসংক্ষেপ</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>পণ্যের মূল্য:</span>
                <span>৳{orderData.totalPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>পরিমাণ:</span>
                <span>{orderData.quantity}</span>
              </div>
              <div className="flex justify-between text-green-600 font-semibold">
                <span>সিকিউরিটি চার্জ:</span>
                <span>৳{securityCharge}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-bold">
                <span>বাকি মূল্য (ডেলিভারিতে):</span>
                <span className="text-red-600">৳{orderData.totalPrice - securityCharge + deliveryCharge}</span>
              </div>
              <p className="text-sm text-gray-500">* ডেলিভারি চার্জ {deliveryCharge} টাকা যোগ হবে</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                পেমেন্ট স্ক্রিনশট আপলোড করুন *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                {paymentData.screenshot ? (
                  <div>
                    <img
                      src={URL.createObjectURL(paymentData.screenshot)}
                      alt="Payment Screenshot"
                      className="max-w-full h-48 object-contain mx-auto mb-4"
                    />
                    <p className="text-green-600 font-medium">{paymentData.screenshot.name}</p>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">স্ক্রিনশট আপলোড করুন</p>
                    <p className="text-sm text-gray-500">JPG, PNG ফাইল সাপোর্ট করে</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="screenshot"
                />
                <label
                  htmlFor="screenshot"
                  className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-green-700 transition-colors mt-4"
                >
                  ফাইল নির্বাচন করুন
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                পেমেন্ট পাঠানো নম্বর *
              </label>
              <input
                type="tel"
                value={paymentData.senderNumber}
                onChange={(e) => setPaymentData(prev => ({ ...prev, senderNumber: e.target.value }))}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="যে নম্বর থেকে পেমেন্ট পাঠিয়েছেন"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || uploading}
              className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>{uploading ? 'আপলোড হচ্ছে...' : 'অর্ডার তৈরি হচ্ছে...'}</span>
                </span>
              ) : (
                'অর্ডার কনফার্ম করুন'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Payment;