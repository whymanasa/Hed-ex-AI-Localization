// backend/index.js

import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// POST /translate
app.post('/translate', async (req, res) => {
  const { text, to } = req.body;

  // Simple check
  if (!text || !to) {
    return res.status(400).json({ error: 'Text and target language are required.' });
  }

  try {
    // Here is where the real Azure API call would happen
    // But for now, we will just mock a fake translation

    const fakeTranslation = `(${to}) ${text} (translated)`;

    // Later we will replace this part with real Azure call 🔥

    res.json({ translatedText: fakeTranslation });
  } catch (error) {
    console.error('Translation error:', error.message);
    res.status(500).json({ error: 'Failed to translate.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
