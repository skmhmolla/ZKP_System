const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getDashboardStats,
    getPendingRequests,
    getRequestDetails,
    approveRequest,
    rejectRequest,
    getPendingVerifiers,
    approveVerifier,
    getAuditLogs,
    getApprovedVerifiers,
    deleteVerifier
} = require('../controllers/issuer.controller');

const router = express.Router();

router.use(protect);
router.use(authorize('issuer'));

router.get('/dashboard/stats', getDashboardStats);
router.get('/requests/pending', getPendingRequests);
router.get('/requests/pending/:id', getRequestDetails);
router.post('/requests/approve/:id', approveRequest);
router.post('/requests/reject/:id', rejectRequest);
router.get('/verifiers/pending', getPendingVerifiers);
router.get('/verifiers/list', getApprovedVerifiers);
router.post('/verifiers/approve/:firebaseUID', approveVerifier);
router.delete('/verifiers/delete/:firebaseUID', deleteVerifier);
router.get('/audit', getAuditLogs);

module.exports = router;
