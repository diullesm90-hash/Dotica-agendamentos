const express = require('express');
const router  = express.Router();
const { getReport } = require('../controllers/report.controller');
const { protect }   = require('../middleware/auth.middleware');
router.get('/', protect, getReport);
module.exports = router;
