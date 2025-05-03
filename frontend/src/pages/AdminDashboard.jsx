import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [questions, setQuestions] = useState([]);

  const config = {
    headers: {
      Authorization: 'Bearer admin123'
    }
  };

  // ✅ Wrap in useCallback to avoid ESLint warning
  const fetchQuestions = useCallback(async () => {
    try {
      const res = await axios.get('https://welfora-1.onrender.com/api/admin/questions', config);
      setQuestions(res.data);
    } catch (err) {
      console.error('Error fetching questions:', err);
    }
  }, []);

  const deleteQuestion = async (id) => {
    try {
      await axios.delete(`https://welfora-1.onrender.com/api/admin/questions/${id}`, config);
      fetchQuestions();
    } catch (err) {
      console.error('Error deleting question:', err);
    }
  };

  const deleteAnswer = async (qid, aid) => {
    try {
      await axios.delete(`https://welfora-1.onrender.com/api/admin/questions/${qid}/answers/${aid}`, config);
      fetchQuestions();
    } catch (err) {
      console.error('Error deleting answer:', err);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]); // ✅ ESLint safe

  return (
    <div className="admin">
      <h2>🛠️ Admin Dashboard</h2>
      {questions.map((q) => (
        <div key={q._id} className="card">
          <h4>Q: {q.text}</h4>
          <button onClick={() => deleteQuestion(q._id)}>❌ Delete Question</button>
          <ul style={{ marginTop: '8px' }}>
            {q.answers.map((a, idx) => (
              <li key={idx}>
                {a.text}
                <button style={{ marginLeft: '10px' }} onClick={() => deleteAnswer(q._id, a._id)}>
                  Delete Answer
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;
