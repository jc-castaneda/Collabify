import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchConversations, fetchFriends } from '../api';
import '../styles/MessagesPage.css';

const MessagesPage = () => {
  const [conversations, setConversations] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [conversationsData, friendsData] = await Promise.all([
          fetchConversations(),
          fetchFriends()
        ]);
        
        setConversations(conversationsData);
        
        // Filter friends who are not already in conversations
        const conversationUserIds = conversationsData.map(conv => conv.user.id);
        const filteredFriends = friendsData.filter(friend => 
          !conversationUserIds.includes(friend.id)
        );
        
        setFriends(filteredFriends);
        setError(null);
      } catch (err) {
        console.error('Error loading conversations:', err);
        setError('Failed to load conversations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // Today, show time
    if (diff < 24 * 60 * 60 * 1000 && 
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      });
    }
    
    // Yesterday
    if (diff < 48 * 60 * 60 * 1000 &&
        date.getDate() === now.getDate() - 1 &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()) {
      return 'Yesterday';
    }
    
    // Within a week, show day name
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    
    // More than a week ago, show date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };
  
  const getUserTypeTag = (userType) => {
    const types = {
      1: "Producer",
      2: "Musician",
      3: "Singer",
    };
    
    return types[userType] || "User";
  };
  
  const handleStartConversation = (userId) => {
    navigate(`/messages/${userId}`);
  };
  
  if (loading) {
    return (
      <div className="messages-loading">
        <div className="loading-spinner"></div>
        <p>Loading conversations...</p>
      </div>
    );
  }
  
  return (
    <div className="messages-page">
      <div className="messages-container">
        <div className="messages-header">
          <h1>Messages</h1>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        {conversations.length === 0 && friends.length === 0 ? (
          <div className="no-messages">
            <p>You don't have any messages yet.</p>
            <p>Connect with other musicians on Collabify to start collaborating!</p>
            <Link to="/profiles" className="discover-button">
              Discover Musicians
            </Link>
          </div>
        ) : (
          <>
            {conversations.length > 0 && (
              <div className="conversations-list">
                <h2>Recent Conversations</h2>
                
                {conversations.map(conversation => (
                  <Link 
                    to={`/messages/${conversation.user.id}`}
                    className="conversation-item"
                    key={conversation.user.id}
                  >
                    <div className="user-avatar">
                      {conversation.user.username.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="conversation-content">
                      <div className="conversation-header">
                        <h3 className="user-name">{conversation.user.username}</h3>
                        <span className="user-type">
                          {getUserTypeTag(conversation.user.user_type)}
                        </span>
                      </div>
                      
                      <p className="last-message">
                        {conversation.last_message.length > 50
                          ? conversation.last_message.substring(0, 50) + '...'
                          : conversation.last_message}
                      </p>
                    </div>
                    
                    <div className="conversation-meta">
                      <span className="message-time">
                        {formatDate(conversation.last_message_time)}
                      </span>
                      
                      {conversation.unread_count > 0 && (
                        <span className="unread-badge">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
            
            {friends.length > 0 && (
              <div className="friends-list">
                <h2>Start a Conversation</h2>
                
                <div className="friends-grid">
                  {friends.map(friend => (
                    <div 
                      className="friend-card"
                      key={friend.id}
                      onClick={() => handleStartConversation(friend.id)}
                    >
                      <div className="friend-avatar">
                        {friend.username.charAt(0).toUpperCase()}
                      </div>
                      
                      <div className="friend-info">
                        <h3 className="friend-name">{friend.username}</h3>
                        <span className="friend-type">
                          {getUserTypeTag(friend.user_type)}
                        </span>
                      </div>
                      
                      <button className="message-button">
                        Message
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;