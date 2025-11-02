const express = require('express');
const router = express.Router();
const { processQuery } = require('../controllers/chatbotController');

// POST /api/chatbot - Process chatbot query
router.post('/', processQuery);

module.exports = router;
