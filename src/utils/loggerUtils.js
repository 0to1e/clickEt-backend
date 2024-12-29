import morgan from 'morgan';
import winston from 'winston';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';

// Create a write stream for logging HTTP requests to a file
const accessLogStream = fs.createWriteStream(path.join(path.resolve(), 'access.log'), { flags: 'a' });

// Create a Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' })
  ],
});

// Middleware to log HTTP requests with payload, status, and response time
app.use(bodyParser.json()); // to parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // to parse URL-encoded bodies

// Morgan Middleware to log HTTP requests
app.use(morgan('tiny', { stream: accessLogStream }));

// Custom logging middleware
app.use((req, res, next) => {
  const start = Date.now(); // Capture the start time

  // Store original res.send function
  const originalSend = res.send;

  res.send = function (body) {
    const responseTime = Date.now() - start; // Calculate response time
    const logMessage = {
      request: `${req.method} ${req.originalUrl}`,
      payload: req.method === 'POST' || req.method === 'PUT' ? req.body : null, // Log payload for POST/PUT
      code: res.statusCode,
      message: res.statusCode >= 200 && res.statusCode < 300 ? 'Success' : 'Error',
      responseTime: `${responseTime}ms`
    };

    // Log the structured message using Winston
    logger.info(JSON.stringify(logMessage));

    // Call the original send function
    originalSend.call(res, body);
  };

  next(); // Continue to the next middleware or route
});

// Example route
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Simulating login logic
  if (username === 'admin' && password === 'password123') {
    res.status(200).send({ message: 'Login successful' });
  } else {
    res.status(401).send({ message: 'Invalid credentials' });
  }
});

// Start the server
app.listen(3000, () => {
  logger.info('Server is running on port 3000');
});
