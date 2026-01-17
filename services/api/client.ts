import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';

// Access env variables if needed, e.g. process.env.EXPO_PUBLIC_API_URL
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://35ff507ce53d.ngrok-free.app/api/v1';

export const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request Interceptor
apiClient.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().accessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle global errors, e.g. 401 Unauthorized
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);
