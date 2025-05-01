// services/getRecommendations.js
import { AzureOpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new AzureOpenAI({
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiKey: process.env.AZURE_OPENAI_KEY,
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION,
});

export async function getLearningRecommendations(profile) {
  const { country, age, learningStyle } = profile;

  const prompt = `
You are an expert in educational design for Southeast Asia. 
Recommend a culturally relevant learning strategy for a ${age}-year-old student from ${country} who prefers ${learningStyle} learning.
Include local examples or analogies that would make learning engaging for the student.
`;

  try {
    const response = await client.chat.completions.create({
      messages: [
        { role: "system", content: "You create personalized learning advice based on user profile." },
        { role: "user", content: prompt }
      ],
      model: process.env.AZURE_OPENAI_MODEL,
      temperature: 0.7,
      max_tokens: 800,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI Error:", error);
    return "Failed to generate recommendation.";
  }
}
