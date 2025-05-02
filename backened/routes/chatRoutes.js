import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import Question from '../models/Question.js';

dotenv.config();
const router = express.Router();

const libreURL = 'https://translate.argosopentech.com'; // fallback

// Detect language
const detectLanguage = async (text) => {
  try {
    const res = await axios.post(`${libreURL}/detect`, { q: text }, {
      headers: { 'Content-Type': 'application/json' }
    });
    return res.data[0]?.language || 'en';
  } catch (err) {
    console.warn('🌐 Language detection failed:', err.message);
    return 'en'; // fallback to English
  }
};

// Translate
const translateText = async (text, source, target) => {
  try {
    const res = await axios.post(`${libreURL}/translate`, {
      q: text,
      source,
      target,
      format: 'text'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    return res.data.translatedText;
  } catch (err) {
    console.warn('🌐 Translation failed:', err.message);
    return text; // return original if translation fails
  }
};

// POST /api/chat
router.post('/', async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const originalLang = await detectLanguage(prompt);
    const translatedPrompt = originalLang !== 'en'
      ? await translateText(prompt, originalLang, 'en')
      : prompt;

    // Call AI API
    const aiRes = await axios.post(
      'https://api.cohere.ai/v1/generate',
      {
        model: 'command',
        prompt: translatedPrompt,
        max_tokens: 300,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    );

    let responseText = aiRes.data.generations[0]?.text?.trim() || 'No response';
    if (originalLang !== 'en') {
      responseText = await translateText(responseText, 'en', originalLang);
    }

    // Save to DB
    const saved = new Question({
      text: prompt,
      answers: [{ text: responseText }]
    });
    await saved.save();

    res.send({ response: responseText });

  } catch (err) {
    console.error('🌐 Multilingual Chat Error:', err.message);
    res.status(500).send({ error: 'AI/chat error', message: err.message });
  }
});

export default router;
