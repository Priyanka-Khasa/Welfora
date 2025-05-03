import React, { useState } from 'react';
import axios from 'axios';
import './ChatBot.css';

const backendURL = 'https://welfora-1.onrender.com';

const LoginPage = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'agent',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const { email, password, name } = form;
    if (!email || !password || (isRegister && !name)) {
      return setMessage('⚠️ Please fill all required fields.');
    }

    const url = isRegister
      ? `${backendURL}/api/auth/register`
      : `${backendURL}/api/auth/login`;

    try {
      const res = await axios.post(url, form);

      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        onLogin(res.data.user);
      } else {
        setMessage(res.data.message || '✔️ Registered! Please log in.');
        if (isRegister) setIsRegister(false);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || '❌ Something went wrong');
    }
  };

  return (
    <div className="auth-container">
      <h2>{isRegister ? 'Register' : 'Login'} as {form.role}</h2>

      {isRegister && (
        <>
          <label>Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            value={form.name}
            onChange={handleChange}
          />
        </>
      )}

      <label>Email</label>
      <input
        type="email"
        name="email"
        placeholder="Enter email"
        value={form.email}
        onChange={handleChange}
      />

      <label>Password</label>
      <div className="password-wrapper">
        <input
          type={showPassword ? 'text' : 'password'}
          name="password"
          placeholder="Enter password"
          value={form.password}
          onChange={handleChange}
        />
        <span onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? '🙈' : '👁️'}
        </span>
      </div>

      {isRegister && (
        <>
          <label>Role</label>
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="agent">Agent</option>
            <option value="admin">Admin</option>
          </select>
        </>
      )}

      <button onClick={handleSubmit}>{isRegister ? 'Register' : 'Login'}</button>

      {message && <p className="message">{message}</p>}

      <p className="switch">
        {isRegister ? 'Already have an account?' : 'No account?'}{' '}
        <span onClick={() => { setIsRegister(!isRegister); setMessage(''); }}>
          {isRegister ? 'Login' : 'Register'}
        </span>
      </p>
    </div>
  );
};

export default LoginPage;
