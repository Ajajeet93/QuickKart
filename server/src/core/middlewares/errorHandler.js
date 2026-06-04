const logger = require('../logger/logger');
const { AppError } = require('../errors/AppError');

const isProduction = process.env.NODE_ENV === 'production';

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    
    // Default to 500 if no status code is set
    error.statusCode = err.statusCode || 500;
    error.status = err.status || 'error';

    // ── Mongoose Validation Error ──────────────────────────────
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map((val) => val.message).join(', ');
        error = new AppError(`Invalid input data: ${message}`, 400);
    }

    // ── Mongoose Duplicate Key Error ───────────────────────────
    if (err.code === 11000) {
        const value = err.errmsg ? err.errmsg.match(/(["'])(\\?.)*?\1/)[0] : 'Duplicate field value';
        const message = `${value} already exists. Please use another value.`;
        error = new AppError(message, 400);
    }

    // ── Mongoose Bad ObjectId Error ────────────────────────────
    if (err.name === 'CastError') {
        const message = `Invalid ${err.path}: ${err.value}.`;
        error = new AppError(message, 400);
    }

    // ── JWT Errors ─────────────────────────────────────────────
    if (err.name === 'JsonWebTokenError') {
        error = new AppError('Invalid token. Please log in again.', 401);
    }
    if (err.name === 'TokenExpiredError') {
        error = new AppError('Your token has expired! Please log in again.', 401);
    }

    // Log the error centrally
    if (error.statusCode >= 500) {
        logger.error(`[INTERNAL SERVER ERROR] ${err.message}`, { stack: err.stack, path: req.path, method: req.method });
    } else {
        logger.warn(`[${error.statusCode}] ${error.message}`, { path: req.path, method: req.method });
    }

    // Send response
    if (isProduction) {
        // Operational, trusted error: send message to client
        if (error.isOperational) {
            res.status(error.statusCode).json({
                success: false,
                status: error.status,
                message: error.message,
            });
        } 
        // Programming or other unknown error: don't leak error details
        else {
            res.status(500).json({
                success: false,
                status: 'error',
                message: 'Something went very wrong!',
            });
        }
    } else {
        // Development: send detailed error info
        res.status(error.statusCode).json({
            success: false,
            status: error.status,
            message: error.message,
            error: err,
            stack: err.stack,
        });
    }
};

module.exports = errorHandler;
