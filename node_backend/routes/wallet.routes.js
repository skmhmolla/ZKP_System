const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { submitRequest, getDashboardInfo, getCredentials, getActivity } = require('../controllers/wallet.controller');

const router = express.Router();

router.post('/request', protect, authorize('holder'), submitRequest);
router.get('/dashboard', protect, authorize('holder'), getDashboardInfo);
router.get('/list', protect, authorize('holder'), getCredentials);
router.get('/activity', protect, authorize('holder'), getActivity);

module.exports = router;
