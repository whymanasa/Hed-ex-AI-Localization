import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import translateRoute from "./routes/translateRoute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Dummy translate function (you'll replace with Azure API later)
function dummyTranslate(content, targetLanguage) {
  return `Translated [${targetLanguage}] version of: ${content}`;
}

// Dummy recommendation generator
function dummyRecommendations(language) {
  return [
    `Recommended Course 1 for ${language}`,
    `Recommended Course 2 for ${language}`,
  ];
}

// POST /translate endpoint
app.post('/translate', (req, res) => {
  const { content, targetLanguage } = req.body;

  if (!content || !targetLanguage) {
    return res.status(400).json({ error: 'Missing content or targetLanguage' });
  }

  // Simulate translation
  const localizedContent = dummyTranslate(content, targetLanguage);

  // Simulate personalized recommendations
  const recommendations = dummyRecommendations(targetLanguage);

  // Send back response
  res.json({ localizedContent, recommendations });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});



