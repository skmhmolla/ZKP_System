const mongoose = require('mongoose');

const CredentialSchema = new mongoose.Schema({
    holderId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    credentialId: {
        type: String,
        unique: true,
        required: true,
    },
    zkHash: {
        type: String,
        required: true,
    },
    qrCodeData: {
        type: String, // Stringified JSON or URL
        required: true,
    },
    issuedBy: {
        type: String,
        default: 'PrivaSeal Authority',
    },
    issuedAt: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['active', 'revoked'],
        default: 'active',
    },
    metadata: {
        type: Object, // Stores name, dob, etc. as confirmed
    }
});

module.exports = mongoose.model('Credential', CredentialSchema);
