const Credential = require('../models/Credential');
const VerificationLog = require('../models/VerificationLog');

// @desc    Verify credential
// @route   POST /api/verifier/verify-credential
// @access  Private (Verifier)
exports.verifyCredential = async (req, res) => {
    try {
        const { credentialId } = req.body;

        if (!credentialId) {
            return res.status(400).json({ success: false, error: 'Credential ID is required' });
        }

        const credential = await Credential.findOne({ credentialId, status: 'active' });

        const result = credential ? 'valid' : 'invalid';

        // Log the verification
        const log = await VerificationLog.create({
            credentialId,
            verifierId: req.user.id,
            result
        });

        res.status(200).json({
            success: true,
            isValid: !!credential,
            data: credential || null,
            log
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get verification history
// @route   GET /api/verifier/history
// @access  Private (Verifier)
exports.getHistory = async (req, res) => {
    try {
        const logs = await VerificationLog.find({ verifierId: req.user.id }).sort('-verifiedAt');
        res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
