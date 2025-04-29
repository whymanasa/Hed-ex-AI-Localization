// services/translator.js

import axios from 'axios';

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

    return response.data[0].translations[0].text;
  } catch (error) {
    console.error('Azure Translator Error:', error.response?.data || error.message);
    throw new Error('Translation failed');
  }
}
