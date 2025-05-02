import express from 'express';
import Question from '../models/Question.js';

const router = express.Router();

// 📊 GET /api/dashboard – returns usage stats
router.get('/', async (req, res) => {
  try {
    const questions = await Question.find();

    const totalQuestions = questions.length;
    const totalAnswers = questions.reduce((sum, q) => sum + q.answers.length, 0);

    const topQuestions = questions
      .sort((a, b) => b.answers.length - a.answers.length)
      .slice(0, 5)
      .map(q => ({
        text: q.text,
        count: q.answers.length
      }));

    let topAnswer = null;
    questions.forEach(q => {
      q.answers.forEach(a => {
        if (!topAnswer || (a.upvotes || 0) > (topAnswer.upvotes || 0)) {
          topAnswer = { text: a.text, upvotes: a.upvotes || 0 };
        }
      });
    });

    res.json({
      totalQuestions,
      totalAnswers,
      topQuestions,
      topAnswer
    });

  } catch (err) {
    res.status(500).json({ error: 'Dashboard error', message: err.message });
  }
});

export default router;
