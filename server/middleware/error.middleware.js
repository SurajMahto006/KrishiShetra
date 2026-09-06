/**
 * KRISHISHETRA — CENTRAL BACKEND ERROR MIDDLEWARE
 * 
 * Provides:
 * 1. apiNotFoundHandler: Catches unmatched /api/* requests and returns standardized JSON
 * 2. apiErrorHandler: Central 4-argument Express error handler
 *    - Catches SyntaxError (malformed JSON), CastError/ValidationError, Auth errors, CORS errors
 *    - Sanitizes internal stack traces and server file paths
 *    - Standard JSON format: { success: false, error: { type, message, status } }
 *    - Safe server diagnostics logging with credentials redacted
 */

const SENSITIVE_KEYS = ['password', 'token', 'authorization', 'secret', 'apikey', 'api_key', 'cookie', 'aadhaar', 'bankaccount'];

function sanitizeLogData(data) {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(sanitizeLogData);
  const copy = {};
  for (const [k, v] of Object.entries(data)) {
    const lk = k.toLowerCase().replace(/[-_]/g, '');
    if (SENSITIVE_KEYS.some(sk => lk.includes(sk))) {
      copy[k] = '[REDACTED]';
    } else if (typeof v === 'object' && v !== null) {
      copy[k] = sanitizeLogData(v);
    } else {
      copy[k] = v;
    }
  }
  return copy;
}

/**
 * 404 Catch-all for API endpoints
 */
function apiNotFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    error: {
      type: 'HTTP_ERROR',
      message: `API endpoint not found: ${req.method} ${req.originalUrl || req.url}`,
      status: 404
    }
  });
}

/**
 * Central Express Error Handler
 */
function apiErrorHandler(err, req, res, next) {
  let status = err.status || err.statusCode || 500;
  let errorType = 'HTTP_ERROR';
  let message = err.message || 'An unexpected server error occurred';

  // Handle JSON parse errors from express.json()
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    status = 400;
    errorType = 'VALIDATION_ERROR';
    message = 'Invalid JSON in request body';
  } else if (err.name === 'ValidationError') {
    status = 400;
    errorType = 'VALIDATION_ERROR';
    message = err.message || 'Validation failed for request data';
  } else if (err.name === 'CastError') {
    status = 400;
    errorType = 'VALIDATION_ERROR';
    message = `Invalid format for field: ${err.path || 'parameter'}`;
  } else if (err.name === 'UnauthorizedError' || status === 401) {
    status = 401;
    errorType = 'AUTH_ERROR';
    message = message || 'Authentication required';
  } else if (status === 403) {
    errorType = 'PERMISSION_ERROR';
    message = message || 'Access denied';
  } else if (status === 404) {
    errorType = 'HTTP_ERROR';
  }

  // Safe server logging with timing and path
  const sanitizedParams = sanitizeLogData(req.query);
  const sanitizedBody = sanitizeLogData(req.body);

  console.error(`[KrishiShetra][SERVER_ERROR] ${req.method} ${req.originalUrl || req.url} [${status}] - ${message}`);
  if (process.env.DEBUG_MODE === 'true' && err.stack) {
    console.error(`[KrishiShetra][SERVER_STACK]`, err.stack);
  }

  // Always return consistent, safe JSON for API requests
  const responsePayload = {
    success: false,
    error: {
      type: errorType,
      message: status >= 500 && process.env.NODE_ENV === 'production'
        ? 'Internal server error. Please try again later.'
        : message,
      status: status
    }
  };

  if (process.env.NODE_ENV !== 'production' && err.stack && process.env.DEBUG_MODE === 'true') {
    responsePayload.error.details = err.stack.split('\n').slice(0, 3).map(s => s.trim());
  }

  res.status(status).json(responsePayload);
}

module.exports = {
  apiNotFoundHandler,
  apiErrorHandler,
  sanitizeLogData
};
