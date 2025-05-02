import express from 'express';
import Question from '../models/Question.js';
import { Parser } from 'json2csv';

const router = express.Router();

// 📤 Export Q&A as CSV
router.get('/csv', async (req, res) => {
  try {
    const questions = await Question.find();

    const rows = [];
    questions.forEach(q => {
      if (q.answers.length === 0) {
        rows.push({ question: q.text, answer: '' });
      } else {
        q.answers.forEach(a => {
          rows.push({ question: q.text, answer: a.text });
        });
      }
    });

    const parser = new Parser({ fields: ['question', 'answer'] });
    const csv = parser.parse(rows);

    res.header('Content-Type', 'text/csv');
    res.attachment('knowledge_export.csv');
    res.send(csv);

  } catch (err) {
    console.error('Export CSV error:', err.message);
    res.status(500).send({ error: 'Export failed', message: err.message });
  }
});

export default router;
