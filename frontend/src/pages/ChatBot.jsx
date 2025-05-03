import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ChatBot.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import html2pdf from 'html2pdf.js';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const mic = SpeechRecognition ? new SpeechRecognition() : null;

export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [theme, setTheme] = useState('light');
  const [typingText, setTypingText] = useState('');
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const id = Date.now().toString();
    setSessionId(id);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingText]);

  useEffect(() => {
    if (!sessionId || messages.length === 0) return;
    const newHistory = [...(JSON.parse(localStorage.getItem('chatHistory') || '[]'))];
    const existingIndex = newHistory.findIndex(h => h.id === sessionId);
    const sessionData = { id: sessionId, title: messages[0]?.text?.slice(0, 20), messages };

    if (existingIndex >= 0) newHistory[existingIndex] = sessionData;
    else newHistory.push(sessionData);

    localStorage.setItem('chatHistory', JSON.stringify(newHistory));
    setHistory(newHistory);
  }, [messages]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    setHistory(saved);
  }, [sessionId]);
  

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newUserMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setLoading(true);
    setTypingText('');

    try {
      const res = await axios.post('http://localhost:5000/api/chat', { prompt: input });
      const responseText = res.data.response || 'No reply';

      let currentIndex = 0;
      const typingInterval = setInterval(() => {
        setTypingText(responseText.slice(0, currentIndex + 1));
        currentIndex++;
        if (currentIndex === responseText.length) {
          clearInterval(typingInterval);
          setMessages(prev => [...prev, { role: 'ai', text: responseText }]);
          setTypingText('');
          setLoading(false);
        }
      }, 15);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: '⚠️ Error fetching response' }]);
      setLoading(false);
    }
  };

  const handleDelete = index => {
    setMessages(prev => prev.filter((_, i) => i !== index));
  };

  const handleHistoryDelete = id => {
    const updated = history.filter(h => h.id !== id);
    localStorage.setItem('chatHistory', JSON.stringify(updated));
    setHistory(updated);
    if (id === sessionId) {
      setMessages([]);
      setSessionId(Date.now().toString());
    }
  };

  const loadHistory = chat => {
    setMessages(chat.messages);
    setSessionId(chat.id);
  };

  const handleImageUpload = event => {
    const file = event.target.files[0];
    if (!file) return;
    const newUserMessage = { role: 'user', text: `Uploaded: ${file.name}` };
    setMessages(prev => [...prev, newUserMessage]);
  };

  const exportToTxt = () => {
    const text = messages.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPdf = () => {
    const container = document.getElementById('chat-export');
    html2pdf().from(container).save('chat.pdf');
  };

  const startVoiceInput = () => {
    if (!mic) return alert('🎤 Voice recognition not supported in this browser.');
    const langChoice = prompt('🎙️ Speak in:\n1. English\n2. Hindi\n3. Marathi', '1');
    let langCode = 'en-US';
    if (langChoice === '2') langCode = 'hi-IN';
    else if (langChoice === '3') langCode = 'mr-IN';

    mic.lang = langCode;
    mic.interimResults = false;
    mic.start();

    mic.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      setInput(spokenText);
    };

    mic.onerror = (event) => {
      alert('🎤 Mic Error: ' + event.error);
    };
  };

  const speakText = (text) => {
    const synth = window.speechSynthesis;
    if (synth.speaking) synth.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-IN';
    utter.rate = 1;
    utter.pitch = 1;

    synth.speak(utter);
  };

  return (
    <div className={`chat-ui-container ${theme}`}>
      <div className="chat-header">
        <span className="menu-btn" onClick={() => setShowSidebar(prev => !prev)}>☰</span>
        PriyankaGPT
        <div>
          <button className="theme-btn" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? 'Night Mode' : 'Day Mode'}
          </button>
          <button className="theme-btn" onClick={exportToTxt}>📄 .txt</button>
          <button className="theme-btn" onClick={exportToPdf}>🧾 PDF</button>
        </div>
      </div>

      <div className="chat-main">
        {showSidebar && (
          <div className="sidebar">
            <h4>History</h4>
            <ul>
              {history.map(h => (
                <li key={h.id}>
                  <span onClick={() => loadHistory(h)}>🟢 {h.title || 'Untitled'}</span>
                  <button className="history-delete" onClick={() => handleHistoryDelete(h.id)}>✖️</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="chat-area">
          <div className="chat-box" id="chat-export">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.role === 'user' ? 'left' : 'right'}`}>
                <div className="bubble">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                  {msg.role === 'ai' && (
                    <button className="speak-btn" onClick={() => speakText(msg.text)}>🔊</button>
                  )}
                  <span className="delete" onClick={() => handleDelete(index)}>✖️</span>
                </div>
              </div>
            ))}

            {typingText && (
              <div className="message right">
                <div className="bubble typing">{typingText}</div>
              </div>
            )}

            {loading && !typingText && <div className="loading-msg">Typing...</div>}
            <div ref={chatEndRef} />
          </div>

          <div className="input-box">
            <input
              type="text"
              value={input}
              placeholder="Type or speak your question..."
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />
            <button className="upload-btn" onClick={() => fileInputRef.current.click()}>➕</button>
            {mic && (
              <button className="upload-btn" onClick={startVoiceInput}>🎤</button>
            )}
            <button onClick={sendMessage}>➡️</button>
          </div>
        </div>
      </div>
    </div>
  );
}
