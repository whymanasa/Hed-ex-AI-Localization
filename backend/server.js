import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { translateWithAzure } from './services/azureTranslator.js'; 
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
  const { content, targetLanguage } = req.body;

  if (!content || !targetLanguage) {
    console.log('Missing content or targetLanguage');
    return res.status(400).json({ error: 'Missing content or targetLanguage' });
  }

  try {
    const localizedContent = await translateWithAzure(content, targetLanguage);

    const recommendations = [
      `Recommended Course 1 for ${targetLanguage}`,
      `Recommended Course 2 for ${targetLanguage}`,
    ];

    res.json({ localizedContent, recommendations });
  } catch (err) {
    console.error('Error during translation:', err);
    res.status(500).json({ error: err.message || 'Translation failed' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});



