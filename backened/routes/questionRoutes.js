import express from 'express';
import Question from '../models/Question.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// ✅ Create new question (auth required)
router.post('/', authMiddleware, async (req, res) => {
  const newQuestion = new Question({
    text: req.body.text,
    user: { id: req.user.id, name: req.user.name },
  });
  await newQuestion.save();
  res.send(newQuestion);
});

// 📥 Get all questions
router.get('/', async (req, res) => {
  const questions = await Question.find();
  res.send(questions);
});

// 📝 Add an answer (auth required)
router.post('/:id/answers', authMiddleware, async (req, res) => {
  const question = await Question.findById(req.params.id);
  if (!question) return res.status(404).send('Question not found');

  question.answers.push({
    text: req.body.text,
    user: { id: req.user.id, name: req.user.name },
  });
  await question.save();
  res.send(question);
});

// 👍 Upvote an answer
router.patch('/:qid/answers/:aid/upvote', async (req, res) => {
  const question = await Question.findById(req.params.qid);
  if (!question) return res.status(404).send('Question not found');

  const answer = question.answers.id(req.params.aid);
  if (!answer) return res.status(404).send('Answer not found');

  answer.upvotes = (answer.upvotes || 0) + 1;
  await question.save();
  res.send(answer);
});

// 👎 Downvote an answer
router.patch('/:qid/answers/:aid/downvote', async (req, res) => {
  const question = await Question.findById(req.params.qid);
  if (!question) return res.status(404).send('Question not found');

  const answer = question.answers.id(req.params.aid);
  if (!answer) return res.status(404).send('Answer not found');

  answer.downvotes = (answer.downvotes || 0) + 1;
  await question.save();
  res.send(answer);
});

export default router;
