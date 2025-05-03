import React, { useState, useEffect } from 'react';
import AskQuestion from './pages/AskQuestion';
import ChatBot from './pages/ChatBot';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('ask');
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('user');
    if (token && userInfo) {
      setUser(JSON.parse(userInfo));
    }

    // Restore theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.body.className = savedTheme;
  }, []);

  const logout = () => {
    localStorage.clear();
    setUser(null);
    toast.success("Logged out successfully!");
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.className = newTheme;
  };

  if (!user) return <LoginPage onLogin={setUser} />;

  return (
    <>
      <div className="main-container">
        <div className="tab-header">
          {/* Left: Logo */}
          <div className="tab-left">
            <span className="logo">🧠 Welfora</span>
          </div>

          {/* Center: Navigation Tabs */}
          <div className="tab-center">
            <button
              title="Post or browse scheme-related questions"
              className={activeTab === 'ask' ? 'active' : ''}
              onClick={() => setActiveTab('ask')}
            >
              Ask / Answer
            </button>
            <button
              title="Chat with AI to get instant help"
              className={activeTab === 'chat' ? 'active' : ''}
              onClick={() => setActiveTab('chat')}
            >
              PriyankaGPT Chatbot
            </button>
            <button
              title="View analytics and usage trends"
              className={activeTab === 'dashboard' ? 'active' : ''}
              onClick={() => setActiveTab('dashboard')}
            >
              📊 Dashboard
            </button>
            {user.role === 'admin' && (
              <button
                title="Moderate answers and manage users"
                className={activeTab === 'admin' ? 'active' : ''}
                onClick={() => setActiveTab('admin')}
              >
                🛠️ Admin Panel
              </button>
            )}
          </div>

          {/* Right: User Info + Theme + Logout */}
          <div className="tab-right">
            <span className="welcome-text">
              Welcome, {user.name} ({user.role})
            </span>
            <button onClick={toggleTheme} className="theme-toggle" title="Toggle light/dark mode">
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </div>

        <div className="tab-content">
          {activeTab === 'ask' && <AskQuestion user={user} />}
          {activeTab === 'chat' && <ChatBot />}
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'admin' && <AdminDashboard />}
        </div>
      </div>

      {/* Toast messages */}
      <ToastContainer position="top-center" autoClose={2000} />
    </>
  );
}

export default App;
