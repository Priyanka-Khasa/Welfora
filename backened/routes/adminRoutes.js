import express from 'express';
import Question from '../models/Question.js';

const router = express.Router();

// ✅ Simple role-based middleware (hardcoded token for now)
const isAdmin = (req, res, next) => {
  const token = req.headers.authorization;
  if (token !== 'Bearer admin123') {
    return res.status(403).send({ error: 'Not authorized' });
  }
  next();
};

// 🔍 Get all questions with answers
router.get('/questions', async (req, res) => {
  const questions = await Question.find().sort({ createdAt: -1 });
  res.json(questions);
});

// ❌ Delete a full question (admin only)
router.delete('/questions/:id', isAdmin, async (req, res) => {
  await Question.findByIdAndDelete(req.params.id);
  res.send({ message: 'Question deleted' });
});

// ❌ Delete an answer from a question (admin only)
router.delete('/questions/:qid/answers/:aid', isAdmin, async (req, res) => {
  const question = await Question.findById(req.params.qid);
  if (!question) return res.status(404).send('Question not found');

  question.answers = question.answers.filter(a => a._id.toString() !== req.params.aid);
  await question.save();
  res.send({ message: 'Answer deleted' });
});
// ✅ Verify an answer (admin only)
router.patch('/questions/:qid/answers/:aid/verify', isAdmin, async (req, res) => {
  const question = await Question.findById(req.params.qid);
  if (!question) return res.status(404).send('Question not found');

  const answer = question.answers.id(req.params.aid);
  if (!answer) return res.status(404).send('Answer not found');

  answer.verified = true;
  await question.save();
  res.send({ message: 'Answer verified', answer });
});


export default router;
