const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // req.user has been populated by authMiddleware.protect
        const uid = req.user ? req.user.firebaseUID : 'unknown';
        const userUploadPath = path.join(__dirname, '../uploads', uid);

        // Create directory if it doesn't exist
        if (!fs.existsSync(userUploadPath)) {
            fs.mkdirSync(userUploadPath, { recursive: true });
        }
        cb(null, userUploadPath);
    },
    filename: (req, file, cb) => {
        // Create a unique filename for the upload
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filters to accept only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024 // Set an absolute maximum of 2MB to cover all images. Specific field sizes can be checked in controller.
    },
    fileFilter: fileFilter
});

module.exports = upload;
