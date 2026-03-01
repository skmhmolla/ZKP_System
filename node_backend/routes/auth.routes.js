const express = require('express');
const { syncSession, getMe } = require('../controllers/auth.controller');

const router = express.Router();

router.post('/session', syncSession);
router.get('/me/:firebaseUID', getMe);

module.exports = router;
