import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">M4</span>
              </div>
              <span className="font-bold text-gray-900">Mini 4WD Converter</span>
            </div>
            <p className="text-gray-600 mb-4">
              A complete web application for converting STL, CAD, SVG, JPG, and PNG files 
              for Tamiya Mini 4WD parts. Features multi-format upload, validation, and 
              real-time feedback.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com/lizewkn/mini4wd-converter" className="text-gray-400 hover:text-blue-600">
                <span className="sr-only">GitHub</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Features</h3>
            <ul className="space-y-2 text-gray-600">
              <li>Multi-format upload</li>
              <li>CAD/STL output</li>
              <li>Mini 4WD validation</li>
              <li>Drag-and-drop interface</li>
              <li>Real-time feedback</li>
              <li>Responsive design</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Resources</h3>
            <ul className="space-y-2 text-gray-600">
              <li>
                <a href="/docs" className="hover:text-blue-600 transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="/manual" className="hover:text-blue-600 transition-colors">
                  User Manual
                </a>
              </li>
              <li>
                <a href="https://tamiya.com/english/mini4wd/" className="hover:text-blue-600 transition-colors">
                  Official Tamiya
                </a>
              </li>
              <li>
                <a href="https://github.com/lizewkn/mini4wd-converter/issues" className="hover:text-blue-600 transition-colors">
                  Report Issues
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">
            © 2024 Mini 4WD Converter. Open source project.
          </p>
          <p className="text-gray-600 text-sm mt-2 md:mt-0">
            Built with React, TypeScript, and Python
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;