// ============================================================================
// errorHandler.js — Express Error Handling Middleware
// Owner: Member 1 (Backend Lead)
// When to build: Day 1
// ============================================================================
//
// PURPOSE:
//   Centralized error handler that catches all unhandled errors from routes
//   and controllers, and returns a consistent JSON error response.
//
// WHAT TO BUILD:
//
//   1. module.exports = (err, req, res, next) => { ... }
//      - Log the error: console.error(`❌ ${err.message}`, err.stack)
//      - Determine status code:
//        - err.statusCode || 500
//      - Return consistent error response:
//        res.status(statusCode).json({
//          success: false,
//          message: err.message || 'Internal Server Error',
//          error: process.env.NODE_ENV === 'development' ? err.stack : undefined
//        })
//
//   2. Optionally, create a custom AppError class:
//      class AppError extends Error {
//        constructor(message, statusCode) {
//          super(message);
//          this.statusCode = statusCode;
//        }
//      }
//      - Use in controllers: throw new AppError('Ward not found', 404);
//
// USAGE:
//   In server.js, mount AFTER all routes:
//     app.use(errorHandler);
//
//   In controllers, wrap async functions:
//     try { ... } catch (err) { next(err); }
//
// ============================================================================
