import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

// ── Store injection (avoids circular dependency) ──────────────────
let _store;
export const injectStore = (store) => { _store = store; };

// ── Refresh token queue (handles concurrent 401s) ─────────────────
let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error) => {
    failedQueue.forEach(({ resolve, reject }) => error ? reject(error) : resolve());
    failedQueue = [];
};

// ── Response Interceptor ──────────────────────────────────────────
/**
 * Flow when access token is expired:
 * 1. Any request → 401
 * 2. Interceptor → POST /api/auth/refresh (sends refresh_token cookie automatically)
 * 3. Server verifies refresh token against DB → issues new access_token cookie
 * 4. Interceptor retries the original request
 * 5. If refresh also fails (token revoked/expired) → dispatch logoutUser()
 *
 * Concurrent requests: queued during refresh, all retried after success.
 */
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Only intercept 401s that aren't already retried
        // and aren't from the refresh / logout endpoints themselves
        const isRefreshUrl  = originalRequest.url?.includes('/api/auth/refresh');
        const isLogoutUrl   = originalRequest.url?.includes('/logout');

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !isRefreshUrl &&
            !isLogoutUrl
        ) {
            // If a refresh is already in progress, queue this request
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
                // Ask server to issue a new access_token using the refresh_token cookie
                await api.post('/api/auth/refresh');

                processQueue(null);
                isRefreshing = false;

                // Retry the original failed request with the new access token
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError);
                isRefreshing = false;

                // Refresh token is also expired or revoked — force logout
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
