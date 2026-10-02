const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');

// GET /api/system/status
router.get('/status', systemController.getSystemStatus);

// GET /api/system/sms-logs (Mock simulator inspector)
router.get('/sms-logs', systemController.getSmsLogs);

// GET /api/system/network-info (Networking presentation metadata)
router.get('/network-info', systemController.getNetworkInfo);

module.exports = router;
