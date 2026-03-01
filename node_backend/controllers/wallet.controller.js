const db = require('../config/db');

exports.submitRequest = (req, res) => {
    const { firebaseUID } = req.user;

    // Check if user has an ongoing or approved request
    db.get('SELECT * FROM identity_requests WHERE firebaseUID = ? AND status != ?', [firebaseUID, 'rejected'], (err, existingReq) => {
        if (err) return res.status(500).json({ success: false, error: 'Database check failed' });
        if (existingReq) return res.status(400).json({ success: false, error: 'You already have an active or approved request.' });

        const {
            name, dob, email, mobile,
            village, po, ps, city, district, state, pin, landmark,
            documentType, documentNumber
        } = req.body;

        // Validation for exact 10 digits mobile
        if (!/^\d{10}$/.test(mobile)) {
            return res.status(400).json({ success: false, error: 'Mobile must be exactly 10 digits' });
        }

        // Document validation limits based on type (default logic from prompt)
        if (documentType === 'Aadhaar' && !/^\d{12}$/.test(documentNumber.replace(/\s/g, ''))) {
            return res.status(400).json({ success: false, error: 'Aadhaar must be 12 digits' });
        }

        const files = req.files || {};
        const frontImage = files && files['frontImage'] ? files['frontImage'][0] : null;
        const backImage = files && files['backImage'] ? files['backImage'][0] : null;
        const selfieImage = files && files['selfieImage'] ? files['selfieImage'][0] : null;

        // Generate PS-REQ-XXXXXX
        const reqIdNumber = Math.floor(100000 + Math.random() * 900000);
        const reqId = `PS-REQ-${reqIdNumber}`;

        // Storing relative paths for serving properly (optional now)
        const frontPath = frontImage?.path ? `/uploads/${firebaseUID}/${frontImage.filename}` : null;
        const backPath = backImage?.path ? `/uploads/${firebaseUID}/${backImage.filename}` : null;
        const selfiePath = selfieImage?.path ? `/uploads/${firebaseUID}/${selfieImage.filename}` : null;

        const query = `INSERT INTO identity_requests (
            requestId, firebaseUID, name, dob, email, mobile, 
            village, po, ps, city, district, state, pin, landmark, 
            documentType, documentNumber, frontImagePath, backImagePath, selfieImagePath
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const params = [
            reqId, firebaseUID, name, dob, email, mobile,
            village, po, ps, city, district, state, pin, landmark,
            documentType, documentNumber.replace(/\s/g, ''), frontPath, backPath, selfiePath
        ];

        db.run(query, params, function (err) {
            if (err) return res.status(500).json({ success: false, error: 'Could not insert record' });
            res.status(201).json({ success: true, data: { requestId: reqId } });
        });
    });
};

exports.getDashboardInfo = (req, res) => {
    const { firebaseUID } = req.user;

    // Fetch requests and credentials for the wallet dashboard
    db.get('SELECT * FROM identity_requests WHERE firebaseUID = ? ORDER BY createdAt DESC LIMIT 1', [firebaseUID], (err, idReq) => {
        if (err) return res.status(500).json({ success: false, error: 'Database check failed' });

        db.get('SELECT * FROM credentials WHERE firebaseUID = ? AND active = 1 ORDER BY issuedAt DESC LIMIT 1', [firebaseUID], (err, cred) => {
            res.status(200).json({
                success: true,
                data: {
                    request: idReq || null,
                    credential: cred || null
                }
            });
        });
    });
};
