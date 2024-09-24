import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidenav.css'; 

const Sidenav = () => {
    const [isOpen, setIsOpen] = useState(false); // Menyn är stängd som standard
    const navigate = useNavigate();

    const token = localStorage.getItem('token');

    if (!token) return null; 

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleProfileRedirect = () => {
        navigate('/profile');
    };

    const handleFriendsRedirect = () => {
        navigate('/friends');
    };

    const handleChatRedirect = () => {
        navigate('/chat');
    };

    const toggleMenu = () => {
        setIsOpen(!isOpen); // Toggla menyöppningen
    };

    return (
        <div className="container">
            {/* Hamburgerikon som alltid visas */}
            <div className="hamburger-icon" onClick={toggleMenu}>
                &#9776; {/* Unicode för hamburgerikon */}
            </div>

            {/* Själva menyn */}
            <div className={`sidenav ${isOpen ? 'open' : ''}`}>
                <nav className="sidenav-nav">
                    <ul>
                        <li><button onClick={handleProfileRedirect}>Profile</button></li>
                        <li><button onClick={handleChatRedirect}>Chat</button></li>
                        <li><button onClick={handleFriendsRedirect}>Find Friends</button></li>
                        <li><button onClick={handleLogout}>Logout</button></li>
                    </ul>
                </nav>
            </div>
        </div>
    );
};

export default Sidenav;
