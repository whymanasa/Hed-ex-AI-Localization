// services/getRecommendations.js
import { AzureOpenAI } from "openai";
import dotenv from "dotenv";
import axios from 'axios';

dotenv.config();

const client = new AzureOpenAI({
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiKey: process.env.AZURE_OPENAI_KEY,
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION,
});

export async function getLearningRecommendations(content, profile) {
 
  const { country, age, learningStyle } = profile;

  const prompt = `
  You are an education expert specializing in Southeast Asian curricula and personalized learning. 
  
  Given the following:
  - Course content: "${content}"
  - Student profile: A ${age}-year-old student from ${country} who prefers ${learningStyle} learning
  
  Generate 3 localized and age-appropriate learning materials tailored to this student's needs. 
  Each suggestion should:
  - Include a clear title in bold
  - Describe how it uses the preferred learning style
  - Incorporate real-life scenarios or cultural elements relevant to ${country}
  - Be aligned with the Southeast Asian curriculum
  - Be concise and written in plain, student-friendly language
  
  Return only the 3 numbered suggestions in markdown format.
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
    console.log(response.choices[0].message.content);
    return response.choices[0].message.content;
      // Return the generated suggestions
  } catch (error) {
    console.error("OpenAI Error:", error);
    return "Failed to generate recommendation.";
  }
}
