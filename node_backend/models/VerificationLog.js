const mongoose = require('mongoose');

const VerificationLogSchema = new mongoose.Schema({
    credentialId: {
        type: String,
        required: true,
    },
    verifierId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    location: {
        type: String,
        default: 'Digital Portal',
    },
    verifiedAt: {
        type: Date,
        default: Date.now,
    },
    result: {
        type: String,
        enum: ['valid', 'invalid', 'expired'],
        default: 'valid',
    },
});

module.exports = mongoose.model('VerificationLog', VerificationLogSchema);
