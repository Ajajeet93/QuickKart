/**
 * Wrapper to catch unhandled async errors and pass them to the global Express error handler.
 * Replaces the need for try-catch blocks in every controller.
 */
const catchAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = catchAsync;
