const db = require('../config/db');

exports.getDashboardInfo = (req, res) => {
    const { firebaseUID } = req.user;
    const stats = { totalScans: 0, totalValid: 0 };

    db.get("SELECT COUNT(*) as count FROM verification_logs WHERE verifierId = ?", [firebaseUID], (err, total) => {
        if (total) stats.totalScans = total.count;

        db.get("SELECT COUNT(*) as count FROM verification_logs WHERE verifierId = ? AND result = 'VERIFIED'", [firebaseUID], (err, valid) => {
            if (valid) stats.totalValid = valid.count;
            res.status(200).json({ success: true, data: stats });
        });
    });
};

exports.verifyCredential = (req, res) => {
    const { firebaseUID } = req.user;
    const { credentialId } = req.body;

    if (!credentialId) return res.status(400).json({ success: false, error: 'credentialId is required' });

    // Ensure verifier is approved
    db.get("SELECT approved FROM users WHERE firebaseUID = ?", [firebaseUID], (err, user) => {
        if (err || !user || user.approved === 0) return res.status(403).json({ success: false, error: 'Verifier not approved by Issuer' });

        // Check credential
        db.get("SELECT * FROM credentials WHERE credentialId = ?", [credentialId], (err, cred) => {
            let result = 'FAILED';
            if (cred && cred.active === 1) {
                result = 'VERIFIED';
            }

            db.run("INSERT INTO verification_logs (credentialId, verifierId, result) VALUES (?, ?, ?)", [credentialId, firebaseUID, result], function (err) {
                if (err) return res.status(500).json({ success: false, error: 'DB Insert Failed' });

                // Log an audit
                db.run("INSERT INTO audit_logs (action, targetId, message) VALUES (?, ?, ?)",
                    [result === 'VERIFIED' ? 'CREDENTIAL_VERIFIED' : 'CREDENTIAL_FAILED', credentialId, `Verifier ${firebaseUID} returned ${result} for ${credentialId}`]
                );

                res.status(200).json({ success: true, result });
            });
        });
    });
};
