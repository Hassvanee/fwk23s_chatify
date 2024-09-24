import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({ setToken }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const BASE_URL = 'https://chatify-api.up.railway.app';

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/chat');
        }
    }, [navigate]);

    const getCSRFToken = async () => {
        try {
            const response = await fetch(`${BASE_URL}/csrf`, { method: 'PATCH' });
            if (!response.ok) {
                throw new Error('Failed to fetch CSRF token');
            }
            const data = await response.json();
            return data.csrfToken;
        } catch (error) {
            console.error('Error fetching CSRF token:', error);
            throw error;
        }
    };

    const loginUser = async (username, password, csrfToken) => {
        try {
            const response = await fetch(`${BASE_URL}/auth/token`, {
                method: 'POST',
                headers: {
                    'X-CSRF-Token': csrfToken,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to login');
            }
            return await response.json();
        } catch (error) {
            console.error('Error logging in user:', error);
            throw error;
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const csrfToken = await getCSRFToken();
            const response = await loginUser(username, password, csrfToken);
            if (response && response.token) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('userId', response.userId);
                localStorage.setItem('userName', response.username);
                localStorage.setItem('email', response.email);
                localStorage.setItem('avatar', response.avatar);
                
                setToken(response.token);
                navigate('/chat');
            } else {
                throw new Error('Invalid credentials');
            }
        } catch (error) {
            setError(error.message);
        }
    };

    const handleRegisterRedirect = () => {
        navigate('/register');
    };

    return (
        <div className="login-container">
            <form onSubmit={handleLogin} className="login-form">
                <h2>Login</h2>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
                {error && <p className="error">{error}</p>}
                <button type="button" onClick={handleRegisterRedirect} className="register-button">
                    Register here
                </button>
            </form>
        </div>
    );
};

export default Login;
