const localizationService = require('../services/localizationService');
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

class LocalizationController {
    // Handle file upload and text input
    async processContent(req, res) {
        try {
            const { type, text, preferredLanguage } = req.body;
            let result;

            if (type === 'text' && text) {
                result = await localizationService.processInput(text, 'text');
            } else if (req.file) {
                const fileType = path.extname(req.file.originalname).toLowerCase();
                if (fileType === '.pdf') {
                    result = await localizationService.processInput(req.file.path, 'pdf');
                } else if (['.jpg', '.jpeg', '.png'].includes(fileType)) {
                    result = await localizationService.processInput(req.file.path, 'image');
                } else {
                    return res.status(400).json({ error: 'Unsupported file type' });
                }
            } else {
                return res.status(400).json({ error: 'No content provided' });
            }

            // Check language compatibility
            const sourceLang = result.detectedLanguage || 'en';
            const isSourceSupported = localizationService.isLanguageSupported(sourceLang);
            const isPreferredSupported = localizationService.isLanguageSupported(preferredLanguage);

            // Process routing based on language support
            if (isSourceSupported) {
                // Case A: source_lang supported by OpenAI
                result.processedContent = await this.processWithOpenAI(result);
            } else if (isPreferredSupported) {
                // Case B: source_lang NOT supported, preferred_lang IS supported
                const translatedText = await this.translateContent(result, sourceLang, preferredLanguage);
                result.processedContent = await this.processWithOpenAI(translatedText);
            } else {
                // Case C: Neither source_lang nor preferred_lang supported
                const translatedToEnglish = await this.translateContent(result, sourceLang, 'en');
                result.processedContent = await this.processWithOpenAI(translatedToEnglish);
            }

            // Post-process translation if needed
            if (result.processedContent.language !== preferredLanguage) {
                result.finalContent = await this.translateContent(
                    result.processedContent,
                    result.processedContent.language,
                    preferredLanguage
                );
            } else {
                result.finalContent = result.processedContent;
            }

            res.json(result);
        } catch (error) {
            console.error('Error in processContent:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Helper method to process content with OpenAI
    async processWithOpenAI(content) {
        // Implementation will be added in the next step
        return content;
    }

    // Helper method to translate content
    async translateContent(content, sourceLang, targetLang) {
        // Implementation will be added in the next step
        return content;
    }
}

module.exports = new LocalizationController(); 