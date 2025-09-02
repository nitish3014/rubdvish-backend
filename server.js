const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    'https://rudvishinternational.com',
    'https://rudvish-international.vercel.app',
    'https://www.rudvishinternational.com',
    'http://localhost:5173',
    'http://localhost:8080'
  ],
  credentials: true
}));

// General middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// More strict rate limiting for contact endpoints
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // limit each IP to 5 contact submissions per hour
  message: 'Too many contact submissions, please try again later.'
});

app.get("/", (req, res) => {
  res.send(`
    <h1>🚀 Express App is Running!</h1>
    <p>Environment: ${process.env.NODE_ENV || "development"}</p>
    <p>Port: ${PORT}</p>
    <p>Check health endpoint: <a href="/api/health">/api/health</a></p>
  `);
});

// Routes
app.use('/api/contact', contactLimiter, require('./routes/contact'));
app.use('/api/bulk-inquiry', contactLimiter, require('./routes/bulk-inquiry'));


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;