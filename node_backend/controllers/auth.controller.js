const db = require('../config/db');

// @desc    Register or Sync User session
// @route   POST /api/auth/session
// @access  Public
exports.syncSession = (req, res) => {
    const { firebaseUID, email, role } = req.body;

    if (!firebaseUID || !email || !role) {
        return res.status(400).json({ success: false, error: 'Please provide firebaseUID, email and role' });
    }

    // Issuer role restriction
    if (role === 'issuer' && email !== 'skmahmudulhasanmolla@gmail.com') {
        return res.status(403).json({ success: false, error: 'Unauthorized email for Issuer role' });
    }

    // Check if user exists
    db.get('SELECT * FROM users WHERE firebaseUID = ?', [firebaseUID], (err, user) => {
        if (err) {
            return res.status(500).json({ success: false, error: 'Database error' });
        }

        if (user) {
            // FIX: Overwrite corrupted 'holder' rows caused by React Context race conditions on registration
            if (user.role !== role) {
                // If the user was erroneously injected as a holder but correctly asked to be a verifier/issuer
                let updatedApproved = user.approved;
                if (role === 'verifier') updatedApproved = 0; // Verifiers must be manually approved!
                if (role === 'issuer') updatedApproved = 1;

                db.run('UPDATE users SET role = ?, approved = ? WHERE firebaseUID = ?', [role, updatedApproved, firebaseUID], (updateErr) => {
                    if (updateErr) return res.status(500).json({ success: false, error: 'Failed to correct user role' });
                    user.role = role;
                    user.approved = updatedApproved;
                    return res.status(200).json({ success: true, data: user });
                });
            } else {
                return res.status(200).json({ success: true, data: user });
            }
        } else {
            // Register new user
            let approved = 0;
            // Holder or Issuer (specific email) are auto-approved. Verifiers need manual approval.
            if (role === 'holder' || role === 'issuer') {
                approved = 1;
            }

            db.run(`INSERT INTO users (firebaseUID, email, role, approved) VALUES (?, ?, ?, ?)`,
                [firebaseUID, email, role, approved],
                function (err) {
                    if (err) {
                        return res.status(500).json({ success: false, error: 'Could not create user' });
                    }

                    db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err, newUser) => {
                        res.status(201).json({ success: true, data: newUser });
                    });
                }
            );
        }
    });
};

// @desc    Check auth status
// @route   GET /api/auth/me/:firebaseUID
// @access  Public
exports.getMe = (req, res) => {
    const { firebaseUID } = req.params;
    db.get('SELECT * FROM users WHERE firebaseUID = ?', [firebaseUID], (err, user) => {
        if (err || !user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
    });
};
