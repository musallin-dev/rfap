import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Download, MessageCircle, X } from 'lucide-react';
import { Order, getOrder, Product, getProduct } from '../services/firebaseService';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Helper component for information rows
const InfoRow = ({ 
  label, 
  value,
  highlight = false
}: { 
  label: string; 
  value: string | number | React.ReactNode; 
  highlight?: boolean;
}) => (
  <div className="flex items-center py-1">
    <span className={`text-gray-600 font-medium w-1/3 ${highlight ? 'text-orange-700' : ''}`}>
      {label}:
    </span>
    <span className={`ml-2 flex-1 ${highlight ? 'font-semibold text-orange-800' : 'text-gray-800'}`}>
      {value}
    </span>
  </div>
);

// Helper component for table rows
const TableRow = ({ 
  label, 
  value,
  highlight = false
}: { 
  label: string; 
  value: string; 
  highlight?: boolean;
}) => (
  <tr className={highlight ? 'bg-green-50' : ''}>
    <td className={`py-3 px-6 ${highlight ? 'text-green-800 font-semibold' : 'text-gray-700'}`}>
      {label}
    </td>
    <td className={`py-3 px-6 text-right ${highlight ? 'text-green-800 font-semibold' : 'text-gray-700'}`}>
      {value}
    </td>
  </tr>
);

