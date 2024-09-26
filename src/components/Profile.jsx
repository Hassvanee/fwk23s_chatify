import React, { useState, useEffect } from 'react';
import Sidenav from './Sidenav';
import './profile.css';

const BASE_URL = 'https://chatify-api.up.railway.app';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false); // För att styra visning av modal
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
            const fetchProfile = async () => {
                if (!token) {
                    setLoading(false);
                    return; // Ingen token, inget API-anrop
                }

                try {
                    const response = await fetch(`${BASE_URL}/users/me`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (!response.ok) {
                        throw new Error('Failed to fetch profile');
                    }

                    const data = await response.json();

                    setUser(data);

                    // Spara användardata i localStorage om det behövs
                    localStorage.getItem('userName', data.username);
                    localStorage.getItem('email', data.email);
                    localStorage.getItem('avatar', data.avatar);
                } catch (error) {
                    console.error('Error fetching profile:', error);
                    setError('An error occurred while fetching profile.');
                } finally {
                    setLoading(false);
                }
            };

            fetchProfile(); // Anropa funktionen
        }
    }, [token]); // token är det enda beroendet

    const deleteAccount = async () => {
        if (!token) {
            console.error('No token found, cannot delete account.');
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/users/me`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete account');
            }

            // Rensa localStorage och eventuellt omdirigera användaren
            localStorage.removeItem('token');
            localStorage.removeItem('userName');
            localStorage.removeItem('email');
            localStorage.removeItem('avatar');

            alert('Your account has been deleted successfully.'); // Informera användaren
            // Om du vill omdirigera användaren kan du använda:
            // window.location.href = '/login'; // Eller en annan lämplig rutt
        } catch (error) {
            console.error('Error deleting account:', error);
            setError('An error occurred while deleting your account.');
        }
    };

    const handleDeleteClick = () => {
        setShowModal(true); // Visa modal när användaren klickar på delete
    };

    const handleConfirmDelete = () => {
        deleteAccount(); // Anropa deleteAccount när användaren bekräftar
        setShowModal(false); // Stäng modal
    };

    const handleCancelDelete = () => {
        setShowModal(false); // Stäng modal om användaren avbryter
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
        <div className="profile-box">
            <Sidenav isChatPage={true} />
            <h1 className="profile-heading">Profile</h1>

            <div className="user-info">
                {user.avatar && (
                    <img
                        src={'https://i.pravatar.cc/200'}
                        alt={`${user.username}'s avatar`}
                        className="user-avatar-top"/>
                )}
                <p className="profile-info"><strong>Username:</strong> {user.username}</p>
                <p className="profile-info"><strong>Email:</strong> {user.email}</p>
                <button className="profile-button" onClick={() => console.log('Settings clicked')}>Settings</button>
                <button className="profile-button delete-button" onClick={handleDeleteClick}>Delete Account</button>
            </div>

            {/* Modal för bekräftelse av radering */}
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Do you want to delete your account?</h2>
                        <button className="modal-button confirm" onClick={handleConfirmDelete}>Yes</button>
                        <button className="modal-button cancel" onClick={handleCancelDelete}>No</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
