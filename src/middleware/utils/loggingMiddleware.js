import { logger } from "../../utils/loggerUtils.js"; // Import the logger utility

const loggingMiddleware = (req, res, next) => {
  // Capture the start time of the request
  const startTime = Date.now();

  // Keep a reference to the original res.send method
  const originalSend = res.send;

  // Wrap res.send to log after the response is sent
  res.send = (body) => {
    // Capture response time
    const responseTime = Date.now() - startTime;

    // Log success or error based on the response status code
    const logData = {
      requestType: req.method,
      endpoint: req.originalUrl,
      payload: req.body, // This captures the request body (payload)
      responseTime,
      statusCode: res.statusCode,
      message: body, // You can include the response body/message
    };

    // If the response code is in the error range (4xx, 5xx), log as error
    if (res.statusCode >= 400) {
      logger.error('Error response', logData);
    } else {
      // Log successful responses
      logger.info('Successful response', logData);
    }

    // Call the original res.send method to send the response
    originalSend.call(res, body);
  };

  // Continue to the next middleware/controller
  next();
};

export default loggingMiddleware;
