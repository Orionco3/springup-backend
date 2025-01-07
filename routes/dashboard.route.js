const express = require('express');

const controller = require('../controllers/dashboard');
const { authenticate } = require('../middlewares/auth');
const router = express.Router();


module.exports = router;
