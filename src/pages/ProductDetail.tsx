import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShoppingCart, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { Product, getProduct } from '../services/firebaseService';
import classNames from 'classnames';

// Simple skeleton without watermark
const SkeletonItem: React.FC<{ className?: string }> = ({ className }) => (
  <div className={classNames('bg-gray-200 animate-pulse rounded-md', className)} />
);

interface FAQ {
  question: string;
  answer: string;
  open: boolean;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (id) {
        const productData = await getProduct(id);
        setProduct(productData);
        // initialize FAQ from product or fallback
        const initialFaqs: FAQ[] = [
          { question: 'কত দিনে প্রোডাক্ট পাবো?', answer: 'সাধারণত ৩-৫ কার্যদিবসের মধ্যে প্রোডাক্ট তৈরি হয়ে যায়। ডেলিভরির জন্য অতিরিক্ত ১-২ দিন লাগতে পারে।', open: false },
          { question: 'পেমেন্ট কিভাবে করব?', answer: 'অর্ডার কনফার্ম করতে ১৫০ টাকা সিকিউরিটি চার্জ অগ্রিম দিতে হবে। বাকি টাকা ডেলিভরির সময় পরিশোধ করবেন।', open: false },
          { question: 'কাস্টম ডিজাইন করা যাবে?', answer: 'হ্যাঁ, আপনার পছন্দ অনুযায়ী যেকোনো ডিজাইন, নাম এবং নাম্বার প্রিন্ট করা যাবে।', open: false }
        ];
        setFaqs(initialFaqs);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  const toggleFaq = (index: number) => {
    setFaqs((prev) =>
      prev.map((faq, i) =>
        i === index ? { ...faq, open: !faq.open } : faq
      )
    );
  };

  const nextImage = () => {
    if (product) {
      setCurrentImageIndex((prev) =>
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (product) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md space-y-4">
          <SkeletonItem className="h-64 w-full" />
          <SkeletonItem className="h-6 w-3/4 mx-auto" />
          <SkeletonItem className="h-8 w-1/2 mx-auto" />
          <div className="flex space-x-2">
            {[...Array(3)].map((_, idx) => (
              <SkeletonItem key={idx} className="h-4 flex-1" />
            ))}
          </div>
          <SkeletonItem className="h-4 w-full" />
          <SkeletonItem className="h-4 w-full" />
          <SkeletonItem className="h-4 w-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">প্রোডাক্ট পাওয়া যায়নি</h2>
          <p className="text-gray-600 mb-6">দুঃখিত, এই আইডির কোন প্রোডাক্ট খুঁজে পাওয়া যায়নি।</p>
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
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Media Section with watermark */}
          <div className="relative">
            {showVideo && product.video ? (
              <div className="aspect-video bg-black">
                <video controls className="w-full h-full" src={product.video} onEnded={() => setShowVideo(false)}>
                  আপনার ব্রাউজার ভিডিও সাপোর্ট করে না।
                </video>
              </div>
            ) : (
              <div className="aspect-video bg-gray-200 relative overflow-hidden">
                {/* Watermark Overlay */}
                <span className="absolute inset-0 flex items-center justify-center text-6xl font-extrabold text-white opacity-30 pointer-events-none select-none" style={{ textShadow: '0 0 10px rgba(0,0,0,0.5)' }}>
                  RFaP
                </span>
                <img src={product.images[currentImageIndex]} alt={product.name} className="w-full h-full object-cover" />

                {/* Navigation Arrows */}
                {product.images.length > 1 && (
                  <> 
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Video Play Button */}
                {product.video && !showVideo && (
                  <button
                    onClick={() => setShowVideo(true)}
                    className="absolute top-4 right-4 bg-red-600 text-white p-3 rounded-full hover:bg-red-700 transition-colors shadow-lg"
                  >
                    <Play className="w-6 h-6 fill-current" />
                  </button>
                )}
              </div>
            )}

            {/* Image Pagination */}
            {product.images.length > 1 && !showVideo && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {product.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={classNames('w-3 h-3 rounded-full transition-colors', index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50')}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>
            <div className="flex items-center justify-between mb-6">
              <span className="text-3xl font-bold text-green-600">৳{product.price}</span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">স্টক: {product.stock}</span>
            </div>

            <button
              onClick={() => navigate(`/order/${product.id}`)}
              className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 mb-8"
            >
              <ShoppingCart className="w-6 h-6" />
              <span>অর্ডার করুন</span>
            </button>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">বিবরণ</h2>
              <div className="prose prose-lg max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>

            {/* FAQ Section */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">সাধারণ প্রশ্ন</h2>
              <div className="space-y-2">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full flex items-center justify-between p-4 focus:outline-none"
                    >
                      <span className="font-semibold text-gray-800">{faq.question}</span>
                      {faq.open ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
                    </button>
                    {faq.open && (
                      <div className="p-4 pt-0 text-gray-600">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
