// services/azureTranslator.js

import axios from 'axios';

const languageNameMap = {
  tl: 'Tagalog (Filipino)',
  id: 'Bahasa Indonesia',
  th: 'Thai',
  vi: 'Vietnamese',
  ms: 'Malay',
};

// Step 1: Translate using Azure Translator
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
    

    // Step 2: Culturally localize using Azure OpenAI
    const culturallyLocalized = await localizeWithOpenAI(translatedText, targetLanguage);
    console.log(culturallyLocalized);
    return culturallyLocalized;
   
  } catch (error) {
    console.error('Azure Translator Error:', error.response?.data || error.message);
    console.error('Error details:', {
      status: error.response?.status,
      headers: error.response?.headers,
      data: error.response?.data
    });
    throw new Error(`Translation failed: ${error.response?.data?.error?.message || error.message}`);
  }
}

// Step 2 Helper Function — Localize with Azure OpenAI
async function localizeWithOpenAI(translatedText, language) {
  try {
    const endpoint = `https://hedex-gpt4o-openai.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2025-01-01-preview`
    const headers = {
      'Content-Type': 'application/json',
      'api-key': process.env.AZURE_OPENAI_KEY,
    };

    const systemPrompt = `
You are an expert in educational content localization and adaptation. Your task is to adjust the following academic text so it is culturally and contextually relevant for students in ${languageNameMap[language] || 'the target culture'}.

Your localization should include:
- Substituting cultural references with local equivalents (e.g., animals, places, food, festivals).
- Adapting terminology to align with the target culture's language usage.
- Modifying examples to fit the context of the local culture.
- Ensuring that the original message and learning objective remain intact while making it sound natural and engaging for the local audience.

Example:
"The tall oak trees in Europe are essential for forests and can be seen during autumn."
Localized: "Di Indonesia, pohon jati tinggi sangat penting untuk hutan, terutama saat musim hujan."

Now, please localize the following text for students in ${languageNameMap[language] || 'the target culture'}:
`;

    const data = {
      model: process.env.AZURE_OPENAI_MODEL, // ✅ REQUIRED FIELD
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: translatedText },
      ],
      temperature: 0.7,
    };

    const response = await axios.post(endpoint, data, { headers });
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Azure OpenAI Error:', error.response?.data || error.message);
    throw new Error(`Cultural localization failed: ${error.response?.data?.error?.message || error.message}`);
  }
}
