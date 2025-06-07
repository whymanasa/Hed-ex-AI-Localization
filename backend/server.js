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
import NodeCache from 'node-cache';

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

// Add axios configuration at the top after imports
const axiosInstance = axios.create({
    timeout: 10000, // 10 second timeout
    headers: {
        'api-key': process.env.AZURE_OPENAI_KEY,
        'Content-Type': 'application/json'
    }
});

// Add error handling middleware
const handleApiError = (error, res, context) => {
    console.error(`Error in ${context}:`, {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
    });

    if (error.code === 'ECONNABORTED') {
        return res.status(504).json({
            error: `${context} timed out`,
            details: 'The request took too long to complete'
        });
    }

    if (error.response?.status === 429) {
        return res.status(429).json({
            error: 'Rate limit exceeded',
            details: 'Please try again in a few moments'
        });
    }

    return res.status(500).json({
        error: `${context} failed`,
        details: error.response?.data?.error?.message || error.message
    });
};

const quizCache = new NodeCache({ stdTTL: 3600 }); // Cache quiz results for 1 hour
const feedbackCache = new NodeCache({ stdTTL: 600 }); // Cache feedback results for 10 minutes

// POST /translate endpoint
app.post('/translate', upload.single('file'), async (req, res) => {
    try {
        let content = req.body.content;
        let profile;
        
        if (!req.body.profile) {
            return res.status(400).json({
                error: 'Missing profile data',
                details: { profile: 'Profile data is required' }
            });
        }

        try {
            profile = JSON.parse(req.body.profile);
        } catch (e) {
            return res.status(400).json({
                error: 'Invalid profile data',
                details: { profile: 'Profile data is not valid JSON' }
            });
        }

        const preferredLanguage = profile?.preferredLanguage;
        if (!preferredLanguage) {
            return res.status(400).json({
                error: 'Missing preferred language',
                details: { preferredLanguage: 'Preferred language is required in profile' }
            });
        }

        const cacheKey = `translate-${Buffer.from(content || req.file.buffer).toString('base64')}-${preferredLanguage}`;
        const cachedTranslation = quizCache.get(cacheKey); // Reusing quizCache for now for translation, consider separate cache if needed
        if (cachedTranslation) {
            return res.json({ localizedContent: cachedTranslation });
        }

        if (!content && !req.file) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: { content: 'Either content or file is required' }
            });
        }

        if (req.file) {
            try {
                content = await pdfService.extractTextFromPDF(req.file.buffer);
            } catch (pdfError) {
                return res.status(500).json({
                    error: 'PDF processing failed',
                    details: pdfError.message
                });
            }
        }

        const { detectedLanguage } = await localizationService.processInput(content, 'text');
        const translationResult = await localizationService.translateContent(
            content,
            detectedLanguage,
            preferredLanguage
        );
        
        quizCache.set(cacheKey, translationResult.content); // Cache the translation result
        res.json({ localizedContent: translationResult.content });
    } catch (err) {
        handleApiError(err, res, 'Translation');
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

        const cacheKey = `quiz-${Buffer.from(content).toString('base64')}-${language}`;
        const cachedQuiz = quizCache.get(cacheKey);
        if (cachedQuiz) {
            return res.json(cachedQuiz);
        }

        const response = await axiosInstance.post(
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
                        4. Be in ${language || 'the same language as the content'}
                        5. Be appropriate for high school students
                        
                        Return ONLY a valid JSON object with this exact structure:
                        {
                            "questions": [
                                {
                                    "question": "string",
                                    "options": ["string", "string", "string", "string"],
                                    "correctAnswer": "string"
                                }
                            ]
                        }`
                    },
                    {
                        role: "user",
                        content: content
                    }
                ],
                temperature: 0.7,
                max_tokens: 2048
            }
        );

        let quizData;
        try {
            let content = response.data.choices[0].message.content.trim();
            content = content.replace(/```json\n?|\n?```/g, '');
            quizData = JSON.parse(content);
            
            if (!quizData.questions || !Array.isArray(quizData.questions)) {
                throw new Error('Invalid quiz data structure');
            }
            
            quizCache.set(cacheKey, quizData); // Cache the quiz result
            res.json(quizData);
        } catch (parseError) {
            console.error('Error parsing quiz data:', parseError);
            res.status(500).json({
                error: 'Failed to parse quiz data',
                details: parseError.message
            });
        }
    } catch (error) {
        handleApiError(error, res, 'Quiz generation');
    }
});

// POST /generate-feedback endpoint
app.post('/generate-feedback', async (req, res) => {
    try {
        const { score, language } = req.body;

        if (score === undefined || language === undefined) {
            return res.status(400).json({ error: 'Missing score or language' });
        }

        const cacheKey = `feedback-${score}-${language}`;
        const cachedFeedback = feedbackCache.get(cacheKey);
        if (cachedFeedback) {
            return res.json({ feedback: cachedFeedback });
        }

        const feedbackType = score >= 80 ? 'excellent' : score >= 60 ? 'good' : 'needs_improvement';
        const prompts = {
            excellent: `Provide positive feedback in ${language} that praises their excellent understanding (${score}%) and encourages them to continue their great work. Keep it very concise, around 10 words. Make it culturally appropriate for ${language} speakers.`,
            good: `Provide positive feedback in ${language} that acknowledges their good progress (${score}%) and encourages them to keep learning. Keep it very concise, around 10 words. Make it culturally appropriate for ${language} speakers.`,
            needs_improvement: `Provide encouraging feedback in ${language} that reassures them about their score (${score}%) and encourages them to keep practicing. Keep it very concise, around 10 words. Make it culturally appropriate for ${language} speakers.`
        };

        const response = await axiosInstance.post(
            `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${process.env.AZURE_OPENAI_API_VERSION}`,
            {
                messages: [
                    { 
                        role: "system", 
                        content: `You are a multilingual educational assistant. Generate feedback in the specified language, ensuring it is culturally appropriate and natural-sounding. Your response should be very brief, around 10 words. Do not include any English text in your response.`
                    },
                    { role: "user", content: prompts[feedbackType] }
                ],
                temperature: 0.7,
                max_tokens: 30 // Adjusted max_tokens to get ~10 words, allowing for variations in word length and language
            }
        );

        const feedback = response.data.choices[0].message.content.trim();
        feedbackCache.set(cacheKey, feedback); // Cache the feedback result
        res.json({ feedback });

    } catch (error) {
        handleApiError(error, res, 'Feedback generation');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});