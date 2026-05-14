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
/**
 * Token refresh flow:
 * 1. Any request → 401 (access token expired)
 * 2. Interceptor → POST /api/v1/admin/refresh
 * 3. Server rotates refresh token → issues new access_token cookie
 * 4. Interceptor retries original request
 * 5. If refresh also fails → dispatch logoutUser() to clear local state
 *
 * Logout is a PUBLIC route (no auth needed) so calling it after a
 * failed refresh will not itself cause another 401.
 */
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Skip interceptor for:
        // - requests already retried
        // - the refresh endpoint itself (prevent infinite loop)
        // - the logout endpoint (it's public, no point retrying)
        const url = originalRequest.url || '';
        const isRefreshUrl = url.includes('/api/v1/admin/refresh');
        const isLogoutUrl  = url.includes('/api/v1/admin/logout');
        const isLoginUrl   = url.includes('/api/v1/admin/login');

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !isRefreshUrl &&
            !isLogoutUrl &&
            !isLoginUrl
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
                await api.post('/api/v1/admin/refresh');
                processQueue(null);
                isRefreshing = false;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError);
                isRefreshing = false;

                // Refresh token expired/revoked — clear local auth state.
                // logoutUser() is imported lazily to avoid circular imports.
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
