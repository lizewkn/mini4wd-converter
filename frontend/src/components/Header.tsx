import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M4</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mini 4WD Converter</h1>
              <p className="text-gray-600">Convert files for Tamiya Mini 4WD parts</p>
            </div>
          </div>
          
          <nav className="hidden md:flex space-x-6">
            <a href="/docs" className="text-gray-600 hover:text-blue-600 transition-colors">
              Documentation
            </a>
            <a href="/manual" className="text-gray-600 hover:text-blue-600 transition-colors">
              User Manual
            </a>
            <a href="https://github.com/lizewkn/mini4wd-converter" className="text-gray-600 hover:text-blue-600 transition-colors">
              GitHub
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;