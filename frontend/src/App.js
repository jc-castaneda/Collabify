import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProfileList from './pages/ProfileList';
import FriendRequests from './components/FriendRequests';
import LandingPage from './pages/LandingPage';
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="app-container">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/profiles" element={<ProfileList />} />
          <Route path="/friends" element={<FriendRequests />} />
          <Route path="/messages" element={<div>Messages Coming Soon</div>} />
          <Route path="/upload" element={<div>Upload Music Coming Soon</div>} />
          <Route path="/profile" element={<div>Your Profile</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;