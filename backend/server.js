import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import localizationService from './services/localizationService.js';
import pdfService from './services/pdfService.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import axios from 'axios';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Middleware
app.use(cors());
app.use(express.json());

// Add logging for incoming requests
app.use((req, res, next) => {
    console.log(`Received ${req.method} request for ${req.url}`);
    if (req.file) {
        console.log('File received:', {
            filename: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });
    }
    if (req.body) {
        console.log('Raw request body:', req.body);
        if (req.body.profile) {
            try {
                const profile = JSON.parse(req.body.profile);
                console.log('Parsed profile:', profile);
            } catch (e) {
                console.error('Error parsing profile in middleware:', e);
            }
        }
    }
    next();
});

// POST /translate endpoint
app.post('/translate', upload.single('file'), async (req, res) => {
    try {
        let content = req.body.content;
        let profile;
        
        // Parse profile with better error handling
        if (!req.body.profile) {
            return res.status(400).json({
                error: 'Missing profile data',
                details: { profile: 'Profile data is required' }
            });
        }

        try {
            profile = JSON.parse(req.body.profile);
            console.log('Successfully parsed profile:', profile);
        } catch (e) {
            console.error('Error parsing profile:', e);
            return res.status(400).json({
                error: 'Invalid profile data',
                details: { profile: 'Profile data is not valid JSON' }
            });
        }

        const preferredLanguage = profile?.preferredLanguage;
        console.log('Preferred language from profile:', preferredLanguage);

        if (!preferredLanguage) {
            return res.status(400).json({
                error: 'Missing preferred language',
                details: { preferredLanguage: 'Preferred language is required in profile' }
            });
        }

        console.log('Translation request:', {
            hasContent: !!content,
            hasFile: !!req.file,
            preferredLanguage,
            profile: {
                name: profile?.name,
                preferredLanguage: profile?.preferredLanguage
            }
        });

        if (!content && !req.file) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: { content: 'Either content or file is required' }
            });
        }

        // If a file was uploaded, process it using pdfService
        if (req.file) {
            console.log('Processing uploaded file...');
            try {
                content = await pdfService.extractTextFromPDF(req.file.buffer);
                console.log('File processed successfully');
            } catch (pdfError) {
                console.error('Error processing PDF:', pdfError);
                return res.status(500).json({
                    error: 'PDF processing failed',
                    details: pdfError.message
                });
            }
        }

        // First detect the language of the content
        console.log('Detecting language...');
        const { detectedLanguage } = await localizationService.processInput(content, 'text');
        console.log('Detected language:', detectedLanguage);
        
        // Then translate and culturally localize the content
        console.log('Translating content...');
        const translationResult = await localizationService.translateContent(
            content,
            detectedLanguage,
            preferredLanguage
        );
        console.log('Translation completed');
        
        res.json({ localizedContent: translationResult.content });
    } catch (err) {
        console.error('Error during translation:', {
            message: err.message,
            stack: err.stack,
            response: err.response?.data
        });
        res.status(500).json({ 
            error: 'Translation failed',
            details: err.message
        });
    }
});

// POST /generate-quiz endpoint
app.post('/generate-quiz', async (req, res) => {
    try {
        const { content, language } = req.body;
        
        if (!content) {
            return res.status(400).json({
                error: 'Missing content',
                details: { content: 'Content is required for quiz generation' }
            });
        }

        console.log('Generating quiz for content in:', language);

        // Generate quiz using OpenAI
        const response = await axios.post(
            `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${process.env.AZURE_OPENAI_API_VERSION}`,
            {
                messages: [
                    {
                        role: "system",
                        content: `You are an expert educational content creator. Create a quiz based on the provided content. 
                        The quiz should:
                        1. Have 5 multiple-choice questions
                        2. Cover key concepts from the content
                        3. Include one correct answer and three plausible distractors
                        4. Be in the same language as the content
                        5. Be appropriate for high school students
                        
                        Return ONLY a valid JSON object with this exact structure:
                        {
                            "questions": [
                                {
                                    "question": "What is the main cause of global warming?",
                                    "options": [
                                        "Greenhouse gas emissions",
                                        "Solar flares",
                                        "Volcanic eruptions",
                                        "Ocean currents"
                                    ],
                                    "correctAnswer": "Greenhouse gas emissions"
                                }
                            ]
                        }
                        
                        IMPORTANT: Return ONLY the raw JSON object. Do not include any markdown formatting, code blocks, or additional text.`
                    },
                    {
                        role: "user",
                        content: content
                    }
                ],
                temperature: 0.7,
                max_tokens: 2048
            },
            {
                headers: {
                    'api-key': process.env.AZURE_OPENAI_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        let quizData;
        try {
            let content = response.data.choices[0].message.content.trim();
            
            // Remove markdown code block formatting if present
            content = content.replace(/```json\n?|\n?```/g, '');
            
            // Try to parse the cleaned content
            quizData = JSON.parse(content);
            
            // Validate the quiz data structure
            if (!quizData.questions || !Array.isArray(quizData.questions)) {
                throw new Error('Invalid quiz data structure');
            }
            
            console.log('Quiz generated successfully');
            res.json(quizData);
        } catch (parseError) {
            console.error('Error parsing quiz data:', parseError);
            console.error('Raw response:', response.data.choices[0].message.content);
            res.status(500).json({
                error: 'Failed to parse quiz data',
                details: parseError.message
            });
        }
    } catch (error) {
        console.error('Error generating quiz:', error);
        res.status(500).json({
            error: 'Failed to generate quiz',
            details: error.message
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});