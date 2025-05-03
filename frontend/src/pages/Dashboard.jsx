import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';
import Loader from './Loader';


const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    axios.get('http://localhost:5000/api/dashboard')
      .then(res => setStats(res.data))
      .catch(err => console.error('Dashboard error', err));

    // Sync with body class
    setTheme(document.body.classList.contains('dark') ? 'dark' : 'light');
  }, []);

  if (!stats) return <Loader />;

  const textColor = theme === 'dark' ? '#f0f0f0' : '#111';
  const barColor = theme === 'dark' ? '#00e676' : '#4caf50';

  return (
    <div className="dashboard-container">
      <h2 style={{ color: textColor }}>📊 Platform Dashboard</h2>
      <p style={{ color: textColor }}><strong>Total Questions:</strong> {stats.totalQuestions}</p>
      <p style={{ color: textColor }}><strong>Total Answers:</strong> {stats.totalAnswers}</p>

      <h4 style={{ color: textColor }}>🔥 Top 5 Questions by Answer Count</h4>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={stats.topQuestions}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#333' : '#ccc'} />
          <XAxis 
            dataKey="text"
            tick={{ fontSize: 12, fill: textColor }}
            interval={0}
            angle={-15}
            textAnchor="end"
          />
          <YAxis tick={{ fill: textColor }} />
          <Tooltip
            contentStyle={{ backgroundColor: theme === 'dark' ? '#333' : '#fff', color: textColor }}
            labelStyle={{ color: textColor }}
            itemStyle={{ color: textColor }}
          />
          <Bar dataKey="count" fill={barColor} />
        </BarChart>
      </ResponsiveContainer>

      <h4 style={{ color: textColor }}>🏆 Top Answer</h4>
      <p style={{ color: textColor }}>{stats.topAnswer?.text} ({stats.topAnswer?.upvotes} upvotes)</p>
    </div>
  );
};

export default Dashboard;
