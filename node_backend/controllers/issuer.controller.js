const Request = require('../models/Request');
const Credential = require('../models/Credential');
const crypto = require('crypto');

// @desc    Get pending requests
// @route   GET /api/issuer/pending-requests
// @access  Private (Issuer)
exports.getPendingRequests = async (req, res) => {
    try {
        const requests = await Request.find({ status: 'pending' }).sort('-createdAt');
        res.status(200).json({ success: true, count: requests.length, data: requests });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Approve request
// @route   POST /api/issuer/approve/:requestId
// @access  Private (Issuer)
exports.approveRequest = async (req, res) => {
    try {
        const request = await Request.findOne({ requestId: req.params.requestId });

        if (!request) {
            return res.status(404).json({ success: false, error: 'Request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ success: false, error: 'Request already processed' });
        }

        // 1. Update Request
        request.status = 'approved';
        await request.save();

        // 2. Generate Credential
        const credentialId = `PS-CRED-${Date.now()}`;
        const zkHash = crypto.createHash('sha256').update(JSON.stringify(request)).digest('hex');

        const credential = await Credential.create({
            holderId: request.userId,
            credentialId,
            zkHash: `zk_${zkHash.substring(0, 32)}`,
            qrCodeData: JSON.stringify({
                id: credentialId,
                type: request.documentType,
                issuer: "PrivaSeal Authority",
                hash: zkHash
            }),
            metadata: {
                name: request.fullName,
                dob: request.dob,
                email: request.email,
                docType: request.documentType,
                docNum: request.documentNumber
            }
        });

        res.status(200).json({ success: true, data: credential });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Reject request
// @route   POST /api/issuer/reject/:requestId
// @access  Private (Issuer)
exports.rejectRequest = async (req, res) => {
    try {
        const request = await Request.findOne({ requestId: req.params.requestId });

        if (!request) {
            return res.status(404).json({ success: false, error: 'Request not found' });
        }

        request.status = 'rejected';
        await request.save();

        res.status(200).json({ success: true, data: request });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get issued credentials
// @route   GET /api/issuer/issued-credentials
// @access  Private (Issuer)
exports.getIssuedCredentials = async (req, res) => {
    try {
        const credentials = await Credential.find().sort('-issuedAt');
        res.status(200).json({ success: true, count: credentials.length, data: credentials });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
