import React, { useState, useEffect } from 'react';
import Sidenav from './Sidenav'; 
import './profile.css'; 

const UserProfile = () => {
    const userName = localStorage.getItem('userName');
    const avatar = localStorage.getItem('avatar');

    return (
        <div className="user-profile">
            {avatar && <img src={avatar} alt={`${userName}'s avatar`} />}
            <p>{userName}</p>
        </div>
    );
};

const BASE_URL = 'https://chatify-api.up.railway.app';

const Profile = () => {
    const [user, setUser] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('token'); // Hämta token från localStorage

    useEffect(() => {
        const savedUserName = localStorage.getItem('userName'); // Hämta användarnamn
        const savedEmail = localStorage.getItem('email'); // Hämta e-post
        const savedAvatar = localStorage.getItem('avatar'); // Hämta avatar

        if (savedUserName && savedEmail) {
            setUser({
                username: savedUserName,
                email: savedEmail,
                avatar: savedAvatar
            });
            setLoading(false);
        } else {
            fetchProfile(); // Hämta från API om inga data finns
        }
    }, [token]);

    // Hämta profil från API
    const fetchProfile = async () => {
        if (!token) {
            setLoading(false);
            return; // Ingen token, inget API-anrop
        }

        try {
            const response = await fetch(`${BASE_URL}/users/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch profile');
            }

            const data = await response.json();
            setUser(data);
            // Spara användardata i localStorage om det behövs
            localStorage.setItem('userName', data.username);
            localStorage.setItem('email', data.email);
            localStorage.setItem('avatar', data.avatar);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setError('An error occurred while fetching profile.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading...</div>; // Tydlig laddningsindikator
    }

    if (error) {
        return <div className="error">{error}</div>; // Felmeddelande
    }

    if (!user) {
        return <div>No user data available</div>; // Om ingen användardata finns
    }

    return (
        <div className="profile-container">
            <Sidenav isChatPage={true} />
            <div className="profile-box">
                <h1 className="profile-heading">Profile</h1>
                {user.avatar && <img src={user.avatar} alt="Profile" className="profile-avatar" />}
                <p className="profile-info"><strong>Username:</strong> {user.username}</p> {/* Använd rätt namn */}
                <p className="profile-info"><strong>Email:</strong> {user.email}</p> {/* Använd rätt namn */}
                <button className="profile-button" onClick={() => console.log('Settings clicked')}>Settings</button>
            </div>
        </div>
    );
};

export default Profile;
