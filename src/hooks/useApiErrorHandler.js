import { useState, useCallback } from 'react';

export const useApiErrorHandler = () => {
  const [errors, setErrors] = useState([]);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleError = useCallback((error, context = '') => {
    console.error(`API Error in ${context}:`, error);
    
    const errorInfo = {
      id: Date.now(),
      message: error.message || 'An unexpected error occurred',
      context,
      timestamp: new Date(),
      type: getErrorType(error)
    };

    setErrors(prev => [...prev, errorInfo]);
    
    // Auto-remove error after 30 seconds
    setTimeout(() => {
      setErrors(prev => prev.filter(e => e.id !== errorInfo.id));
    }, 30000);

    return errorInfo;
  }, []);

  const retryOperation = useCallback(async (operation, maxRetries = 3) => {
    setIsRetrying(true);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        setIsRetrying(false);
        return result;
      } catch (error) {
        if (attempt === maxRetries) {
          setIsRetrying(false);
          throw error;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const clearError = useCallback((errorId) => {
    setErrors(prev => prev.filter(e => e.id !== errorId));
  }, []);

  return {
    errors,
    isRetrying,
    handleError,
    retryOperation,
    clearErrors,
    clearError
  };
};

const getErrorType = (error) => {
  if (error.message?.includes('network') || error.message?.includes('fetch')) {
    return 'network';
  }
  if (error.message?.includes('HTTP 5')) {
    return 'server';
  }
  if (error.message?.includes('HTTP 4')) {
    return 'client';
  }
  return 'unknown';
};
