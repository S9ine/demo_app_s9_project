import axios from 'axios';

// API Base URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000 // 10 seconds
});

// Request interceptor - Add JWT token to all requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle 401 Unauthorized - Token expired or invalid
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            // Redirect to login if not already there
            if (window.location.pathname !== '/') {
                window.location.href = '/';
            }
        }

        // Handle other errors
        const errorMessage = error.response?.data?.detail || error.message || 'เกิดข้อผิดพลาด';
        console.error('API Error:', errorMessage);

        return Promise.reject(error);
    }
);

export default api;
