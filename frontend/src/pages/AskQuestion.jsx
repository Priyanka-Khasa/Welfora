import { useState, useEffect } from 'react';
import axios from 'axios';
import './AskQuestion.css';

export default function AskQuestion({ user }) {
  const [text, setText] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answerInputs, setAnswerInputs] = useState({});

  const config = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  };

  const loadQuestions = async () => {
    try {
      const res = await axios.get('https://welfora-1.onrender.com/api/questions');
      setQuestions(res.data.reverse());
    } catch (err) {
      console.error('Error loading questions:', err);
    }
  };

  const submitQuestion = async () => {
    if (!text.trim()) return alert('Please type your question');

    const exists = questions.some(
      (q) => q.text.toLowerCase().trim() === text.toLowerCase().trim()
    );
    if (exists) return alert('Question already exists');

    try {
      await axios.post('https://welfora-1.onrender.com/api/questions', { text }, config);
      setText('');
      loadQuestions();
    } catch (err) {
      console.error('Error submitting question:', err);
    }
  };

  const submitAnswer = async (id) => {
    const answer = answerInputs[id];
    if (!answer?.trim()) return;

    try {
      await axios.post(
        `https://welfora-1.onrender.com/api/questions/${id}/answers`,
        { text: answer },
        config
      );
      setAnswerInputs((prev) => ({ ...prev, [id]: '' }));
      loadQuestions();
    } catch (err) {
      console.error('Error submitting answer:', err);
    }
  };

  const vote = async (qid, aid, type) => {
    try {
      await axios.patch(`https://welfora-1.onrender.com/api/questions/${qid}/answers/${aid}/${type}`);
      loadQuestions();
    } catch (err) {
      console.error('Voting error:', err);
    }
  };

  const verifyAnswer = async (qid, aid) => {
    try {
      await axios.patch(
        `https://welfora-1.onrender.com/api/admin/questions/${qid}/answers/${aid}/verify`,
        {},
        config
      );
      loadQuestions();
    } catch (err) {
      console.error('Verify error:', err);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  return (
    <div className="container">
      <h1>📘 Knowledge Base</h1>

      <div className="ask-box">
        <input
          className="input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your question..."
        />
        <button className="btn" onClick={submitQuestion}>Submit</button>
      </div>

      {text.length > 1 && (
        <div className="suggestions">
          <p>Matching Questions:</p>
          <ul>
            {questions
              .filter((q) => q.text.toLowerCase().includes(text.toLowerCase()))
              .slice(0, 5)
              .map((q, idx) => (
                <li key={idx} onClick={() => {
                  const el = document.getElementById(`q-${q._id}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}>
                  🔍 {q.text}
                </li>
              ))}
          </ul>
        </div>
      )}

      <div className="questions-list">
        {questions.map((q) => (
          <div key={q._id} id={`q-${q._id}`} className="card">
            <h3>Q: {q.text}</h3>
            <p style={{ fontSize: '12px', color: 'gray' }}>asked by {q.user?.name || 'Unknown'}</p>

            <div className="answers">
              <strong>Answers:</strong>
              {q.answers.length > 0 ? (
                <ul>
                  {q.answers.map((a, idx) => (
                    <li key={idx}>
                      {a.text}
                      <p style={{ fontSize: '12px', color: 'gray' }}>
                        answered by {a.user?.name || 'Unknown'}
                        {a.verified && (
                          <span style={{ color: 'green', marginLeft: '8px', fontWeight: 'bold' }}>
                            ✔ Verified
                          </span>
                        )}
                      </p>
                      <div style={{ marginTop: '4px' }}>
                        <button onClick={() => vote(q._id, a._id, 'upvote')}>👍 {a.upvotes}</button>
                        <button onClick={() => vote(q._id, a._id, 'downvote')} style={{ marginLeft: '10px' }}>
                          👎 {a.downvotes}
                        </button>
                        {user?.role === 'admin' && !a.verified && (
                          <button
                            onClick={() => verifyAnswer(q._id, a._id)}
                            style={{
                              marginLeft: '10px',
                              background: 'green',
                              color: 'white',
                              padding: '4px 10px',
                              borderRadius: '4px'
                            }}
                          >
                            ✅ Verify
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No answers yet.</p>
              )}
            </div>

            <div className="answer-box">
              <input
                className="input"
                type="text"
                value={answerInputs[q._id] || ''}
                onChange={(e) => setAnswerInputs({ ...answerInputs, [q._id]: e.target.value })}
                placeholder="Write your answer..."
              />
              <button className="btn" onClick={() => submitAnswer(q._id)}>Post Answer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
