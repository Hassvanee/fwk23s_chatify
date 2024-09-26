import React, { useState, useEffect } from 'react';  
import { useNavigate } from 'react-router-dom';
import Sidenav from './Sidenav';
import './Chat.css';

const API_BASE_URL = 'https://chatify-api.up.railway.app';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [csrfToken, setCsrfToken] = useState('');
    const [loggedInUserName, setLoggedInUserName] = useState('');
    const [chatPartnerName, setChatPartnerName] = useState('');
    const [conversationId, setConversationId] = useState(crypto.randomUUID()); 
    const navigate = useNavigate();
    const token = localStorage.getItem('token') || '';

    // Fetch all messages for a conversation
    const fetchMessages = async (token) => {
        try {
            const response = await fetch(`${API_BASE_URL}/messages?conversationId=${conversationId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                const text = await response.text();
                console.error('Error response:', text);
                throw new Error(`Failed to fetch messages: ${response.status} - ${text}`);
            }
            const messages = await response.json();
            console.log('Fetched messages:', messages); // Logga de hämtade meddelandena
            setMessages(messages);
            localStorage.setItem('messages', JSON.stringify(messages)); // Spara meddelanden i localStorage
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    // Fetch CSRF token
    const getCSRFToken = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/csrf-token`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                const text = await response.text();
                console.error('Error fetching CSRF token:', text);
                throw new Error('Failed to fetch CSRF token');
            }
            const data = await response.json();
            return data.csrfToken;
        } catch (error) {
            console.error('Error fetching CSRF token:', error);
            throw error;
        }
    };

    // Send message to API
    const sendMessage = async (message) => {
        try {
            const response = await fetch(`${API_BASE_URL}/messages/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: message, conversationId }) // Inkludera conversationId
            });
            if (!response.ok) {
                const text = await response.text();
                console.error('Error sending message:', text);
                throw new Error(`Failed to send message: ${response.status} - ${text}`);
            }
            const sentMessage = await response.json();
            setMessages(prevMessages => [...prevMessages, sentMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    // Fetch user details
    const fetchUserDetails = async (token, userId) => {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.json();
    };

    // Delete a message
    const deleteMessage = async (messageId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/messages/${messageId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) {
                const text = await response.text();
                console.error('Error deleting message:', text);
                throw new Error(`Failed to delete message: ${response.status} - ${text}`);
            }
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    // Fetch user details and conversations
    useEffect(() => {
        const getUserDetails = async () => {
            try {
                const loggedInUser = await fetchUserDetails(token, 'currentUserId');
                setLoggedInUserName(loggedInUser.username);

                const chatPartner = await fetchUserDetails(token, 'chatPartnerId');
                setChatPartnerName(chatPartner.username);
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };

        if (token) {
            getUserDetails();
        }
    }, [token]);

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const csrfToken = await getCSRFToken();
                setCsrfToken(csrfToken);
            } catch (error) {
                console.error('Error fetching CSRF token:', error);
            }
        };
        fetchToken();
    }, [token]);

    useEffect(() => {
        if (conversationId && token) {
            fetchMessages(token);  // Anropa fetchMessages här
        }
    }, [conversationId, token]);

    // Sanitize input message
    const sanitizeMessage = (message) => {
        const tempDiv = document.createElement('div');
        tempDiv.textContent = message;
        return tempDiv.innerHTML;
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;

        const sanitizedMessage = sanitizeMessage(newMessage);
        const newMessageObject = { sender: loggedInUserName, content: sanitizedMessage };

        setMessages(prevMessages => [...prevMessages, newMessageObject]);

        try {
            await sendMessage(sanitizedMessage);
            setNewMessage('');  // Clear input
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        try {
            // Skicka begäran om att radera ett meddelande
            await deleteMessage(messageId);
    
            // Filtrera bort det raderade meddelandet från det lokala meddelandetillståndet
            setMessages(prevMessages => prevMessages.filter(message => message.id !== messageId));
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };
    
    return (
        <div className="chat-container">
            <Sidenav isChatPage={true} />
            <main className="chat-main">
                <div className="welcome-message">
                    <h1>Welcome back, {loggedInUserName || 'User'}!</h1>
                </div>
                <h2>Chat with {chatPartnerName || 'User'}</h2>

                <div className="chat-box">
                    <ul className="message-list">
                        {messages.map((msg, index) => {
                            // Säkerställ att msg är definierad och har egenskapen sender
                            if (!msg || !msg.sender) {
                                console.error('Invalid message data:', msg);
                                return null; // Hoppa över ogiltiga meddelanden
                            }

                            return (
                                <li
                                    key={index}
                                    className={`message-item ${msg.sender === loggedInUserName ? 'my-message' : 'other-message'}`}
                                >
                                    <div className={`message-bubble ${msg.sender === loggedInUserName ? 'align-right' : 'align-left'}`}>
                                        <strong>{msg.sender === loggedInUserName ? 'Me' : msg.sender}: </strong>{msg.content}
                                    </div>
                                    {msg.sender === loggedInUserName && (
                                        <button onClick={() => handleDeleteMessage(msg.id)}>Delete</button>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <form onSubmit={handleSendMessage} className="message-form">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message"
                    />
                    <button type="submit">Send</button>
                </form>
            </main>
        </div>
    );
};

export default Chat;
