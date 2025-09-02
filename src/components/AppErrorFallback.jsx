import React from 'react';
import { FiAlertTriangle, FiRefreshCw, FiHome, FiWifiOff } from 'react-icons/fi';

const AppErrorFallback = ({ error, resetError }) => {
  const isNetworkError = error?.message?.includes('network') || 
                        error?.message?.includes('fetch') ||
                        error?.message?.includes('Failed to fetch');

  const isServerError = error?.status >= 500 || 
                       error?.message?.includes('HTTP 5');

  const handleRetry = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
        {/* Error Icon */}
        <div className="mx-auto w-16 h-16 mb-6">
          {isNetworkError ? (
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <FiWifiOff className="w-8 h-8 text-red-600" />
            </div>
          ) : isServerError ? (
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <FiAlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          ) : (
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <FiAlertTriangle className="w-8 h-8 text-blue-600" />
            </div>
          )}
        </div>

        {/* Error Title */}
        <h1 className="text-xl font-bold text-gray-900 mb-3">
          {isNetworkError 
            ? 'Connection Problem' 
            : isServerError 
            ? 'Service Unavailable'
            : 'Something Went Wrong'
          }
        </h1>

        {/* Error Description */}
        <p className="text-gray-600 mb-6">
          {isNetworkError 
            ? "Please check your internet connection and try again."
            : isServerError
            ? "Our servers are temporarily unavailable. Please try again later."
            : "An unexpected error occurred. Please try again."
          }
        </p>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Error Details:</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Time:</span>
                <span className="text-gray-800 font-mono">{new Date().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Error ID:</span>
                <span className="text-gray-800 font-mono">{Date.now().toString(36)}</span>
              </div>
              {error.status && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Status:</span>
                  <span className="text-gray-800 font-mono">{error.status}</span>
                </div>
              )}
              {error.endpoint && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Endpoint:</span>
                  <span className="text-gray-800 font-mono text-right max-w-32 truncate">{error.endpoint}</span>
                </div>
              )}
              <div className="pt-2 border-t border-gray-300">
                <span className="font-medium text-gray-600 block mb-1">Message:</span>
                <p className="text-gray-800 font-mono text-xs break-all">{error.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleRetry}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <FiRefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <button
            onClick={handleGoHome}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            <FiHome className="w-4 h-4" />
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppErrorFallback;
