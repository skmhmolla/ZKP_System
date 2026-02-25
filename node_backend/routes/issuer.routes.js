const express = require('express');
const {
    getPendingRequests,
    approveRequest,
    rejectRequest,
    getIssuedCredentials
} = require('../controllers/issuer.controller');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('issuer'));

router.get('/pending-requests', getPendingRequests);
router.post('/approve/:requestId', approveRequest);
router.post('/reject/:requestId', rejectRequest);
router.get('/issued-credentials', getIssuedCredentials);

module.exports = router;
