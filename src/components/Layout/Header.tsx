import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Phone } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <ShoppingBag className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-800">RFaP</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-green-600 transition-colors">
              হোম
            </Link>
            <a 
              href="https://wa.me/8801643274896"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>সাপোর্ট</span>
            </a>
          </nav>

          <div className="md:hidden">
            <a 
              href="https://wa.me/8801643274896"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600"
            >
              <Phone className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;