const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();

// Segurança
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logs
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Limite API
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
}));

// API Health
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Frontend
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

module.exports = app;