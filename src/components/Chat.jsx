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
    const fetchMessages = async (token, conversationId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/messages/${conversationId}`, {
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
            setMessages(messages);
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
        return fetch(`${API_BASE_URL}/messages/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
               
            },
            body: JSON.stringify({ content: message })
        });
    };

    // Fetch user details
    const fetchUserDetails = async (token, userId) => {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.json();
    };

    // Delete a message
    const deleteMessage = async (messageId, token, csrfToken) => {
        return fetch(`${API_BASE_URL}/messages/${messageId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            }
        });
    };

    // Check token expiration and redirect if needed
    useEffect(() => {
        const checkTokenExpiration = () => {
            if (token) {
                const isTokenExpired = false; // Sätt upp en riktig kontroll för utgång
                if (isTokenExpired) {
                    localStorage.clear();
                    navigate('/login');
                }
            } else {
                navigate('/login');
            }
        };
        checkTokenExpiration();
    }, [navigate, token]);

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
    }, []);

    
    useEffect(() => {
        if (conversationId && token) {
            fetchMessages(token, conversationId);  // Anropa getMessages här
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

        setMessages([...messages, newMessageObject]);

        try {
            const response = await sendMessage(sanitizedMessage, token, csrfToken, conversationId);
            const sentMessage = await response.json();
            setMessages([...messages, sentMessage]);
            setNewMessage('');  // Clear input
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        try {
            // Skicka begäran om att radera ett meddelande
            await deleteMessage(messageId, token, csrfToken);
    
            // Filtrera bort det raderade meddelandet från det lokala meddelandetillståndet
            const updatedMessages = messages.filter(message => message.id !== messageId);
            setMessages(updatedMessages); // Uppdatera meddelandelistan utan det raderade meddelandet
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
                        {messages.map((msg, index) => (
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
                        ))}
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
