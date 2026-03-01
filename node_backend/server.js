const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const db = require('./config/db'); // Initialize SQLite DB

// Load env vars
dotenv.config();

// Route files
const auth = require('./routes/auth.routes');
const wallet = require('./routes/wallet.routes');
const issuer = require('./routes/issuer.routes');
const verifier = require('./routes/verifier.routes');


const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Serve static files for media uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routers
app.use('/api/auth', auth);
app.use('/api/wallet', wallet);
app.use('/api/issuer', issuer);
app.use('/api/verifier', verifier);

// Welcome route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to PrivaSeal ZK-Credential API' });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(
    PORT,
    console.log(
        `🚀 Server running in ${process.env.NODE_ENV} mode on http://localhost:${PORT}`
    )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    // server.close(() => process.exit(1));
});
