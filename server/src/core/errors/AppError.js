/**
 * AppError — base for all operational (known, expected) errors.
 *
 * SOLID: SRP — this class owns only the error shape contract.
 * OCP — extend with named subclasses, never modify base handling.
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

// ── HTTP 4xx errors ────────────────────────────────────────────────

class BadRequestError extends AppError {
    constructor(message = 'Bad Request') { super(message, 400); }
}

class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') { super(message, 401); }
}

class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') { super(message, 403); }
}

class NotFoundError extends AppError {
    constructor(message = 'Resource not found') { super(message, 404); }
}

class ConflictError extends AppError {
    constructor(message = 'Conflict') { super(message, 409); }
}

class UnprocessableError extends AppError {
    constructor(message = 'Unprocessable Entity') { super(message, 422); }
}

// ── HTTP 5xx errors ────────────────────────────────────────────────

class InternalServerError extends AppError {
    constructor(message = 'Internal Server Error') { super(message, 500); }
}

module.exports = {
    AppError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    UnprocessableError,
    InternalServerError,
};
