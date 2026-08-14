// errorHandler.js – Express Error Handling Middleware


// Custom Error Class to easily throw errors with specific status codes in controllers
class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
    }
  }
  
  // The core error handling middleware function
  const errorHandler = (err, req, res, next) => {
    // 1. Log the error to the server console
    console.error(`❌ ${err.message}`, err.stack);
  
    // 2. Determine the status code (default to 500 Internal Server Error)
    const statusCode = err.statusCode || 500;
  
    // 3. Return a consistent JSON response
    res.status(statusCode).json({
      success: false,
      message: err.message || 'Internal Server Error',
      // Only send the stack trace if we are in development mode
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  };
  
  module.exports = {
    AppError,
    errorHandler
  };