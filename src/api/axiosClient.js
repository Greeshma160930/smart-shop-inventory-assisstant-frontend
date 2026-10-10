import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request if available
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smartshop_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept 401 Unauthorized responses to logout and redirect
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect on login or register endpoints
      const url = error.config?.url || '';
      const isAuthUrl = url.includes('/auth/login') || url.includes('/auth/register');
      if (!isAuthUrl) {
        localStorage.removeItem('smartshop_token');
        localStorage.removeItem('smartshop_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Centralized error message extractor for user-friendly notifications
export const getErrorMessage = (error, defaultMessage = 'An unexpected error occurred.') => {
  if (!error) return defaultMessage;
  if (!error.response) {
    return 'Cannot connect to backend server (http://localhost:8080). Please ensure Spring Boot is running.';
  }
  if (error.response.status === 503) {
    return error.response.data?.message || 'Database service unavailable. Please check the Aiven Cloud MySQL connection.';
  }
  if (error.response.status === 401) {
    return error.response.data?.message || 'Session expired or invalid credentials. Please sign in again.';
  }
  if (error.response.status === 403) {
    return error.response.data?.message || 'Access denied. You do not have permission for this action.';
  }
  if (error.response.status === 409) {
    return error.response.data?.message || 'Conflict: Record with these details already exists.';
  }
  return error.response.data?.message || error.message || defaultMessage;
};

// Indian Number & Rupee Currency Formatter
// Example: 125000 -> ₹1,25,000.00
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0.00';
  }
  const numericAmount = Number(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
};

export const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }
  return new Intl.NumberFormat('en-IN').format(Number(num));
};

export default axiosClient;
