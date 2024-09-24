import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';  
import Chat from './components/Chat';    
import Profile from './components/Profile'; 
import Register from './components/Register';
import Friends from './components/Friends';

const App = () => {
  const [token, setToken] = useState(null);  // Håll koll på inloggningsstatusen med token

  // Hämta token från localStorage vid initial rendering
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Registreringssidan */}
          <Route
            path="/register"
            element={<Register setToken={setToken} />}
          />
          {/* Inloggningssidan */}
          <Route
            path="/login"
            element={<Login setToken={setToken} />}
          />
          {/* Friends-sidan */}
          <Route
            path="/friends"
            element={token ? <Friends /> : <Navigate to="/login" />}
          />
          {/* Chatt-sidan */}
          <Route
            path="/chat"
            element={token ? <Chat setToken={setToken} /> : <Navigate to="/login" />}
          />
          {/* Profil-sidan */}
          <Route
            path="/profile"
            element={token ? <Profile /> : <Navigate to="/login" />} // Skydda profil-sidan med token
          />
          {/* Hem-/Start-sidan */}
          <Route
            path="/"
            element={token ? <Navigate to="/chat" /> : <Navigate to="/login" />}
          />
          {/* Fallback för okända sidor */}
          <Route
            path="*"
            element={<Navigate to="/" />}
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