const Success: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    const fetchOrderData = async () => {
      if (orderId) {
        const orderData = await getOrder(orderId);
        setOrder(orderData);
        
        if (orderData) {
          const productData = await getProduct(orderData.productId);
          setProduct(productData);
        }
      }
      setLoading(false);
      
      // Trigger success animation after data loads
      setTimeout(() => setShowAnimation(true), 500);
    };

    fetchOrderData();
  }, [orderId]);

 const downloadReceipt = async () => {
  const element = document.getElementById('receipt');
  if (!element) return;

  try {
    // Create a clone of the receipt element
    const clone = element.cloneNode(true) as HTMLElement;
    clone.id = 'receipt-clone';
    
    // Set fixed dimensions for A4 (210mm x 297mm)
    clone.style.width = '210mm';
    clone.style.minHeight = '297mm';
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.style.visibility = 'visible';
    clone.style.backgroundColor = 'white';
    clone.style.boxSizing = 'border-box';
    clone.style.padding = '15mm';
    clone.style.overflow = 'hidden';
    
    // Remove decorative styles
    clone.style.boxShadow = 'none';
    clone.style.borderRadius = '0';
    clone.style.border = 'none';
    
    document.body.appendChild(clone);

    const canvas = await html2canvas(clone, {
      scale: 3, // Higher scale for better quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    // Remove clone after capture
    document.body.removeChild(clone);

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(
      canvas.toDataURL('image/png'), 
      'PNG', 
      0, 
      position,
      imgWidth, 
      imgHeight
    );
    heightLeft -= 297; // Subtract A4 height (297mm)

    // Add remaining pages if content is taller than one page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(
        canvas.toDataURL('image/png'), 
        'PNG', 
        0, 
        position,
        imgWidth, 
        imgHeight
      );
      heightLeft -= 297;
    }

    // Add page numbers
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.text(
        `Page ${i} of ${pageCount}`,
        210 - 20,
        297 - 10
      );
    }

    pdf.save(`receipt-${orderId}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('রসিদ ডাউনলোড করতে সমস্যা হয়েছে');
  }
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

  if (!order || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">অর্ডার পাওয়া যায়নি</h2>
          <Link
            to="/"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            হোমে ফিরে যান
          </Link>
        </div>
      </div>
    );
  }

  const deliveryCharge = 110; // Updated delivery charge
  const remainingAmount = order.totalPrice + deliveryCharge - order.securityCharge;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Enhanced Success Message with Animation */}
        <div className="text-center mb-8">
          <div className={`relative inline-block transition-all duration-1000 ${showAnimation ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
            <div className="relative">
              <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
              {/* Animated rings */}
              <div className={`absolute inset-0 rounded-full border-4 border-green-300 ${showAnimation ? 'animate-ping' : ''}`}></div>
              <div className={`absolute inset-2 rounded-full border-2 border-green-400 ${showAnimation ? 'animate-pulse' : ''}`}></div>
            </div>
          </div>
          
          <div className={`transition-all duration-1000 delay-300 ${showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <h1 className="text-4xl font-bold text-gray-800 mb-3">অর্ডার সফল! 🎉</h1>
            <p className="text-lg text-gray-600 mb-2">আপনার অর্ডার সফলভাবে তৈরি হয়েছে।</p>
            <p className="text-green-600 font-semibold">আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।</p>
          </div>
        </div>

        {/* Animated Action Buttons */}
        <div className={`flex flex-wrap justify-center gap-4 mb-8 transition-all duration-1000 delay-500 ${showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <button
            onClick={downloadReceipt}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Download className="w-5 h-5" />
            <span>রসিদ ডাউনলোড</span>
          </button>
          
          <a
            href="https://wa.me/8801643274896"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <MessageCircle className="w-5 h-5" />
            <span>সাপোর্ট</span>
          </a>
          
          <button
            onClick={() => alert('অর্ডার বাতিল করতে সাপোর্টে যোগাযোগ করুন')}
            className="flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <X className="w-5 h-5" />
            <span>অর্ডার বাতিল</span>
          </button>
        </div>

        {/* Enhanced Receipt with Animation */}
        <div className={`transition-all duration-1000 delay-700 ${showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div id="receipt" className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
            {/* Receipt Header */}
            <div className="bg-gradient-to-r from-green-700 to-blue-700 p-8 text-center relative">
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-white font-semibold">রসিদ</span>
              </div>
              
              <div className="mb-6">
                <h2 className="text-4xl font-bold text-white mb-2">রাহেলা ফ্যাশন এন্ড প্রিন্টিং</h2>
                <p className="text-blue-100 text-lg">অর্ডার রসিদ</p>
              </div>
              
              <div className="inline-block bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/30">
                <p className="font-mono text-xl font-bold text-white tracking-wider">
                  অর্ডার ID: {order.id}
                </p>
              </div>
              
              <div className="absolute bottom-4 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
            </div>

            {/* Receipt Body */}
            <div className="p-8">
              {/* Customer and Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                {/* Customer Card */}
                <div className="border border-gray-200 rounded-xl p-6 relative">
                  <div className="absolute -top-3 left-4 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    গ্রাহক তথ্য
                  </div>
                  <div className="space-y-4 mt-3">
                    <InfoRow label="নাম" value={order.customerName} />
                    <InfoRow label="ফোন" value={order.phone} />
                    <InfoRow label="ঠিকানা" value={order.address} />
                  </div>
                </div>
                
                {/* Order Card */}
                <div className="border border-gray-200 rounded-xl p-6 relative">
                  <div className="absolute -top-3 left-4 bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    অর্ডার তথ্য
                  </div>
                  <div className="space-y-4 mt-3">
                    <InfoRow label="পণ্য" value={product.name} />
                    <InfoRow label="পরিমাণ" value={order.quantity} />
                    <InfoRow 
                      label="তারিখ" 
                      value={new Date(order.createdAt).toLocaleDateString('bn-BD', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })} 
                    />
                    <div className="flex items-center">
                      <span className="text-gray-600 font-medium w-1/3">স্ট্যাটাস:</span>
                      <span className="ml-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                        {order.status === 'pending' ? 'অপেক্ষমান' : order.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Extra Fields */}
              {order.extraFields && (
                <div className="mb-10">
                  <div className="border border-orange-200 bg-orange-50 rounded-xl p-6 relative">
                    <div className="absolute -top-3 left-4 bg-orange-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      বিশেষ নির্দেশনা
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {order.extraFields.jerseyName && (
                        <InfoRow 
                          label="জার্সি নাম" 
                          value={order.extraFields.jerseyName} 
                          highlight 
                        />
                      )}
                      {order.extraFields.jerseyNumber && (
                        <InfoRow 
                          label="জার্সি নাম্বার" 
                          value={order.extraFields.jerseyNumber} 
                          highlight 
                        />
                      )}
                      {order.extraFields.deliveryNote && (
                        <div className="md:col-span-2">
                          <InfoRow 
                            label="ডেলিভারি নোট" 
                            value={order.extraFields.deliveryNote} 
                            highlight 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Details */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <div className="w-3 h-3 bg-purple-600 rounded-full mr-3"></div>
                  পেমেন্ট বিবরণ
                </h3>
                
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-purple-50">
                        <th className="text-left py-4 px-6 font-medium text-purple-800">বিবরণ</th>
                        <th className="text-right py-4 px-6 font-medium text-purple-800">পরিমাণ</th>
                      </tr>
                    </thead>
                    <tbody>
                      <TableRow 
                        label={`পণ্যের মূল্য (${order.quantity} x ৳${product.price})`} 
                        value={`৳${product.price * order.quantity}`}
                      />
                      
                      {order.addons && order.addons.map((addon, index) => (
                        <TableRow 
                          key={index}
                          label={addon.name}
                          value={`৳${addon.price * order.quantity}`}
                        />
                      ))}
                      
                      <TableRow 
                        label="ডেলিভারি চার্জ"
                        value={`৳${deliveryCharge}`}
                      />
                      
                      <tr className="border-t border-gray-200">
                        <td className="py-3 px-6 font-semibold text-gray-700">মোট</td>
                        <td className="py-3 px-6 text-right font-semibold text-gray-700">
                          ৳{order.totalPrice + deliveryCharge}
                        </td>
                      </tr>
                      
                      <TableRow 
                        label="অগ্রিম পেমেন্ট"
                        value={`-৳${order.securityCharge}`}
                        highlight
                      />
                    </tbody>
                  </table>
                  
                  <div className="bg-red-50 border-t-4 border-red-500 p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-lg font-bold text-red-800">বাকি মূল্য (ডেলিভারিতে):</p>
                        <p className="text-sm text-red-600 mt-1">ডেলিভারির সময় পরিশোধ করতে হবে</p>
                      </div>
                      <p className="text-3xl font-bold text-red-700">৳{remainingAmount}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Note */}
              <div className="border-l-4 border-yellow-500 bg-yellow-50 rounded-r-lg p-5">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800">
                      <strong className="font-medium">গুরুত্বপূর্ণ:</strong> ডেলিভারি নেওয়ার সময় বাকি <span className="font-semibold">৳{remainingAmount}</span> টাকা পরিশোধ করতে হবে। কোন সমস্যা হলে আমাদের সাপোর্টে যোগাযোগ করুন।
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Receipt Footer */}
            <div className="bg-gray-50 border-t border-gray-200 p-6 text-center">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <p className="text-gray-600 mb-2 sm:mb-0">
                  <span className="font-medium">ইস্যুর তারিখ:</span> {new Date().toLocaleDateString('bn-BD')}
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 border-2 border-dashed rounded-xl" />
                  <p className="ml-3 text-gray-600 italic">স্বাক্ষর</p>
                </div>
              </div>
              <p className="mt-4 text-gray-500 text-sm">
                এই রসিদটি স্বয়ংক্রিয়ভাবে জেনারেট করা হয়েছে • © {new Date().getFullYear()} রাহেলা ফ্যাশন এন্ড প্রিন্টিং
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Tracking Section */}
        <div className={`transition-all duration-1000 delay-900 ${showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="bg-white rounded-xl shadow-2xl p-8 border-t-4 border-blue-600 mt-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <div className="w-3 h-3 bg-blue-600 rounded-full mr-3"></div>
              অর্ডার ট্র্যাকিং
            </h3>
            <div className="space-y-6">
              {order.trackingSteps?.map((step, index) => (
                <div key={index} className="flex items-center space-x-6">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    step.completed ? 'bg-green-600' : 'bg-gray-300'
                  }`}>
                    {step.completed && <CheckCircle className="w-4 h-4 text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold text-lg ${
                      step.completed ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.step}
                    </p>
                    {step.date && step.completed && (
                      <p className="text-sm text-gray-500 mt-1">{step.date}</p>
                    )}
                  </div>
                  {step.completed && (
                    <div className="text-green-600">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                  )}
                </div>
              ))}
            </div> 
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success;