import axios from 'axios';
import API_URL_CONFIG from './config';

const api = axios.create({
    baseURL: API_URL_CONFIG,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

// ── Store injection ───────────────────────────────────────────────
let _store;
export const injectStore = (store) => { _store = store; };

// ── Refresh queue ─────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error) => {
    failedQueue.forEach(({ resolve, reject }) => error ? reject(error) : resolve());
    failedQueue = [];
};

// ── Response Interceptor ──────────────────────────────────────────
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        const isRefreshUrl = originalRequest.url?.includes('/api/auth/refresh');
        const isLogoutUrl  = originalRequest.url?.includes('/logout');

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !isRefreshUrl &&
            !isLogoutUrl
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => api(originalRequest))
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await api.post('/api/auth/refresh');
                processQueue(null);
                isRefreshing = false;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError);
                isRefreshing = false;

                if (_store) {
                    import('./store/authSlice').then(({ logoutUser }) => {
                        _store.dispatch(logoutUser());
                    });
                }

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
