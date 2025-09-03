// API Configuration
export const API_CONFIG = {
  // Base URL for all API endpoints
  // Use proxy in development, actual API in production
  BASE_URL: import.meta.env.DEV ? '' : 'https://mdiplreport.iitea.xyz',
  
  // Fallback CORS proxy (use only if needed)
  CORS_PROXY: 'https://cors-anywhere.herokuapp.com/',
  
  // API endpoints
  ENDPOINTS: {
    KPIS: '/api/kpis',
    MONTHLY_SPEND_TREND: '/api/plot-monthly-spend-trend',
    YEARLY_SPEND_PERFORMANCE: '/api/plot-yearly-spend-performance',
    TOP_15_VENDORS: '/api/plot-top-15-vendors',
    TOP_5_VENDOR_TRENDS: '/api/plot-top-5-vendor-trends',
    PROJECT_SPEND_VS_TARGETS: '/api/plot-project-spend-vs-targets',
    PROJECT_SPEND_PERFORMANCE: '/api/plot-project-spend-performance',
    SPEND_SEASONALITY: '/api/plot-spend-seasonality-patterns',
    TOP_10_PROJECTS: '/api/plot-top-10-projects-by-spend',
    VENDOR_SPEND_DISTRIBUTION: '/api/plot-vendor-spend-distribution',
    TOP_VENDORS_BY_AVERAGE_SPEND: '/api/plot-top-vendors-by-average-spend',
    CUMULATIVE_SPEND_GROWTH: '/api/plot-cumulative-spend-growth',
    SPEND_AMOUNT_DISTRIBUTION: '/api/plot-spend-amount-distribution',
    PROJECTS_PER_MONTH_AREA: '/api/plot_projects_per_month_area',
    TOTAL_SALES_PER_MONTH: '/api/chart_monthly_sales',
    TOP_SUPPLIERS: '/api/chart_top_suppliers',
    TOP_CUSTOMERS: '/api/chart_top_customers',
    PROJECT_PROFITABILITY: '/api/chart_project_profitability',
    CUSTOMER_HEALTH: '/api/chart_customer_health',
    CUSTOMER_LOYALTY: '/api/chart_customer_loyalty',
    PROJECT_EFFICIENCY: '/api/chart_project_efficiency',
    REVENUE_FORECAST: '/api/chart_revenue_forecast',
    VALUE_CHAIN: '/api/value_chain',
    RISK_ANALYSIS: '/api/risk_analysis',
    PROJECT_CLUSTERS: '/api/project_clusters',
    CUSTOMER_VALUE_MATRIX: '/api/chart_customer_value_matrix',
    DEAL_SIZE_DISTRIBUTION: '/api/chart_deal_size_distribution',
    SUCCESS_BLUEPRINT: '/api/chart_success_blueprint',
    GEOSPATIAL_ANALYSIS: '/api/geospatial_analysis',
    WEEKLY_SALES:'/api/chart_day_of_week_sales',
    AVAILABLE_DATE_RANGE: '/api/available_date_range',
  }

};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint) => {
  // In development, use relative URLs for proxy
  // In production, use full URLs
  if (import.meta.env.DEV) {
    return endpoint; // This will be proxied through Vite
  }
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get endpoint by key
export const getApiEndpoint = (key) => {
  return API_CONFIG.ENDPOINTS[key] || key;
};

// Helper function to build full URL by endpoint key
export const getApiUrl = (endpointKey) => {
  const endpoint = getApiEndpoint(endpointKey);
  return buildApiUrl(endpoint);
};

// Helper function to make API requests with proper CORS handling
export const apiRequest = async (endpointKey, options = {}, useCorsProxy = false) => {
  let url = getApiUrl(endpointKey);
  
  // Add cache-busting parameter to avoid cached CORS errors
  const timestamp = Date.now();
  const separator = url.includes('?') ? '&' : '?';
  url = `${url}${separator}_t=${timestamp}`;
  
  // Use CORS proxy if explicitly requested
  if (useCorsProxy) {
    url = `${API_CONFIG.CORS_PROXY}${url}`;
  }
  
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    },
    mode: 'cors', // Enable CORS
    credentials: 'omit', // Don't send cookies
    ...options
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      const errorMessage = `HTTP error! status: ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.endpoint = endpointKey;
      throw error;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpointKey}:`, error);
    
    // Enhance error with more context
    if (!error.endpoint) {
      error.endpoint = endpointKey;
    }
    if (!error.status && error.message?.includes('fetch')) {
      error.status = 'NETWORK_ERROR';
    }
    
    // Try different fallback strategies
    if (!useCorsProxy) {
      // Strategy 1: Try with CORS proxy
      if (!import.meta.env.DEV) {
        return apiRequest(endpointKey, options, true);
      }
      
      // Strategy 2: Try direct API call with no-cors mode
      try {
        const directUrl = `https://mdiplreport.iitea.xyz${getApiEndpoint(endpointKey)}`;
        
        const directResponse = await fetch(directUrl, {
          ...defaultOptions,
          mode: 'no-cors'
        });
        
        if (directResponse.type === 'opaque') {
          // For no-cors, we can't read the response, so we'll need to handle this differently
          throw new Error('No-cors mode not suitable for this API');
        }
        
        return await directResponse.json();
      } catch (directError) {
        // Direct API call failed, continue to next strategy
      }
      
      // Strategy 3: Try with different CORS proxy
      try {
        const altProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://mdiplreport.iitea.xyz${getApiEndpoint(endpointKey)}`)}`;
        
        const proxyResponse = await fetch(altProxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        });
        
        if (proxyResponse.ok) {
          return await proxyResponse.json();
        }
      } catch (proxyError) {
        // Alternative proxy also failed
      }
    }
    
    throw error;
  }
};
