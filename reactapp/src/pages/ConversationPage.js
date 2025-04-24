import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchMessages, sendMessage, getUserInfo } from '../api';
import '../styles/ConversationPage.css';

const ConversationPage = () => {
  const { userId } = useParams();
  const [messages, setMessages] = useState([]);
  const [receiver, setReceiver] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);
  const messageListRef = useRef(null);
  
  // Initial loading of messages and user info
  useEffect(() => {
    const loadConversation = async () => {
      try {
        setLoading(true);
        const [messagesData, userInfo] = await Promise.all([
          fetchMessages(userId),
          getUserInfo(userId)
        ]);
        
        setMessages(messagesData);
        setReceiver(userInfo);
        setError(null);
      } catch (err) {
        console.error('Error loading conversation:', err);
        setError('Failed to load conversation. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadConversation();
    
    // Set up polling for new messages
    const pollInterval = setInterval(() => {
      if (!sending) {
        fetchMessages(userId)
          .then(messagesData => {
            if (messagesData.length !== messages.length) {
              setMessages(messagesData);
            }
          })
          .catch(err => console.error('Error polling messages:', err));
      }
    }, 5000); // Poll every 5 seconds
    
    return () => clearInterval(pollInterval);
  }, [userId, sending]);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      setSending(true);
      
      await sendMessage(userId, newMessage);
      
      // Refresh messages
      const messagesData = await fetchMessages(userId);
      setMessages(messagesData);
      
      // Clear input
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };
  
  const formatMessageTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };
  
  const formatMessageDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Check if we need to show date separator
  const shouldShowDate = (message, index) => {
    if (index === 0) return true;
    
    const currentDate = new Date(message.created_at).toDateString();
    const prevDate = new Date(messages[index - 1].created_at).toDateString();
    
    return currentDate !== prevDate;
  };
  
  // Group messages by sender
  const renderMessageGroups = () => {
    let result = [];
    let currentGroup = [];
    let lastSender = null;
    
    messages.forEach((message, index) => {
      // Check if we need to show date
      if (shouldShowDate(message, index)) {
        if (currentGroup.length > 0) {
          result.push(
            <div 
              key={`group-${lastSender}-${index}`} 
              className={`message-group ${lastSender === 'self' ? 'self' : 'other'}`}
            >
              {currentGroup}
            </div>
          );
          currentGroup = [];
        }
        
        result.push(
          <div key={`date-${index}`} className="date-separator">
            <span>{formatMessageDate(message.created_at)}</span>
          </div>
        );
      }
      
      // Check if new sender
      if (lastSender !== (message.is_self ? 'self' : 'other') && currentGroup.length > 0) {
        result.push(
          <div 
            key={`group-${lastSender}-${index}`} 
            className={`message-group ${lastSender === 'self' ? 'self' : 'other'}`}
          >
            {currentGroup}
          </div>
        );
        currentGroup = [];
      }
      
      lastSender = message.is_self ? 'self' : 'other';
      
      currentGroup.push(
        <div key={message.id} className="message">
          <div className="message-content">{message.content}</div>
          <div className="message-time">{formatMessageTime(message.created_at)}</div>
        </div>
      );
    });
    
    // Add last group
    if (currentGroup.length > 0) {
      result.push(
        <div 
          key={`group-${lastSender}-last`} 
          className={`message-group ${lastSender === 'self' ? 'self' : 'other'}`}
        >
          {currentGroup}
        </div>
      );
    }
    
    return result;
  };
  
  if (loading) {
    return (
      <div className="conversation-loading">
        <div className="loading-spinner"></div>
        <p>Loading conversation...</p>
      </div>
    );
  }
  
  return (
    <div className="conversation-page">
      <div className="conversation-container">
        <div className="conversation-header">
          <Link to="/messages" className="back-link">
            ← Messages
          </Link>
          
          {receiver && (
            <div className="conversation-user">
              <div className="user-avatar">
                {receiver.username.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <h2>{receiver.username}</h2>
              </div>
            </div>
          )}
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="messages-list" ref={messageListRef}>
          {messages.length === 0 ? (
            <div className="no-messages">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <>
              {renderMessageGroups()}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        
        <form className="message-form" onSubmit={handleSendMessage}>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <button 
            type="submit" 
            className="send-button"
            disabled={sending || !newMessage.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConversationPage;