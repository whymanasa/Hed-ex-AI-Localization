import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { translateWithAzure } from './services/azureTranslator.js'; 
import { getLearningRecommendations } from './services/getRecommendations.js'; // Ensure this is correctly imported
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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
  const { content, targetLanguage, profile } = req.body;

  if (!content || !targetLanguage || !profile) {
    console.log('Missing content, targetLanguage, or profile');
    return res.status(400).json({ error: 'Missing content, targetLanguage, or profile' });
  }

  try {
    // First, translate the content
    const localizedContent = await translateWithAzure(content, targetLanguage);

    // Generate recommendations based on content and profile
    const recommendations = await getLearningRecommendations(content, profile);

    res.json({ localizedContent, recommendations });

  } catch (err) {
    console.error('Error during translation and recommendation:', err);
    res.status(500).json({ error: 'Translation and recommendation failed' });
  }
});



// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});




