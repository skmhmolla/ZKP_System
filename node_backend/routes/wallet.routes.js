const express = require('express');
const { submitRequest, getMyRequests, getMyCredentials } = require('../controllers/wallet.controller');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('holder'));

router.post('/request-identity', submitRequest);
router.get('/my-requests', getMyRequests);
router.get('/my-credentials', getMyCredentials);

module.exports = router;
