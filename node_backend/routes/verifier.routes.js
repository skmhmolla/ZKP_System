const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { getDashboardInfo, verifyCredential } = require('../controllers/verifier.controller');

const router = express.Router();

router.use(protect);
router.use(authorize('verifier'));

router.get('/dashboard', getDashboardInfo);
router.post('/verify', verifyCredential);

module.exports = router;
