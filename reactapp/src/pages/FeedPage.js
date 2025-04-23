import React, { useState, useEffect } from 'react';
import { fetchPosts } from '../api';
import PostCard from '../components/PostCard';
import CreatePostButton from '../components/CreatePostButton';
import '../styles/Feed.css';

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const postsData = await fetchPosts();
      setPosts(postsData);
      setError(null);
    } catch (err) {
      setError("Failed to load posts. Please try again later.");
      console.error("Error loading posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <div className="feed-container">
      <div className="feed-header">
        <h1>Music Feed</h1>
        <CreatePostButton refreshFeed={loadPosts} />
      </div>
      
      {loading && (
        <div className="feed-loading">
          <div className="loading-spinner"></div>
          <p>Loading posts...</p>
        </div>
      )}
      
      {error && (
        <div className="feed-error">
          <p>{error}</p>
          <button onClick={loadPosts} className="retry-button">Try Again</button>
        </div>
      )}
      
      {!loading && !error && posts.length === 0 && (
        <div className="feed-empty">
          <p>No posts yet. Be the first to share your music!</p>
        </div>
      )}
      
      <div className="posts-grid">
        {posts.map(post => (
          <PostCard key={post.id} post={post} refreshFeed={loadPosts} />
        ))}
      </div>
    </div>
  );
};

export default FeedPage;