import React from 'react';
import { FiLoader } from 'react-icons/fi';

const LoadingScreen = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        {/* Loading Spinner */}
        <div className="mx-auto w-16 h-16 mb-6">
          <FiLoader className="w-16 h-16 text-blue-600 animate-spin" />
        </div>

        {/* Loading Message */}
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {message}
        </h2>
        
        {/* Subtitle */}
        <p className="text-gray-600">
          Please wait while we load your data...
        </p>

        {/* Loading Dots Animation */}
        <div className="flex justify-center mt-4">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
