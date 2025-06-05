const express = require('express');
const router = express.Router();
const localizationController = require('../controllers/localizationController');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Route for processing content (both file upload and text)
router.post('/process', upload.single('file'), localizationController.processContent.bind(localizationController));

module.exports = router; 