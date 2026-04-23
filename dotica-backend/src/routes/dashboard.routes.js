// dashboard.routes.js
const express = require('express');
const r1 = express.Router();
const { getDashboard } = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');
r1.get('/', protect, getDashboard);
module.exports = r1;
