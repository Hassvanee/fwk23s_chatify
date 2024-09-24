import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidenav from './Sidenav'; 
import './Friends.css'; 

const BASE_URL = 'https://chatify-api.up.railway.app';

// Hämta användarprofil
const fetchUsers = async (token) => {
    try {
        const response = await fetch(`${BASE_URL}/users`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

const Friends = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState(""); // State för sökterm
    const [error, setError] = useState(null); // State för felmeddelande
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        const getUsers = async () => {
            try {
                const users = await fetchUsers(token);
                setUsers(users || []);
            } catch (error) {
                setError('Failed to load users. Please try again.'); // Sätt felmeddelande
                console.error('Error fetching users:', error);
            }
        };

        if (token) {
            getUsers();
        } else {
            navigate('/login'); // Om ingen token finns, omdirigera till inloggning
        }
    }, [token, navigate]);

    const handleUserClick = (userId) => {
        navigate(`/chat/${userId}`);
    };

    // Filtrera användare baserat på sökterm
    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="friends-container">
            <Sidenav isChatPage={true} /> 
            <main className="friends-main">
                <h1>Find Friends</h1>
                <div className="search-container">
                    <input 
                        type="text" 
                        placeholder="Search for friends..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="search-input" 
                    />
                </div>
                {error ? (
                    <p className="error-message">{error}</p>
                ) : (
                    <ul className="friends-list">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <li 
                                    key={user.id} 
                                    className="friend-item" 
                                    onClick={() => handleUserClick(user.id)}
                                >
                                    <div 
                                        className="friend-avatar" 
                                        style={{ backgroundImage: `url(${user.avatarUrl})` }} 
                                    />
                                    <span className="friend-username">{user.username}</span>
                                </li>
                            ))
                        ) : (
                            <p>No users found.</p>
                        )}
                    </ul>
                )}
            </main>
        </div>
    );
};

export default Friends;
