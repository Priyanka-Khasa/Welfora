import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [questions, setQuestions] = useState([]);

  const config = {
    headers: {
      Authorization: 'Bearer admin123' // 🔐 admin-only token
    }
  };

  const fetchQuestions = async () => {
    const res = await axios.get('http://localhost:5000/api/admin/questions');
    setQuestions(res.data);
  };

  const deleteQuestion = async (id) => {
    await axios.delete(`http://localhost:5000/api/admin/questions/${id}`, config);
    fetchQuestions();
  };

  const deleteAnswer = async (qid, aid) => {
    await axios.delete(`http://localhost:5000/api/admin/questions/${qid}/answers/${aid}`, config);
    fetchQuestions();
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

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
