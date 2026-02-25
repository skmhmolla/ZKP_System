const express = require('express');
const { verifyCredential, getHistory } = require('../controllers/verifier.controller');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('verifier'));

router.post('/verify-credential', verifyCredential);
router.get('/history', getHistory);

module.exports = router;
