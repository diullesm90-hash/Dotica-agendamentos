const express = require('express');
const router  = express.Router();
const { getSettings, updateSettings } = require('../controllers/settings.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');
router.get('/',         protect,             getSettings);
router.put('/', protect, adminOnly,          updateSettings);
module.exports = router;
