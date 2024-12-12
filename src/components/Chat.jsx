import React, { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import './Chat.css';
import Sidenav from './Sidenav';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const loggedInUserId = Number(localStorage.getItem('userId')) || 1;
  const loggedInUserName = localStorage.getItem('username') || 'User';

  const [fakeChat] = useState([
    {
      id: 1,
      userId: 0,
      text: 'Hej!',
      createdAt: '2024-08-15T11:19:56.240Z',
      avatar: 'https://i.pravatar.cc/100?img=17',
      username: 'Hasse',
    },
    {
      id: 2,
      userId: 0,
      text: 'Det är Hasse här!',
      createdAt: '2024-08-15T11:20:56.240Z',
      avatar: 'https://i.pravatar.cc/100?img=6',
      username: 'Hasse',
    },
    {
      id: 3,
      userId: 0,
      text: 'Ska vi hitta på nåt idag?',
      createdAt: '2024-08-15T11:21:56.240Z',
      avatar: 'https://i.pravatar.cc/100?img=6',
      username: 'Hasse',
    },
  ]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const sanitizedMessage = DOMPurify.sanitize(newMessage);

    const newMsg = {
      id: `${Date.now()}-${Math.random()}`, // Bättre unikt ID
      userId: loggedInUserId,
      text: sanitizedMessage,
      createdAt: new Date().toISOString(),
      avatar: 'https://i.pravatar.cc/100?img=1',
      username: loggedInUserName,
    };

    setMessages((prevMessages) => [...prevMessages, newMsg]);
    setNewMessage('');
  };

  const handleDeleteMessage = (messageId) => {
    setMessages((prevMessages) =>
      prevMessages.filter((message) => message.id !== messageId)
    );
  };

  const allMessages = [...messages, ...fakeChat].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  return (
    <div className="chat-container">
      <Sidenav isChatPage={true} />

      <main className="chat-main">
        <div className="welcome-message">
          <h1>Welcome back, {loggedInUserName || 'User'}!</h1>
        </div>

        <div className="chat-box">
          <ul className="message-list">
            {allMessages.map((message) => (
              <li
                key={message.id}
                className={`message-item ${
                  message.userId === loggedInUserId ? 'my-message' : 'other-message'
                }`}
              >
                {message.userId !== loggedInUserId && (
                  <div className="avatar">
                    <img src={message.avatar} alt="Avatar" />
                  </div>
                )}
                <div
                  className={`message-bubble ${
                    message.userId === loggedInUserId ? 'align-right' : 'align-left'
                  }`}
                >
                  <strong>
                    {message.userId === loggedInUserId ? 'Me' : message.username}:
                  </strong>{' '}
                  {message.text}
                </div>
                {message.userId === loggedInUserId && (
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteMessage(message.id)}
                  >
                    x
                  </button>
                )}
              </li>
            ))}
          </ul>
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="message-form">
          <input
            type="text"
            placeholder="New message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit">Send</button>
        </form>
      </main>
    </div>
  );
};

export default Chat;
