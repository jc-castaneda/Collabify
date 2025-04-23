import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { likePost, getPostImageUrl, getPostSongUrl } from '../api';
import '../styles/PostCard.css';

const PostCard = ({ post, refreshFeed }) => {
  const { id, title, description, creator, created_at, like_count, is_liked, genre } = post;
  const [imageError, setImageError] = useState(false);
  const [audioError, setAudioError] = useState(false);
  
  const handleLike = async (e) => {
    e.preventDefault(); // Prevent navigation to detail page
    
    try {
      await likePost(id);
      refreshFeed(); // Refresh the feed to update like count
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };
  
  // Format date
  const formattedDate = new Date(created_at).toLocaleDateString('en-US', {
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  });

  // Determine user type tag style
  const getUserTypeTag = (userType) => {
    const types = {
      1: "Producer",
      2: "Musician",
      3: "Singer",
    };
    
    return types[userType] || "User";
  };

  return (
    <Link to={`/posts/${id}`} className="post-card">
      <div className="post-header">
        <div className="post-creator-info">
          <div className="creator-avatar">
            {creator.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="creator-name">{creator.username}</h3>
            <span className="user-type-tag">{getUserTypeTag(creator.user_type)}</span>
          </div>
        </div>
        <span className="post-date">{formattedDate}</span>
      </div>
      
      <h2 className="post-title">{title}</h2>
      
      {post.image && !imageError && (
        <div className="post-image">
          <img 
            src={getPostImageUrl(id)} 
            alt={title} 
            onError={(e) => {
              console.error("Image failed to load");
              setImageError(true);
            }}
          />
        </div>
      )}
      
      {post.song && !audioError && (
        <div className="post-audio">
          <audio 
            controls
            onError={(e) => {
              console.error("Audio failed to load");
              setAudioError(true);
            }}
          >
            <source src={getPostSongUrl(id)} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
      
      {audioError && (
        <div className="media-error">
          <p>Audio file could not be loaded. Click to view details.</p>
        </div>
      )}
      
      <p className="post-description">{description}</p>
      
      {genre && <div className="post-genre">Genre: {genre}</div>}
      
      <div className="post-footer">
        <button 
          className={`like-button ${is_liked ? 'liked' : ''}`} 
          onClick={handleLike}
        >
          <span className="like-icon">♥</span>
          <span className="like-count">{like_count}</span>
        </button>
        <div className="comments-preview">
          <span className="comment-icon">💬</span>
          View Comments
        </div>
      </div>
    </Link>
  );
};

export default PostCard;