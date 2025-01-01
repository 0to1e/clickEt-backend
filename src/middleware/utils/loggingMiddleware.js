import { logger } from "../../utils/loggerUtils.js"; // Import the logger utility

const loggingMiddleware = (req, res, next) => {
  const startTime = Date.now();

  const originalSend = res.send;

  res.send = (body) => {
    const responseTime = Date.now() - startTime;

    const logData = {
      requestType: req.method,
      endpoint: req.originalUrl,
      payload: req.body,
      responseTime,
      statusCode: res.statusCode,
      message: body,
    };

    if (res.statusCode >= 400) {
      logger.error('Error response', logData);
    } else {
      logger.info('Successful response', logData);
    }
    originalSend.call(res, body);
  };
  next();
};

export default loggingMiddleware;
