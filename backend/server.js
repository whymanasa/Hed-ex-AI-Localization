import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { translateWithAzure } from './services/azureTranslator.js'; 
import { getLearningRecommendations } from './services/getRecommendations.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import localizationRoutes from './routes/localizationRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

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
    next();
});

// POST /translate endpoint
app.post('/translate', async (req, res) => {
    const { content, profile } = req.body;
    const preferredLanguage = profile?.preferredLanguage;

    if (!content || !profile || !preferredLanguage) {
        console.log('Missing content, profile, or preferredLanguage');
        return res.status(400).json({ error: 'Missing content, profile, or preferredLanguage' });
    }

    try {
        const localizedContent = await translateWithAzure(content, preferredLanguage);
        const recommendations = await getLearningRecommendations(content, profile);
        res.json({ localizedContent, recommendations });
    } catch (err) {
        console.error('Error during translation and recommendation:', err);
        res.status(500).json({ error: 'Translation and recommendation failed' });
    }
});

// Localization routes
app.use('/api/localization', localizationRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});




