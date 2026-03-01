const db = require('../config/db');
const uuid = require('uuid');

// Dashboard summary stats
exports.getDashboardStats = (req, res) => {
    const stats = {
        totalRequests: 0,
        pendingApprovals: 0,
        issuedCredentials: 0,
        totalVerifiers: 0
    };

    db.get("SELECT COUNT(*) as count FROM identity_requests", (err, row) => {
        if (row) stats.totalRequests = row.count;
        db.get("SELECT COUNT(*) as count FROM identity_requests WHERE status = 'pending'", (err, row) => {
            if (row) stats.pendingApprovals = row.count;
            db.get("SELECT COUNT(*) as count FROM credentials WHERE active = 1", (err, row) => {
                if (row) stats.issuedCredentials = row.count;
                db.get("SELECT COUNT(*) as count FROM users WHERE role = 'verifier'", (err, row) => {
                    if (row) stats.totalVerifiers = row.count;
                    res.status(200).json({ success: true, data: stats });
                });
            });
        });
    });
};

exports.getPendingRequests = (req, res) => {
    db.all("SELECT * FROM identity_requests WHERE status = 'pending' ORDER BY createdAt ASC", (err, rows) => {
        if (err) return res.status(500).json({ success: false, error: 'DB Error' });
        res.status(200).json({ success: true, data: rows });
    });
};

exports.getRequestDetails = (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM identity_requests WHERE requestId = ?", [id], (err, row) => {
        if (err || !row) return res.status(404).json({ success: false, error: 'Not found' });
        res.status(200).json({ success: true, data: row });
    });
};

exports.approveRequest = (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM identity_requests WHERE requestId = ?", [id], (err, reqData) => {
        if (err || !reqData) return res.status(404).json({ success: false, error: 'Not found' });
        if (reqData.status !== 'pending') return res.status(400).json({ success: false, error: 'Request is not pending' });

        const credIdNumber = Math.floor(100000 + Math.random() * 900000);
        const credId = `PS-CRED-${credIdNumber}`;
        const qrDataPayload = `privaseal:cred:${credId}:${reqData.firebaseUID}`; // unique logic

        db.run("UPDATE identity_requests SET status = 'approved' WHERE requestId = ?", [id], function (err) {
            if (err) return res.status(500).json({ success: false, error: 'Update failed' });

            const query = `INSERT INTO credentials (credentialId, requestId, firebaseUID, qrData) VALUES (?, ?, ?, ?)`;
            db.run(query, [credId, id, reqData.firebaseUID, qrDataPayload], function (err) {
                if (err) return res.status(500).json({ success: false, error: 'Insert cred failed' });

                // Track in audit log
                db.run("INSERT INTO audit_logs (action, targetId, message) VALUES (?, ?, ?)",
                    ['CREDENTIAL_APPROVED', credId, `Approved request ${id}`]
                );

                res.status(200).json({ success: true, data: { credentialId: credId } });
            });
        });
    });
};

exports.rejectRequest = (req, res) => {
    const { id } = req.params;
    db.run("UPDATE identity_requests SET status = 'rejected' WHERE requestId = ?", [id], function (err) {
        if (err) return res.status(500).json({ success: false, error: 'Update failed' });

        db.run("INSERT INTO audit_logs (action, targetId, message) VALUES (?, ?, ?)",
            ['REQUEST_REJECTED', id, `Rejected request ${id}`]
        );

        res.status(200).json({ success: true, message: 'Rejected' });
    });
};

// Verifier Management
exports.getPendingVerifiers = (req, res) => {
    db.all("SELECT id, firebaseUID, email, createdAt FROM users WHERE role = 'verifier' AND approved = 0", (err, rows) => {
        if (err) return res.status(500).json({ success: false, error: 'DB Error' });
        res.status(200).json({ success: true, data: rows });
    });
};

exports.approveVerifier = (req, res) => {
    const { firebaseUID } = req.params;
    db.run("UPDATE users SET approved = 1 WHERE firebaseUID = ? AND role = 'verifier'", [firebaseUID], function (err) {
        if (err) return res.status(500).json({ success: false, error: 'DB Error' });

        db.run("INSERT INTO audit_logs (action, targetId, message) VALUES (?, ?, ?)",
            ['VERIFIER_APPROVED', firebaseUID, `Approved verifier ${firebaseUID}`]
        );

        res.status(200).json({ success: true, message: 'Verifier approved' });
    });
};

exports.getAuditLogs = (req, res) => {
    db.all("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100", (err, rows) => {
        if (err) return res.status(500).json({ success: false, error: 'DB Error' });
        res.status(200).json({ success: true, data: rows });
    });
};

exports.getApprovedVerifiers = (req, res) => {
    db.all("SELECT id, firebaseUID, email, createdAt, approved FROM users WHERE role = 'verifier' AND approved = 1", (err, rows) => {
        if (err) return res.status(500).json({ success: false, error: 'DB Error' });
        res.status(200).json({ success: true, data: rows });
    });
};

exports.deleteVerifier = (req, res) => {
    const { firebaseUID } = req.params;
    db.run("DELETE FROM users WHERE firebaseUID = ? AND role = 'verifier'", [firebaseUID], function (err) {
        if (err) return res.status(500).json({ success: false, error: 'DB Error' });

        db.run("INSERT INTO audit_logs (action, targetId, message) VALUES (?, ?, ?)",
            ['VERIFIER_DELETED', firebaseUID, `Deleted/Revoked verifier ${firebaseUID}`]
        );

        res.status(200).json({ success: true, message: 'Verifier deleted' });
    });
};
