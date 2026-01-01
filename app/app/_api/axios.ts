import axios from "axios";

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
    timeout: 10000,
    headers: {'Content-Type': 'application/json'}
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor to add JWT token to all requests
axiosInstance.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle 401 errors and refresh tokens
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Skip token refresh for login and signup endpoints
        const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || 
                               originalRequest.url?.includes('/auth/signup');

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axiosInstance(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

            if (!refreshToken) {
                // No refresh token, logout
                isRefreshing = false;
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }

            try {
                // Try to refresh the token
                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/auth/refresh`,
                    { refresh_token: refreshToken }
                );

                if (response.data.ok && response.data.data?.access_token) {
                    const newAccessToken = response.data.data.access_token;
                    
                    // Store new access token
                    localStorage.setItem('token', newAccessToken);
                    
                    // Update authorization header
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                    
                    // Process queued requests
                    processQueue(null, newAccessToken);
                    
                    isRefreshing = false;
                    
                    // Retry original request
                    return axiosInstance(originalRequest);
                } else {
                    throw new Error('Token refresh failed');
                }
            } catch (refreshError) {
                // Refresh failed, logout
                processQueue(refreshError, null);
                isRefreshing = false;
                
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/login';
                }
                
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;