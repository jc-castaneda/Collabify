import React, { useState } from 'react';
import { sendFriendRequest } from '../api';
import './UserProfileCard.css';

const UserProfileCard = ({ user }) => {
  const [requestSent, setRequestSent] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleSendRequest = async () => {
    try {
      const response = await sendFriendRequest(user.id);
      if (response.success) {
        setRequestSent(true);
        showNotification("Friend request sent!");
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      showNotification("Failed to send request", true);
    }
  };

  const showNotification = (message, isError = false) => {
    setNotification({ message, isError });
    setTimeout(() => setNotification(null), 3000);
  };

  const renderUserTypeTag = (userType) => {
    const types = {
      "1": "Producer",
      "2": "Musician",
      "3": "Singer"
    };
    return <span className={`user-type-tag ${types[userType].toLowerCase()}`}>{types[userType]}</span>;
  };

  return (
    <div className="user-profile-card">
      {notification && (
        <div className={`notification ${notification.isError ? 'error' : 'success'}`}>
          {notification.message}
        </div>
      )}
      
      <div className="user-info">
        <h3>{user.username}</h3>
        {renderUserTypeTag(user.user_type)}
        {user.bio && <p className="bio">{user.bio}</p>}
      </div>
      
      <div className="user-actions">
        {!requestSent ? (
          <button 
            className="add-friend-button"
            onClick={handleSendRequest}
          >
            Add Friend
          </button>
        ) : (
          <span className="request-sent">Request Sent</span>
        )}
        <button className="view-profile-button">View Profile</button>
      </div>
    </div>
  );
};

export default UserProfileCard;