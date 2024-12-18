import React, { useState, useEffect, useRef, useCallback } from 'react';
import DOMPurify from 'dompurify';
import './Chat.css';
import Sidenav from './Sidenav';

const Chat = () => {
  // State för att hantera meddelanden, användare och fel
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // Hämtar och sparar information om inloggad användare
  const [loggedInUserName, setLoggedInUserName] = useState(localStorage.getItem('userName') || 'User');

  useEffect(() => {
    const userName = localStorage.getItem('userName');
    console.log('Hämtat username:', userName); // Felsökningsrad
    if (userName) {
      setLoggedInUserName(userName);
    }
  }, []);

  const loggedInUserId = Number(localStorage.getItem('userId')) || 1;
  const token = localStorage.getItem('token');
  const activeConversation = localStorage.getItem('activeConversation');

  // Scroll till slutet av meddelandelistan
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Hämtar meddelanden från API
  const fetchMessages = useCallback(async () => {
    if (!activeConversation) return;

    try {
      const response = await fetch(
        `https://chatify-api.up.railway.app/messages?conversationId=${activeConversation}`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) throw new Error('Could not fetch messages');

      const messagesData = await response.json();
      setMessages(messagesData);
      localStorage.setItem('messages', JSON.stringify(messagesData));
    } catch {
      setError('Could not fetch messages');
    }
  }, [activeConversation, token]);

  // Hämta meddelanden vid komponentens första render
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Håll scrollen nere när nya meddelanden läggs till
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Funktion för att skicka meddelanden
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const sanitizedMessage = DOMPurify.sanitize(newMessage);

    try {
      const response = await fetch('https://chatify-api.up.railway.app/messages', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sanitizedMessage, conversationId: activeConversation }),
      });

      if (!response.ok) throw new Error('Message could not be delivered');

      const { latestMessage } = await response.json();
      setMessages((prev) => [
        ...prev,
        { ...latestMessage, userId: loggedInUserId, username: loggedInUserName },
      ]);
      setNewMessage('');
    } catch {
      setError('Message could not be delivered');
    }
  };

  // Funktion för att radera meddelanden
  const handleDeleteMessage = async (messageId) => {
    try {
      const response = await fetch(`https://chatify-api.up.railway.app/messages/${messageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Message could not be deleted');

      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    } catch {
      setError('Message could not be deleted');
    }
  };

  // Kombinerar och sorterar alla meddelanden
  const allMessages = messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return (
    <div className="chat-container">
      <Sidenav isChatPage={true} />

      <main className="chat-main">
        <div className="welcome-message">
          <h1>Welcome back, {loggedInUserName}!</h1>
        </div>

        <div className="chat-box">
          <ul className="message-list">
            {allMessages.map((msg) => (
              <li
                key={msg.id}
                className={`message-item ${msg.userId === loggedInUserId ? 'my-message' : 'other-message'}`}
              >
                {msg.userId !== loggedInUserId && (
                  <div className="avatar">
                    <img src={msg.avatar || 'https://i.pravatar.cc/100'} alt="Avatar" />
                  </div>
                )}
                <div className={`message-bubble ${msg.userId === loggedInUserId ? 'align-right' : 'align-left'}`}>
                  <strong>{msg.userId === loggedInUserId ? 'Me' : msg.username}:</strong> {msg.text}
                </div>
                {msg.userId === loggedInUserId && (
                  <button className="delete-button" onClick={() => handleDeleteMessage(msg.id)}>
                    x
                  </button>
                )}
              </li>
            ))}
          </ul>
          <div ref={messagesEndRef} />
        </div>

        <div className="message-form">
          <input
            type="text"
            placeholder="New message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(e)}
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>

        {error && <div className="error-message">{error}</div>}
      </main>
    </div>
  );
};

export default Chat;
