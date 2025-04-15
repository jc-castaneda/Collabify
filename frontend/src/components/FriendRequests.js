import React, { useState, useEffect } from 'react';
import { fetchFriendRequests, fetchFriends, acceptFriendRequest, rejectFriendRequest } from '../api';
import './FriendRequests.css';

const FriendRequests = () => {
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [requestsData, friendsData] = await Promise.all([
          fetchFriendRequests(),
          fetchFriends()
        ]);
        
        setFriendRequests(requestsData);
        setFriends(friendsData);
        setLoading(false);
      } catch (error) {
        console.error("Error loading friend data:", error);
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleAccept = async (requestId) => {
    try {
      const response = await acceptFriendRequest(requestId);
      if (response.success) {
        // Update the UI by removing the accepted request
        setFriendRequests(prevRequests => 
          prevRequests.filter(request => request.id !== requestId)
        );
        
        // Find the user from the request and add to friends list
        const acceptedRequest = friendRequests.find(req => req.id === requestId);
        if (acceptedRequest) {
          setFriends(prevFriends => [...prevFriends, acceptedRequest.from]);
        }
        
        showNotification("Friend request accepted!");
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
      showNotification("Failed to accept request", true);
    }
  };

  const handleReject = async (requestId) => {
    try {
      const response = await rejectFriendRequest(requestId);
      if (response.success) {
        // Update the UI by removing the rejected request
        setFriendRequests(prevRequests => 
          prevRequests.filter(request => request.id !== requestId)
        );
        showNotification("Friend request rejected");
      }
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      showNotification("Failed to reject request", true);
    }
  };

  const showNotification = (message, isError = false) => {
    setNotification({ message, isError });
    setTimeout(() => setNotification(null), 3000);
  };

  if (loading) return <div className="friend-requests-loading">Loading...</div>;

  const renderUserTypeTag = (userType) => {
    const types = {
      "1": "Producer",
      "2": "Musician",
      "3": "Singer"
    };
    return <span className={`user-type-tag ${types[userType].toLowerCase()}`}>{types[userType]}</span>;
  };

  return (
    <div className="friend-requests-container">
      {notification && (
        <div className={`notification ${notification.isError ? 'error' : 'success'}`}>
          {notification.message}
        </div>
      )}
      
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Friend Requests {friendRequests.length > 0 && <span className="badge">{friendRequests.length}</span>}
        </button>
        <button 
          className={`tab ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          Friends
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'requests' && (
          <div className="requests-list">
            <h2>Friend Requests</h2>
            {friendRequests.length === 0 ? (
              <p className="no-requests">No pending friend requests</p>
            ) : (
              friendRequests.map(request => (
                <div key={request.id} className="request-card">
                  <div className="user-info">
                    <h3>{request.from.username}</h3>
                    {renderUserTypeTag(request.from.user_type)}
                  </div>
                  <div className="request-actions">
                    <button 
                      className="accept-button"
                      onClick={() => handleAccept(request.id)}
                    >
                      Accept
                    </button>
                    <button 
                      className="reject-button"
                      onClick={() => handleReject(request.id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="friends-list">
            <h2>Your Friends</h2>
            {friends.length === 0 ? (
              <p className="no-friends">You don't have any friends yet</p>
            ) : (
              friends.map(friend => (
                <div key={friend.id} className="friend-card">
                  <div className="user-info">
                    <h3>{friend.username}</h3>
                    {renderUserTypeTag(friend.user_type)}
                    {friend.bio && <p className="bio">{friend.bio}</p>}
                  </div>
                  <div className="friend-actions">
                    <button className="message-button">Message</button>
                    <button className="view-profile-button">View Profile</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendRequests;