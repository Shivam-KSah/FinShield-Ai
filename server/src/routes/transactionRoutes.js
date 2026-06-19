const express = require('express');
const {
  transfer,
  getTransactions,
  getFlagged,
  reviewTransaction,
  investigate,
  getStats,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const { roleGuard } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router.get('/stats', getStats);
router.get('/', getTransactions);
router.post('/transfer', transfer);
router.get('/flagged', roleGuard('officer', 'admin'), getFlagged);
router.patch('/:id/review', roleGuard('officer', 'admin'), reviewTransaction);
router.post('/:id/investigate', roleGuard('officer', 'admin'), investigate);

module.exports = router;
