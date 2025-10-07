/**
 * Centralized error handler.
 * - Logs server-side
 * - Sends structured JSON with optional stack in development
 */
const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || 'Something went wrong!';

  // Avoid dumping full req; log minimal context
  console.error(`[Error] ${req.method} ${req.originalUrl} -> ${status}:`, err.stack || err);

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {}),
  });
};

module.exports = { errorHandler };
