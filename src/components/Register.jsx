import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const BASE_URL = 'https://chatify-api.up.railway.app';

// Hämta CSRF-token
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

// Registrera användare
const registerUser = async (username, email, password, csrfToken) => {
    try {
        const response = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'X-CSRF-Token': csrfToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
        });

        const responseBody = await response.text();

        if (!response.ok) {
            console.error('Failed to register user. Status:', response.status, 'Response:', responseBody);
            throw new Error(responseBody); // Visa felmeddelandet från API:et
        }

        return JSON.parse(responseBody); // Returnera JSON
    } catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
};

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    // Hantera registrering
    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const csrfToken = await getCSRFToken(); // Hämta CSRF-token
            await registerUser(username, email, password, csrfToken); // Registrera användare

            setSuccess('Registration successful! Redirecting to login...');
            setError(null);

            // Återställ formuläret efter lyckad registrering
            setUsername('');
            setEmail('');
            setPassword('');

            // Omdirigera till inloggningssidan efter 2 sekunder
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            setError(error.message); // Visa felmeddelandet från API:et, t.ex. "Username or email already exists"
            setSuccess(null);
        }
    };

    return (
        <div className="register-container">
            <form onSubmit={handleRegister} className="register-form">
                <h2>Register</h2>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Register</button>

                {error && (
                    <div>
                        <p className="error">{error}</p>
                    </div>
                )}
                {success && (
                    <div className="success-message">
                        <p>{success}</p>
                    </div>
                )}
                <button type="button" onClick={() => navigate('/login')} className="login-button">
                    Already have an account? Login here
                </button>
            </form>
        </div>
    );
};

export default Register;
