import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import Login from "./components/Login";
import Register from "./pages/Register";
import UsersPage from "./pages/UsersPage";
import UserDetails from "./pages/UserDetails";
import FriendsPage from "./pages/FriendsPage";
import FeedPage from "./pages/FeedPage";
import PostDetailPage from "./pages/PostDetailPage";
import UploadPage from "./pages/UploadPage";
import PostEditPage from "./pages/PostEditPage";
import ProfilePage from "./pages/ProfilePage";
import MessagesPage from "./pages/MessagesPage";
import ConversationPage from "./pages/ConversationPage";
import { getAuthToken } from "./api";
import "./App.css";
import './styles/MobileEnhancements.css';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!getAuthToken();
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  return (
    <>
      <Navbar />
      <div className="app-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/profiles"
            element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/details/:id"
            element={
              <ProtectedRoute>
                <UserDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/friends"
            element={
              <ProtectedRoute>
                <FriendsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <FeedPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/posts/:id"
            element={
              <ProtectedRoute>
                <PostDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <UploadPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages/:userId"
            element={
              <ProtectedRoute>
                <ConversationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/posts/:id/edit"
            element={
              <ProtectedRoute>
                <PostEditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
}

export default App;
