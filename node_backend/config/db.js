const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../privaseal.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error opening database', err.message);
    } else {
        console.log('🚀 Connected to SQLite database: privaseal.db');

        // Create tables if they don't exist
        db.serialize(() => {
            // Users Table
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                firebaseUID TEXT UNIQUE NOT NULL,
                email TEXT NOT NULL,
                role TEXT NOT NULL,
                approved INTEGER DEFAULT 0,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Identity Requests Table
            db.run(`CREATE TABLE IF NOT EXISTS identity_requests (
                requestId TEXT PRIMARY KEY,
                firebaseUID TEXT NOT NULL,
                name TEXT NOT NULL,
                dob TEXT NOT NULL,
                email TEXT,
                mobile TEXT,
                village TEXT,
                po TEXT,
                ps TEXT,
                city TEXT,
                district TEXT,
                state TEXT,
                pin TEXT,
                landmark TEXT,
                documentType TEXT,
                documentNumber TEXT,
                frontImagePath TEXT,
                backImagePath TEXT,
                selfieImagePath TEXT,
                status TEXT DEFAULT 'pending',
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (firebaseUID) REFERENCES users (firebaseUID)
            )`);

            // Credentials Table
            db.run(`CREATE TABLE IF NOT EXISTS credentials (
                credentialId TEXT PRIMARY KEY,
                requestId TEXT NOT NULL,
                firebaseUID TEXT NOT NULL,
                qrData TEXT NOT NULL UNIQUE,
                issuedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                active INTEGER DEFAULT 1,
                FOREIGN KEY (requestId) REFERENCES identity_requests (requestId),
                FOREIGN KEY (firebaseUID) REFERENCES users (firebaseUID)
            )`);

            // Verification Logs Table
            db.run(`CREATE TABLE IF NOT EXISTS verification_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                credentialId TEXT NOT NULL,
                verifierId TEXT NOT NULL,
                result TEXT NOT NULL,
                verifiedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (credentialId) REFERENCES credentials (credentialId)
            )`);

            // Audit Logs Table
            db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                action TEXT NOT NULL,
                targetId TEXT,
                message TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
        });
    }
});

module.exports = db;
