const db = require('../config/db');

exports.protect = async (req, res, next) => {
    let uid = req.headers['x-firebase-uid'];

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Here we could do: await admin.auth().verifyIdToken(token)
        // But for this robust implementation that supports development without service accounts, we can also accept the UID header.
        // A production app would strictly use the Bearer JWT token.
    }

    if (!uid) {
        console.log("No x-firebase-uid header provided.");
        return res.status(401).json({ success: false, error: 'Not authorized - Missing UID' });
    }

    db.get('SELECT * FROM users WHERE firebaseUID = ?', [uid], (err, user) => {
        if (err || !user) {
            console.log("User not found for uid:", uid);
            return res.status(401).json({ success: false, error: 'User not found in system' });
        }
        req.user = user;
        next();
    });
};

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `User role ${req.user ? req.user.role : 'None'} is not authorized`
            });
        }
        next();
    };
};
