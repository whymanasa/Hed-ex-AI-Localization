import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import { AzureOpenAI } from 'openai';

// Azure OpenAI config
const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_KEY;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
const modelName = deployment;
const apiVersion = process.env.AZURE_OPENAI_API_VERSION;

const client = new AzureOpenAI({ endpoint, apiKey, deployment, apiVersion });

// Language display names
const languageNameMap = {
  tl: 'Tagalog (Filipino)',
  id: 'Bahasa Indonesia',
  th: 'Thai',
  vi: 'Vietnamese',
  ms: 'Malay',
};

// 1. Azure Translator → 2. OpenAI Localizer
export async function translateWithAzure(content, targetLanguage) {
  try {
    const response = await axios({
      baseURL: process.env.AZURE_TRANSLATOR_ENDPOINT,
      url: '/translate',
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.AZURE_TRANSLATOR_KEY,
        'Ocp-Apim-Subscription-Region': process.env.AZURE_TRANSLATOR_REGION,
        'Content-type': 'application/json',
      },
      params: {
        'api-version': '3.0',
        to: targetLanguage,
      },
      data: [{ text: content }],
    });

    const translatedText = response.data[0].translations[0].text;
    const culturallyLocalized = await localizeWithOpenAI(translatedText, targetLanguage);
    return culturallyLocalized;
  } catch (error) {
    console.error('Azure Translator Error:', error.response?.data || error.message);
    throw new Error(`Translation failed: ${error.response?.data?.error?.message || error.message}`);
  }
}

// OpenAI localizer
async function localizeWithOpenAI(inputText, targetLanguage) {
 
  const systemPrompt = `
You are an expert in educational content localization and adaptation. Your job is to modify academic text so that it resonates culturally, emotionally, and contextually with students in the target region.

You must:
- Replace cultural references (like trees, animals, food, places) with local equivalents.
- Modify names of countries, crops, festivals, or items to match what is familiar in the target culture.
- Ensure the meaning and learning objective remain unchanged.
- Make the tone natural, age-appropriate, and locally relatable.

📌 Example:
Original (English): "Photosynthesis is the process by which plants like maple and oak trees use sunlight, water, and carbon dioxide to make their own food. Farmers in Canada grow crops that rely on sunlight."

Localized for Indonesia:
"Fotosintesis adalah proses di mana tanaman seperti pohon pisang dan jati menggunakan sinar matahari, air, dan karbon dioksida untuk menghasilkan makanan mereka sendiri. Di Indonesia, petani menanam padi dan sayuran yang membutuhkan cahaya matahari untuk tumbuh dengan baik."

Now, localize the following text for students in ${languageNameMap[targetLanguage] || 'the target culture'}:
`;

  const response = await client.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: inputText }
    ],
    model: modelName,
    temperature: 0.7,
    max_tokens: 2048,
  });

  return response.choices[0].message.content;
}
