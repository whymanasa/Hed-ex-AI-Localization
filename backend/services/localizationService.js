const { FormRecognizerClient, AzureKeyCredential } = require('@azure/ai-form-recognizer');
const { TranslatorClient, AzureKeyCredential: TranslatorCredential } = require('@azure/ai-translator');
const { ComputerVisionClient } = require('@azure/cognitiveservices-computervision');
const { OpenAIClient } = require('@azure/openai');
const fs = require('fs').promises;

class LocalizationService {
    constructor() {
        // Initialize Azure clients
        this.formRecognizerClient = new FormRecognizerClient(
            process.env.AZURE_FORM_RECOGNIZER_ENDPOINT,
            new AzureKeyCredential(process.env.AZURE_FORM_RECOGNIZER_KEY)
        );

        this.translatorClient = new TranslatorClient(
            process.env.AZURE_TRANSLATOR_ENDPOINT,
            new TranslatorCredential(process.env.AZURE_TRANSLATOR_KEY)
        );

        this.visionClient = new ComputerVisionClient(
            new AzureKeyCredential(process.env.AZURE_VISION_KEY),
            process.env.AZURE_VISION_ENDPOINT
        );

        this.openAIClient = new OpenAIClient(
            process.env.AZURE_OPENAI_ENDPOINT,
            new AzureKeyCredential(process.env.AZURE_OPENAI_KEY)
        );

        // List of OpenAI supported SEA languages
        this.openAISupportedLanguages = [
            'en',    // English (commonly used in SEA)
            'id',    // Indonesian
            'ms',    // Malay
            'th',    // Thai
            'vi',    // Vietnamese
            'fil',   // Filipino
            'km',    // Khmer
            'lo',    // Lao
            'my',    // Burmese
            'zh',    // Chinese (for Singapore and Malaysia)
            'ta',    // Tamil (for Singapore)
            'hi'     // Hindi (for Singapore)
        ];
    }

    // Helper method to check if a language is supported by OpenAI
    isLanguageSupported(language) {
        return this.openAISupportedLanguages.includes(language.toLowerCase());
    }

    // Process PDF input
    async processPDF(filePath) {
        try {
            const fileBuffer = await fs.readFile(filePath);
            const poller = await this.formRecognizerClient.beginRecognizeContent(fileBuffer);
            const result = await poller.pollUntilDone();

            const extractedContent = {
                text: [],
                images: []
            };

            for (const page of result.pages) {
                // Extract text
                for (const line of page.lines) {
                    extractedContent.text.push(line.text);
                }

                // Extract images if present
                if (page.images && page.images.length > 0) {
                    for (const image of page.images) {
                        extractedContent.images.push({
                            boundingBox: image.boundingBox,
                            confidence: image.confidence
                        });
                    }
                }
            }

            return extractedContent;
        } catch (error) {
            console.error('Error processing PDF:', error);
            throw error;
        }
    }

    // Process image input
    async processImage(filePath) {
        try {
            const fileBuffer = await fs.readFile(filePath);
            const result = await this.visionClient.analyzeImageInStream(fileBuffer, {
                visualFeatures: ['Tags', 'Description', 'Captions'],
                language: 'en'
            });

            return {
                tags: result.tags,
                description: result.description,
                captions: result.captions
            };
        } catch (error) {
            console.error('Error processing image:', error);
            throw error;
        }
    }

    // Process text input
    async processText(text) {
        try {
            // Detect language
            const [detection] = await this.translatorClient.detectLanguage([text]);
            
            return {
                text,
                detectedLanguage: detection.language,
                confidence: detection.confidence
            };
        } catch (error) {
            console.error('Error processing text:', error);
            throw error;
        }
    }

    // Main input processing method
    async processInput(input, type) {
        switch (type.toLowerCase()) {
            case 'pdf':
                return await this.processPDF(input);
            case 'image':
                return await this.processImage(input);
            case 'text':
                return await this.processText(input);
            default:
                throw new Error(`Unsupported input type: ${type}`);
        }
    }

    // Process content with Azure OpenAI
    async processWithOpenAI(content) {
        try {
            const prompt = this.buildPrompt(content);
            const response = await this.openAIClient.getChatCompletions(
                process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
                {
                    messages: [
                        { role: "system", content: "You are a helpful assistant that processes and localizes content." },
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 800
                }
            );

            return {
                processedText: response.choices[0].message.content,
                language: content.detectedLanguage || 'en'
            };
        } catch (error) {
            console.error('Error processing with OpenAI:', error);
            throw error;
        }
    }

    // Translate content
    async translateContent(content, sourceLang, targetLang) {
        try {
            const textToTranslate = Array.isArray(content.text) ? content.text.join('\n') : content.text;
            const [translation] = await this.translatorClient.translateText([textToTranslate], {
                from: sourceLang,
                to: [targetLang]
            });

            return {
                ...content,
                text: translation.translations[0].text,
                language: targetLang
            };
        } catch (error) {
            console.error('Error translating content:', error);
            throw error;
        }
    }

    // Build prompt for OpenAI
    buildPrompt(content) {
        let prompt = 'Please process and localize the following content:\n\n';
        
        if (Array.isArray(content.text)) {
            prompt += content.text.join('\n');
        } else if (content.text) {
            prompt += content.text;
        }

        if (content.tags) {
            prompt += '\n\nTags: ' + content.tags.map(tag => tag.name).join(', ');
        }

        if (content.description) {
            prompt += '\n\nDescription: ' + content.description.captions[0].text;
        }

        prompt += '\n\nPlease provide a localized version that maintains the original meaning while being culturally appropriate.';

        return prompt;
    }
}

module.exports = new LocalizationService(); 