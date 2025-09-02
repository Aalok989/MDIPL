import React from 'react';
import { FiWifiOff, FiRefreshCw, FiAlertTriangle, FiHome } from 'react-icons/fi';

const NetworkErrorFallback = ({ error, onRetry, onGoHome }) => {
  const isNetworkError = error?.message?.includes('network') || 
                        error?.message?.includes('fetch') ||
                        error?.message?.includes('HTTP');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
        {/* Error Icon */}
        <div className="mx-auto w-20 h-20 mb-6">
          {isNetworkError ? (
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <FiWifiOff className="w-10 h-10 text-red-600" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
              <FiAlertTriangle className="w-10 h-10 text-orange-600" />
            </div>
          )}
        </div>

        {/* Error Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          {isNetworkError ? 'Connection Problem' : 'Service Unavailable'}
        </h1>

        {/* Error Description */}
        <p className="text-gray-600 mb-6">
          {isNetworkError 
            ? "We're having trouble connecting to our servers. Please check your internet connection and try again."
            : "Our services are temporarily unavailable. We're working to resolve this issue as quickly as possible."
          }
        </p>

        {/* Error Details */}
        {error && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Error Details:</h3>
            <p className="text-sm text-gray-600 font-mono">
              {error.message || 'Unknown error occurred'}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onRetry}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 font-medium"
          >
            <FiRefreshCw className="w-5 h-5" />
            Try Again
          </button>
          <button
            onClick={onGoHome}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 font-medium"
          >
            <FiHome className="w-5 h-5" />
            Go Home
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            {isNetworkError 
              ? "If the problem persists, please check your internet connection or contact your network administrator."
              : "If this issue continues, please contact our support team or try again in a few minutes."
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default NetworkErrorFallback;
