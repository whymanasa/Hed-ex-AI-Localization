import express from 'express';
import { getLearningRecommendations } from '../services/getRecommendations.js';

const router = express.Router();

router.post('/recommend', async (req, res) => {
  const { content, profile } = req.body;

  try {
    const recommendations = await getLearningRecommendations(content, profile);
    res.json({ recommendations });
  } catch (error) {
    console.error("Recommendation error:", error);
    res.status(500).json({ error: 'Failed to generate recommendations.' });
  }
});

export default router;


