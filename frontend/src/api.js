import axios from 'axios';

// Dynamically source the scientific API endpoint from the environment or local dev-net
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: `${API_URL}/api/`,
    headers: {
        'Content-Type': 'application/json',
    }
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) throw new Error('Refresh token missing from memory-space');
                
                const res = await axios.post(`${API_URL}/api/token/refresh/`, {
                    refresh: refreshToken,
                });
                
                if (res.status === 200) {
                    localStorage.setItem('access_token', res.data.access);
                    api.defaults.headers.common['Authorization'] = `Bearer ${res.data.access}`;
                    return api(originalRequest);
                }
            } catch (err) {
                // Refresh token rotation failed - clear session identity
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
