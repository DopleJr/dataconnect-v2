import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Database, Home, Package } from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-blue-700' : '';
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Database className="h-6 w-6" />
            <span className="font-bold text-xl">DataConnect</span>
          </div>
          
          <div className="flex space-x-1">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center ${isActive('/')}`}
            >
              <Home className="h-4 w-4 mr-1" />
              Dashboard
            </Link>
            <Link 
              to="/products" 
              className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center ${isActive('/products')}`}
            >
              <Package className="h-4 w-4 mr-1" />
              Products
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;