/**
 * Minimal request logger to stdout.
 * Avoids logging sensitive data (headers/body).
 */
const logRequests = (req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
};

module.exports = { logRequests };
