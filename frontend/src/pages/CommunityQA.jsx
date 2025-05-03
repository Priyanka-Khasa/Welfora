import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AskQuestion.css';

const CommunityQA = () => {
  const [questions, setQuestions] = useState([]);
  const [newAnswers, setNewAnswers] = useState({}); // Track answer input per question

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const res = await axios.get('https://welfora-1.onrender.com/api/questions');
      setQuestions(res.data);
    } catch (err) {
      console.error('❌ Failed to load questions:', err);
    }
  };

  const vote = async (qid, aid, type) => {
    try {
      await axios.patch(`https://welfora-1.onrender.com/api/questions/${qid}/answers/${aid}/${type}`);
      loadQuestions();
    } catch (err) {
      console.error('❌ Voting failed:', err);
    }
  };

  const handleInput = (qid, value) => {
    setNewAnswers(prev => ({ ...prev, [qid]: value }));
  };

  const postAnswer = async (qid) => {
    const answer = newAnswers[qid]?.trim();
    if (!answer) return;

    try {
      await axios.post(`https://welfora-1.onrender.com/api/questions/${qid}/answers`, { text: answer });
      setNewAnswers(prev => ({ ...prev, [qid]: '' }));
      loadQuestions();
    } catch (err) {
      console.error('❌ Failed to post answer:', err);
    }
  };

  return (
    <div className="community-qa">
      <h2>🧠 Community Knowledge Base</h2>

      {questions.map(q => (
        <div key={q._id} className="qa-item">
          <h4><strong>Q:</strong> {q.text}</h4>

          <p><strong>Answers:</strong></p>
          <ul>
            {q.answers.length > 0 ? (
              q.answers.map((a, idx) => (
                <li key={idx}>
                  <strong>{a.text}</strong>
                  <div style={{ marginTop: '4px' }}>
                    <button onClick={() => vote(q._id, a._id, 'upvote')}>👍 {a.upvotes}</button>
                    <button onClick={() => vote(q._id, a._id, 'downvote')} style={{ marginLeft: '10px' }}>
                      👎 {a.downvotes}
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <li>No answers yet.</li>
            )}
          </ul>

          <input
            type="text"
            placeholder="Write your answer..."
            value={newAnswers[q._id] || ''}
            onChange={(e) => handleInput(q._id, e.target.value)}
            style={{ width: '70%', padding: '6px', marginTop: '10px' }}
          />
          <button onClick={() => postAnswer(q._id)} className="green-btn">Post Answer</button>
        </div>
      ))}
    </div>
  );
};

export default CommunityQA;
