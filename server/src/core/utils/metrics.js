/**
 * server/utils/metrics.js — Prometheus Metrics
 * INT377 DevOps Project — Phase 7: Prometheus
 *
 * Exposes application and Node.js system metrics in Prometheus text format.
 * Scraped by Prometheus every 10 seconds via GET /metrics.
 *
 * Metrics exposed:
 *   quickkart_http_requests_total       → Counter (method, route, status_code)
 *   quickkart_http_request_duration_*   → Histogram (latency buckets 0.01–5s)
 *   Default Node.js metrics             → heap, CPU, event loop lag, GC
 */

const client = require('prom-client');

// ── Registry with prefix ──────────────────────────────────────────────────
// All custom metrics are prefixed with 'quickkart_' for easy filtering in Grafana
const register = new client.Registry();
register.setDefaultLabels({ app: 'quickkart' });

// ── Default Node.js system metrics ────────────────────────────────────────
// Automatically collects: heap size, CPU usage, event loop lag, GC stats, file descriptors
client.collectDefaultMetrics({
    register,
    prefix: 'quickkart_nodejs_',
    gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
});

// ── HTTP Request Counter ───────────────────────────────────────────────────
// Tracks total number of HTTP requests by method, route, and status code
// Used in Grafana: HTTP Request Rate panel
const httpRequestsTotal = new client.Counter({
    name: 'quickkart_http_requests_total',
    help: 'Total number of HTTP requests processed by the QuickKart API',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register],
});

// ── HTTP Request Duration Histogram ───────────────────────────────────────
// Measures response time distribution — used for P50 and P95 latency panels
// Buckets: 10ms, 50ms, 100ms, 200ms, 500ms, 1s, 2s, 5s
const httpRequestDurationSeconds = new client.Histogram({
    name: 'quickkart_http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds (histogram with latency buckets)',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 5],
    registers: [register],
});

// ── Active Connections Gauge ───────────────────────────────────────────────
const activeConnections = new client.Gauge({
    name: 'quickkart_active_connections',
    help: 'Number of currently active HTTP connections',
    registers: [register],
});

// ── Express Middleware ─────────────────────────────────────────────────────
// Records metrics for every request when the response finishes
// Route is normalized to prevent high cardinality (e.g. /orders/123 → /orders/:id)
const metricsMiddleware = (req, res, next) => {
    activeConnections.inc();
    const end = httpRequestDurationSeconds.startTimer();

    res.on('finish', () => {
        activeConnections.dec();

        // Normalize route to avoid cardinality explosion
        // /api/v1/products/507f1f77bcf86cd799439011 → /api/v1/products/:id
        const route = req.route
            ? req.baseUrl + req.route.path
            : req.path.replace(/\/[a-f0-9]{24}/g, '/:id').replace(/\/\d+/g, '/:id');

        const labels = {
            method: req.method,
            route: route || req.path,
            status_code: res.statusCode,
        };

        httpRequestsTotal.inc(labels);
        end(labels);
    });

    next();
};

module.exports = {
    register,
    metricsMiddleware,
    httpRequestsTotal,
    httpRequestDurationSeconds,
    activeConnections,
};
