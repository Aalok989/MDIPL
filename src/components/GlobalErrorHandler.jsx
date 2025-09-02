import React, { useState, useEffect } from 'react';
import { FiWifi, FiWifiOff, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

const GlobalErrorHandler = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [apiErrors, setApiErrors] = useState([]);
  const [showErrorBanner, setShowErrorBanner] = useState(false);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Global error handler for unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Check if it's an API error
      if (event.reason && (
        event.reason.message?.includes('HTTP') ||
        event.reason.message?.includes('fetch') ||
        event.reason.message?.includes('network')
      )) {
        setApiErrors(prev => [...prev, {
          id: Date.now(),
          message: event.reason.message || 'Network error occurred',
          timestamp: new Date()
        }]);
        setShowErrorBanner(true);
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Auto-hide error banner after 10 seconds
  useEffect(() => {
    if (showErrorBanner) {
      const timer = setTimeout(() => {
        setShowErrorBanner(false);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [showErrorBanner]);

  const dismissError = (errorId) => {
    setApiErrors(prev => prev.filter(error => error.id !== errorId));
    if (apiErrors.length <= 1) {
      setShowErrorBanner(false);
    }
  };

  const dismissAllErrors = () => {
    setApiErrors([]);
    setShowErrorBanner(false);
  };

  const retryConnection = () => {
    window.location.reload();
  };

  return (
    <>
      {/* Offline Banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <FiWifiOff className="w-5 h-5" />
            <span className="font-medium">You're currently offline. Some features may not work properly.</span>
          </div>
        </div>
      )}

      {/* API Error Banner */}
      {showErrorBanner && apiErrors.length > 0 && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-orange-600 text-white p-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiAlertCircle className="w-5 h-5" />
              <span className="font-medium">
                {apiErrors.length === 1 
                  ? 'API Error: ' + apiErrors[0].message
                  : `${apiErrors.length} API errors occurred`
                }
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={retryConnection}
                className="flex items-center gap-1 px-3 py-1 bg-orange-700 hover:bg-orange-800 rounded text-sm transition-colors"
              >
                <FiRefreshCw className="w-4 h-4" />
                Retry
              </button>
              <button
                onClick={dismissAllErrors}
                className="px-3 py-1 bg-orange-700 hover:bg-orange-800 rounded text-sm transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Online Status Indicator */}
      {isOnline && (
        <div className="fixed bottom-4 right-4 z-40">
          <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg">
            <FiWifi className="w-5 h-5" />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={!isOnline ? 'pt-12' : ''}>
        {children}
      </div>
    </>
  );
};

export default GlobalErrorHandler;
