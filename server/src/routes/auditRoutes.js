const express = require('express');
const { getAuditLogs } = require('../controllers/auditController');
const { protect } = require('../middleware/authMiddleware');
const { roleGuard } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', roleGuard('admin'), getAuditLogs);

module.exports = router;
