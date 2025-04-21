import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFullScreenChat, setIsFullScreenChat] = useState(false);
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);
  const backendUrl = 'http://127.0.0.1:80/';

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = '25px';
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, 25), 180);
      textarea.style.height = `${newHeight}px`;
    }
  }, [question]);

  const handleAskQuestion = async (q) => {
    const query = q || question;
    if (!query) {
      setError('Please enter a question');
      return;
    }
    setLoading(true);
    setError(null);

    const newChat = { question: query, response: null };
    setChatHistory([...chatHistory, newChat]);

    try {
      const res = await axios.post(`${backendUrl}ask`, { question: query });
      const updatedChat = { question: query, response: res.data };
      setChatHistory((prev) => [...prev.slice(0, -1), updatedChat]);
      setQuestion('');
      setIsFullScreenChat(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to get response');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToMain = () => {
    setIsFullScreenChat(false);
  };

  const renderTextAnswer = (text) => {
    if (!text) return <span>No response available</span>;
  
    // Function to parse bold markdown (**text**) and convert to HTML
    const parseMarkdown = (line) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g); // Split by **text**
      return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });
    };
  
    // Convert bullet points (e.g., "- Item") to HTML list
    const lines = text.split('\n');
    let inList = false;
    const elements = [];
    let currentList = [];
  
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        if (!inList) {
          inList = true;
          currentList = [];
        }
        const listItem = trimmedLine.slice(2);
        currentList.push(<span>{parseMarkdown(listItem)}</span>);
      } else {
        if (inList) {
          inList = false;
          elements.push(<ul key={`ul-${index}`} className="bullet-list">{currentList.map((item, i) => <li key={i}>{item}</li>)}</ul>);
        }
        if (trimmedLine) {
          elements.push(<p key={index} className="text-paragraph">{parseMarkdown(trimmedLine)}</p>);
        }
      }
    });
  
    if (inList && currentList.length) {
      elements.push(<ul key="ul-final" className="bullet-list">{currentList.map((item, i) => <li key={i}>{item}</li>)}</ul>);
    }
  
    return elements.length ? elements : <p>{parseMarkdown(text)}</p>;
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <img src="/Assets/logo.png" alt="Logo" />
        </div>
        <div className="header-icons">
          <div className="chatbot">
            <img src="/Assets/AI_ChatBot.png" alt="AI Chatbot" />
          </div>
        </div>
      </header>

      <main className="app-main">
        {isFullScreenChat ? (
          <div className="full-screen-chat">
            <button className="back-btn action-btn" onClick={handleBackToMain}>Back</button>
            <div className="chat-messages full-screen-messages">
              {chatHistory.map((chat, idx) => (
                <div key={idx} className="message-group">
                  <div className="message user-message">
                    <span className="message-content">{chat.question}</span>
                  </div>
                  <div className="message ai-message">
                    <div className="message-content-wrapper">
                      {chat.response ? (
                        <span className="message-content">{renderTextAnswer(chat.response.text_answer)}</span>
                      ) : (
                        <span className="message-content thinking">Thinking...</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="chat-input">
              <textarea
                ref={textareaRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask another question..."
                disabled={loading}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAskQuestion())}
              />
              <button
                onClick={() => handleAskQuestion()}
                disabled={loading}
                className="action-btn send-btn"
              >
                {loading ? <span className="spinner"></span> : <img src="/Assets/send.png" alt="Send" className="send-icon" />}
              </button>
            </div>
            {error && <div className="error-message">{error}</div>}
          </div>
        ) : (
          <>
            <h1>Welcome to Crowe's AI Assistant</h1>
            <h3>I'm here to help you with information about taxation, IPOs, and investing in Malaysia</h3>

            <div className="categories">
              <div className="category">
                <div className="category-header">
                  <img src="/Assets/Taxation.png" alt="Taxation Icon" className="icon" />
                  <h2>Taxation</h2>
                </div>
                <div className="question-box" onClick={() => handleAskQuestion("What are the key takeaways for corporate tax in 2024")}>
                  "What are the key takeaways for corporate tax in 2024"
                </div>
                <div className="question-box" onClick={() => handleAskQuestion("What is the new Indirect Tax rate")}>
                  "What is the new Indirect Tax rate"
                </div>
              </div>

              <div className="category">
                <div className="category-header">
                  <img src="/Assets/IPO.png" alt="IPO Icon" className="icon" />
                  <h2>IPO</h2>
                </div>
                <div className="question-box" onClick={() => handleAskQuestion("What are the key accounting challenges when it comes to an IPO")}>
                  "What are the key accounting challenges when it comes to an IPO"
                </div>
                <div className="question-box" onClick={() => handleAskQuestion("How can Crowe help my company with an IPO")}>
                  "How can Crowe help my company with an IPO"
                </div>
              </div>

              <div className="category">
                <div className="category-header">
                  <img src="/Assets/Investing.png" alt="Investing Icon" className="icon" />
                  <h2>Investing in Malaysia</h2>
                </div>
                <div className="question-box" onClick={() => handleAskQuestion("What is the cost of forming a business in Malaysia")}>
                  "What is the cost of forming a business in Malaysia"
                </div>
                <div className="question-box" onClick={() => handleAskQuestion("What are the tax incentives available when it comes to investing in Malaysia")}>
                  "What are the tax incentives available when it comes to investing in Malaysia"
                </div>
              </div>
            </div>

            <div className="chat-input">
              <textarea
                ref={textareaRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question about taxation, IPOs, or investing in Malaysia..."
                disabled={loading}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAskQuestion())}
              />
              <button
                onClick={() => handleAskQuestion()}
                disabled={loading}
                className="action-btn send-btn"
              >
                {loading ? <span className="spinner"></span> : <img src="/Assets/send.png" alt="Send" className="send-icon" />}
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}
          </>
        )}
      </main>
    </div>
  );
};

export default App;