import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  text: String,
  user: {
    id: mongoose.Schema.Types.ObjectId,
    name: String,
  },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  verified: { type: Boolean, default: false }, // optional future
  createdAt: { type: Date, default: Date.now },
});

const questionSchema = new mongoose.Schema({
  text: String,
  user: {
    id: mongoose.Schema.Types.ObjectId,
    name: String,
  },
  answers: [answerSchema],
  createdAt: { type: Date, default: Date.now },
});

const Question = mongoose.model('Question', questionSchema);
export default Question;
