import './App.css';
import React from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { AuthContextProvider } from './context/AuthContext'  

const App = () => {
  return (
    <AuthContextProvider>
      <Router>
        <Navbar />
        <Routes>
           <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </Router>
    </AuthContextProvider>
  )
}

export default App
