const Request = require('../models/Request');
const Credential = require('../models/Credential');

// @desc    Submit identity request
// @route   POST /api/wallet/request-identity
// @access  Private (Holder)
exports.submitRequest = async (req, res) => {
    try {
        const requestId = `PS-REQ-${Date.now()}`;

        const request = await Request.create({
            ...req.body,
            userId: req.user.id,
            requestId,
            status: 'pending'
        });

        res.status(201).json({ success: true, data: request });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get my requests
// @route   GET /api/wallet/my-requests
// @access  Private (Holder)
exports.getMyRequests = async (req, res) => {
    try {
        const requests = await Request.find({ userId: req.user.id }).sort('-createdAt');
        res.status(200).json({ success: true, count: requests.length, data: requests });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get my credentials
// @route   GET /api/wallet/my-credentials
// @access  Private (Holder)
exports.getMyCredentials = async (req, res) => {
    try {
        const credentials = await Credential.find({ holderId: req.user.id, status: 'active' }).sort('-issuedAt');
        res.status(200).json({ success: true, count: credentials.length, data: credentials });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
