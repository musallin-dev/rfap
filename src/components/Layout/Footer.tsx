import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">RFaP</h3>
            <p className="text-gray-300">
              রাহেলা ফ্যাশন এন্ড প্রিন্টিং - আপনার পছন্দের কাস্টম পোশাক এবং প্রিন্টিং সেবা।
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">যোগাযোগ</h4>
            <div className="space-y-2">
              <a 
                href="https://wa.me/8801643274896"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>+880 1643-274896</span>
              </a>
              <p className="text-gray-300">বিকাশ: ০১৭৯৮২৬৯১৪৭</p>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">সেবা সমূহ</h4>
            <ul className="space-y-2 text-gray-300">
              <li>কাস্টম জার্সি</li>
              <li>টি-শার্ট প্রিন্টিং</li>
              <li>ইউনিফর্ম তৈরি</li>
              <li>লোগো ডিজাইন</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-gray-300">
          <p>&copy; ২০২৫ RFaP. সকল অধিকার সংরক্ষিত।</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;